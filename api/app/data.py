from typing import Iterable, List, Dict, Optional, Tuple, Union, NamedTuple
from json import load
from os import path, environ
from logging import getLogger
from algoliasearch.search_client import SearchClient  # type:ignore
from re import sub, split, fullmatch, sub
from urllib.parse import quote_plus
from math import floor

logger = getLogger(__name__)


def slug(text: str) -> str:
    """
    Returns a url safe slug, derived from the provided text.
    """
    return quote_plus(sub(r"[\W_]", "-", text.lower()))


class Agent(NamedTuple):
    """
    Model for a supplement or drug, or rather an individual agent that's
    associated with an interaction.

    Each agent has a cui, or "Concept Unique Identifier" which is a stable
    identifier derived from a medical ontology.

    Each agent has an `ent_type` member, which is a string indicating if it's
    a "supplement", "drug" or "other" (we don't know what it is).
    """

    cui: str
    preferred_name: str
    synonyms: List[str]
    definition: str
    ent_type: str
    slug: str


class AgentWithInteractionCount(NamedTuple):
    """
    Model for an agent with the number of interactions but not the actual
    interactions themselves. This is intended for use with search results
    to make the response smaller.
    """

    cui: str
    preferred_name: str
    synonyms: List[str]
    definition: str
    ent_type: str
    slug: str
    interacts_with_count: int


class SupportingSentenceArg(NamedTuple):
    """
    Model capturing a span in the associated sentence where a particular CUI
    is mentioned. This is to be used to highlight the mentioned agent in the
    UI.
    """

    cui: str
    span: Tuple[int, int]

    @staticmethod
    def from_json(fields: Dict) -> "SupportingSentenceArg":
        # The data we source uses "id" instead of "cui", we normalize this
        # for consistency with the rest of the codebase.
        normalized = {"cui": fields["id"], **fields}
        del normalized["id"]
        return SupportingSentenceArg(**normalized)


class SupportingSentenceSpan(NamedTuple):
    """
    Model for a span in a supporting sentence. A span is a portion of text in
    a sentence. If the span has a cui, then it's text that mentions a specific
    agent.
    """

    text: str
    cui: Optional[str]


class PaperAuthor(NamedTuple):
    """
    Model for a paper author.
    """

    first: Optional[str]
    middle: Optional[str]
    last: Optional[str]
    suffix: Optional[str]


class Paper(NamedTuple):
    """
    Model capturing metatdata about a Semantic Scholar paper.
    """

    pid: str
    title: str
    authors: List[PaperAuthor]
    year: Optional[int]
    venue: Optional[str]
    doi: Optional[str]
    pmid: Optional[int]
    fields_of_study: List[str]
    animal_study: str
    human_study: str
    retraction: str
    clinical_study: str

    @staticmethod
    def from_json(fields: Dict) -> "Paper":
        authors = [PaperAuthor(**a) for a in fields["authors"]]
        with_authors: Dict = {**fields, "authors": authors}
        return Paper(**with_authors)


class SupportingSentence(NamedTuple):
    """
    Model for a sentence, from a paper, where two agents that interact with
    another are both mentioned.
    """

    uid: int
    confidence: Optional[int]
    paper_id: str
    sentence_id: int
    # TODO: Truncate to acceptable character length, per publisher agreements
    spans: List[SupportingSentenceSpan]

    @staticmethod
    def from_json(fields: Dict) -> "SupportingSentence":
        # We convert each sentence into a list of spans, where each span
        # is the text from that portion of the sentence and an optional cui.
        # If a cui is set, it means the span constitutes a mention of an
        # agent in the sentence. So, for instance, if we had the sentence
        # "I drink water, after eating donuts" and our agents were "water",
        # and "donuts", we'd produce the spans:
        # [
        #   { text: "I drink ", cui: None },
        #   { text: "water", cui: "C123456" },
        #   { text: ", after eating ", cui: None },
        #   { text: "donuts", cui: "C654321" }
        # ]
        arg1 = SupportingSentenceArg.from_json(fields["arg1"])
        arg2 = SupportingSentenceArg.from_json(fields["arg2"])

        # Order the mentions (we'll always have two) by the lower index,
        # so that we can process them in order
        args_ordered_by_index = [arg1, arg2]
        args_ordered_by_index.sort(key=lambda arg: arg.span[0])
        [first, second] = args_ordered_by_index

        # Put together our sentence spans
        sentence: str = fields["sentence"]
        spans = [
            SupportingSentenceSpan(
                sentence[0 : first.span[0] - 1 if first.span[0] > 0 else 0], None
            ),
            SupportingSentenceSpan(sentence[first.span[0] : first.span[1]], first.cui),
            SupportingSentenceSpan(sentence[first.span[1] : second.span[0]], None),
            SupportingSentenceSpan(
                sentence[second.span[0] : second.span[1]], second.cui
            ),
            SupportingSentenceSpan(sentence[second.span[1] :], None),
        ]

        # Some of the publishers S2 works with only allow us to display up to
        # 149 words. Rather than try to figure out if a paper is subject to
        # those restrictions, we just make sure we never display > 149 words.
        all_words = list(
            filter(lambda token: len(token.strip()) > 0, split(r"\W+", sentence))
        )
        word_count = len(all_words)
        if word_count > 149:
            diff = word_count - 149
            span_idx = 0
            span_count = len(spans)
            while diff > 0:
                span = spans[span_idx]
                # Don't remove entity mentions, as they're important to
                # maintain in the UI
                if span.cui is None:
                    # Split the text on
                    tokens = split(r"(\W+)", span.text)
                    token_count = len(tokens)
                    # Prefer tokens in the middle of a span, as these are
                    # further from the mentioned entity and are accordingly
                    # less likely to be important.
                    mid = floor(token_count / 2)
                    for idx in [*range(mid, token_count), *range(0, mid)]:
                        token = tokens[idx]
                        # We'll replace the first word we find.
                        if fullmatch(r"\w+", token):
                            tokens[idx] = "…"
                            diff -= 1
                            # Put together the text, and remove ellipsis that
                            # occur one after another.
                            text = sub(r"…\W+…", "…", "".join(tokens))
                            spans[span_idx] = SupportingSentenceSpan(text, None)
                            break
                span_idx += 1
                # Start over if we iterate over all spans and still need to
                # remove words.
                if span_idx == span_count:
                    span_idx = 0

        # If there's a span with *only* punctuation before or after a mentioned
        # entity collapse it with the bordering entity. Not doing so causes
        # weird wrapping issues in the UI.
        [prefix, first_entity, between, second_entity, tail] = spans
        if fullmatch(r"\W+", prefix.text):
            first_entity = SupportingSentenceSpan(
                f"{prefix.text}{first_entity.text}", first_entity.cui
            )
            prefix = None  # type:ignore
        if fullmatch(r"\W+", between.text):
            first_entity = SupportingSentenceSpan(
                f"{first_entity.text}{between.text}", first_entity.cui
            )
            between = None  # type:ignore
        if fullmatch(r"\W+", tail.text):
            second_entity = SupportingSentenceSpan(
                f"{second_entity.text}{tail.text}", second_entity.cui
            )
            tail = None  # type:ignore
        collapsed_spans = list(
            filter(
                lambda sp: sp != None,
                [prefix, first_entity, between, second_entity, tail],
            )
        )

        # Add the extra information we prepared
        with_spans: Dict = {**fields, "spans": collapsed_spans}

        # Remove fields that from the model that the UI doesn't use
        del with_spans["sentence"]
        del with_spans["arg1"]
        del with_spans["arg2"]

        return SupportingSentence(**with_spans)


class Evidence(NamedTuple):
    """
    Model for evidence, which represents a paper and the sentences from the
    paper that mention a particular agent.
    """

    paper: Paper
    sentences: List[SupportingSentence]


class InteractingAgent(NamedTuple):
    """
    Model defining an agent interaction. The agent in this case refers to the
    agent that the subject agent interacts with. The sentences are the extracted
    mentions that are evidence of the interaction.
    """

    interaction_id: str
    slug: str
    agent: Agent
    evidence: List[Evidence]


class AgentWithInteractions(NamedTuple):
    """
    Model for an agent and the agents it interacts with.
    """

    agent: Agent
    interacts_with: List[InteractingAgent]
    interacts_with_count: int


class InteractionId(NamedTuple):
    """
    Each interaction has an identifier that is produced by joining the cui
    of the interacting agents with a "-". When we load the index we parse
    this as to make it easier (and faster) to identify both agents.
    """

    cuis: Tuple[str, str]

    def __str__(self) -> str:
        [l, r] = self.cuis
        return f"{l}-{r}"

    @staticmethod
    def from_str(s: str) -> "InteractionId":
        parts = s.upper().split("-")
        if len(parts) != 2:
            raise RuntimeError(f"Malformed interaction id: {s}")
        [first, second] = parts
        return InteractionId((first, second))


class InteractionIdWithSlug(NamedTuple):
    interaction_id: InteractionId
    slug: str


class SearchResults(NamedTuple):
    """
    Model for agent search results.
    """

    results: List[AgentWithInteractionCount]
    total_results: int
    total_pages: int
    query: str
    page: int
    num_per_page: int


class InteractionIndex:
    """
    This class provides an API for looking up agents and the agents they
    interact with.
    """

    def __init__(
        self,
        version: str,
        agents_by_cui: Dict[str, Agent],
        sentences_by_interaction_id: Dict[InteractionId, List[SupportingSentence]],
        interaction_ids_by_cui: Dict[str, List[InteractionId]],
        paper_metadata_by_id: Dict[str, Paper],
    ):
        self.version = version
        self.agents_by_cui = agents_by_cui
        self.agent_count = len(self.agents_by_cui)
        self.sentences_by_interaction_id = sentences_by_interaction_id
        self.interaction_count = len(self.sentences_by_interaction_id)
        self.interaction_ids_by_cui = interaction_ids_by_cui
        self.cuis_by_name = InteractionIndex.build_agent_index(
            self.agents_by_cui.values()
        )
        self.algolia_client = SearchClient.create(
            "PEUZR5B1FW", environ["SUPP_AI_ALGOLIA_API_KEY"]
        )
        self.index = self.init_algolia_index()
        self.paper_metadata_by_id = paper_metadata_by_id

    def init_algolia_index(self):
        resp = self.algolia_client.list_indices()
        indices = set(map(lambda item: item["name"], resp["items"]))

        index_name = environ.get("SUPP_AI_INDEX_NAME", f"agent_{self.version}")
        idx = self.algolia_client.init_index(index_name)

        # We define the list of searchable fields everytime the application
        # starts up. There's no indication that this is expensive to do.
        idx.set_settings(
            {"searchableAttributes": ["preferred_name", "definition", "synonyms"]}
        )

        # Only load data into the index if the index doesn't exist. This acts
        # as a simple gate that prevents us from loading data everytime the
        # server starts.
        if index_name not in indices:
            batch = []
            for agent in self.agents_by_cui.values():
                agent_dict = agent._asdict()
                # This is the ID Algolia uses for deduplicating records.
                agent_dict["objectID"] = agent.cui
                batch.append(agent_dict)
                if len(batch) == 500:
                    idx.save_objects(batch)
                    batch = []
            if len(batch) > 0:
                idx.save_objects(batch)

        return idx

    def get_all_agents(self) -> List[Agent]:
        return list(self.agents_by_cui.values())

    def get_all_interactions(self) -> List[InteractionIdWithSlug]:
        return [
            InteractionIdWithSlug(iid, self.get_interaction_id_slug(iid))
            for iid in list(self.sentences_by_interaction_id)
        ]

    def get_agent(self, raw_cui: str) -> Optional[Agent]:
        """
        Returns an agent with the provided cui, if one exists. If no agent with
        the provided cui exists None is returned.
        """
        cui = raw_cui.upper()
        if cui not in self.agents_by_cui:
            return None
        return self.agents_by_cui[cui]

    def get_agent_with_interaction_count(
        self, cui: str
    ) -> Optional[AgentWithInteractionCount]:
        agent = self.get_agent(cui)
        if agent is None:
            return None
        interactions = self.get_interactions(agent)
        args = list(agent._asdict().values()) + [len(interactions)]
        return AgentWithInteractionCount(*args)

    def search_for_agents(
        self, query: str, only_fields: List[str] = None, page=0, num_per_page=10
    ) -> SearchResults:
        """
        Attempts to find agents related to the provided query text.
        """
        agents = []
        if only_fields is not None:
            params = {"restrictSearchableAttributes": only_fields}
        else:
            params = {}
        default_params = {"hitsPerPage": num_per_page, "page": page}
        resp = self.index.search(query, {**default_params, **params})
        for hit in resp["hits"]:
            agent = self.get_agent_with_interaction_count(hit["cui"])
            if agent is not None:
                agents.append(agent)
            else:
                logger.warn(f"Search result without a CUI: {hit}")
        return SearchResults(
            agents,
            resp["nbHits"],
            resp["nbPages"],
            resp["query"],
            resp["page"],
            resp["hitsPerPage"],
        )

    def get_evidence(self, interaction_id: InteractionId) -> List[Evidence]:
        if interaction_id not in self.sentences_by_interaction_id:
            return []
        sentences_by_paper_id: Dict[str, List[SupportingSentence]] = {}
        for sentence in self.sentences_by_interaction_id[interaction_id]:
            if sentence.paper_id not in sentences_by_paper_id:
                sentences_by_paper_id[sentence.paper_id] = []
            sentences_by_paper_id[sentence.paper_id].append(sentence)
        evidence = []
        for paper_id, sentences in sentences_by_paper_id.items():
            if paper_id in self.paper_metadata_by_id:

                def by_text(value: SupportingSentence) -> str:
                    return "".join(map(lambda s: s.text, value.spans)).strip()

                evidence.append(
                    Evidence(
                        self.paper_metadata_by_id[paper_id],
                        sorted(sentences, key=by_text),
                    )
                )
            else:
                logger.warn(f"Paper id without metadata: ${paper_id}")
        return evidence

    def get_interaction_id_slug(self, interaction_id: InteractionId) -> str:
        def get_slug(cui: str) -> str:
            a = self.get_agent(cui)
            if a is None:
                return ""
            return a.slug

        return "-".join(list(map(get_slug, interaction_id.cuis)))

    def get_interactions(self, agent: Agent) -> List[InteractingAgent]:
        """
        Returns the agents the provided agent interacts with.
        """
        interaction_ids = self.interaction_ids_by_cui[agent.cui]
        interactions = []
        for interaction_id in interaction_ids:
            interacting_agent_ids = list(
                filter(lambda iid: iid != agent.cui, interaction_id.cuis)
            )
            if len(interacting_agent_ids) == 1:
                [interacting_agent_id] = interacting_agent_ids
                interacting_agent = self.get_agent(interacting_agent_id)
                if interacting_agent is not None:
                    agent_with_interaction = InteractingAgent(
                        str(interaction_id),
                        self.get_interaction_id_slug(interaction_id),
                        interacting_agent,
                        sorted(
                            self.get_evidence(interaction_id),
                            key=lambda evd: (
                                evd.paper.retraction,
                                not evd.paper.clinical_study,
                                not evd.paper.human_study,
                                not evd.paper.animal_study,
                                -1.0 * evd.paper.year if evd.paper.year else 0.0,
                                evd.paper.title.lower(),
                            ),
                        ),
                    )
                    interactions.append(agent_with_interaction)
                else:
                    logger.warn(
                        f"Interaction id that references a missing CUI: {interacting_agent_id}, IID: {interaction_id}"
                    )
            else:
                logger.warn(
                    f"Malformed interaction id: {interaction_id}, agent CUI: {agent.cui}"
                )

        return sorted(interactions, key=lambda intr: len(intr.evidence), reverse=True)

    @staticmethod
    def from_data(archive_name: str, data_dir: str) -> "InteractionIndex":
        return InteractionIndex(
            archive_name.split(".")[0],
            InteractionIndex.load_agents_by_cui(data_dir),
            InteractionIndex.load_sentences_by_interaction_id(data_dir),
            InteractionIndex.load_interaction_ids_by_cui(data_dir),
            InteractionIndex.load_paper_metadata(data_dir),
        )

    @staticmethod
    def load_agents_by_cui(data_dir: str) -> Dict[str, Agent]:
        agents_by_cui: Dict[str, Agent] = {}
        with open(path.join(data_dir, "cui_metadata.json")) as fp:
            raw = load(fp)
            for [raw_cui, fields] in raw.items():
                cui = raw_cui.upper()
                if cui in agents_by_cui:
                    raise RuntimeError(f"Duplicate cui: {cui}")
                agents_by_cui[cui] = Agent(
                    **{**{"cui": cui, "slug": slug(fields["preferred_name"])}, **fields}
                )
        return agents_by_cui

    @staticmethod
    def load_sentences_by_interaction_id(
        data_dir: str
    ) -> Dict[InteractionId, List[SupportingSentence]]:
        sentences_by_interaction_id: Dict[InteractionId, List[SupportingSentence]] = {}
        with open(path.join(data_dir, "sentence_dict.json")) as fp:
            raw = load(fp)
            for [interaction_id_str, sentences] in raw.items():
                interaction_id = InteractionId.from_str(interaction_id_str)
                if interaction_id in sentences_by_interaction_id:
                    raise RuntimeError(f"Duplicate interaction id: {interaction_id}")
                sentences_by_interaction_id[interaction_id] = list(
                    map(SupportingSentence.from_json, sentences)
                )
        return sentences_by_interaction_id

    @staticmethod
    def load_interaction_ids_by_cui(data_dir: str) -> Dict[str, List[InteractionId]]:
        interaction_ids_by_cui: Dict[str, List[InteractionId]] = {}
        with open(path.join(data_dir, "interaction_id_dict.json")) as fp:
            raw = load(fp)
            for [cui, interaction_ids] in raw.items():
                if cui in interaction_ids_by_cui:
                    raise RuntimeError(f"Duplicate cui: {cui}")
                interaction_ids_by_cui[cui] = list(
                    map(InteractionId.from_str, interaction_ids)
                )
        return interaction_ids_by_cui

    @staticmethod
    def build_agent_index(agents: Iterable[Agent]) -> Dict[str, List[str]]:
        cuis_by_name: Dict[str, List[str]] = {}
        for agent in agents:
            for name in set([agent.preferred_name] + agent.synonyms):
                normalized_name = name.strip().lower()
                if normalized_name not in cuis_by_name:
                    cuis_by_name[normalized_name] = []
                cuis_by_name[normalized_name].append(agent.cui)
        return cuis_by_name

    @staticmethod
    def load_paper_metadata(data_dir: str) -> Dict[str, Paper]:
        papers_by_id: Dict[str, Paper] = {}
        with open(path.join(data_dir, "paper_metadata.json")) as fp:
            raw = load(fp)
            for [paper_id, paper] in raw.items():
                if paper_id in papers_by_id:
                    raise RuntimeError(f"Duplicate paper: ${paper_id}")
                papers_by_id[paper_id] = Paper.from_json({**paper, "pid": paper_id})
        return papers_by_id
