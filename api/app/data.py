from typing import Iterable, List, Dict, Optional, Tuple, Union, NamedTuple
from json import load
from os import path, environ
from logging import getLogger
from algoliasearch.search_client import SearchClient # type:ignore

logger = getLogger(__name__)

#
# TODO:
#   - [ ] Don't always reindex all values
#   - [ ] Separate indices for dev, prod, etc
#   - [ ] Buy an account / investigate pricing?
#   - [ ] Only index what's required for search
#

class Agent(NamedTuple):
    """
    Model for a supplement or drug, or rather an individual agent that's
    associated with an interaction.

    Each agent has a cui, or "Concept Unique Identifier" which is a stable
    identifier derived from a medical ontology.
    """

    cui: str
    preferred_name: str
    synonyms: List[str]
    definition: str
    # True the agent is a supplment, False if the agent is a drug / pharmaceutical
    is_supp: bool


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


class SupportingSentence(NamedTuple):
    """
    Model for a sentence, from a paper, where two agents that interact with
    another are both mentioned.
    """

    uid: int
    confidence: Optional[int]
    paper_id: str
    sentence_id: int
    # TODO: Ellipsize to acceptable character lenght, per publisher agreements
    sentence: str
    arg1: SupportingSentenceArg
    arg2: SupportingSentenceArg

    @staticmethod
    def from_json(fields: Dict) -> "SupportingSentence":
        arg1 = SupportingSentenceArg.from_json(fields["arg1"])
        arg2 = SupportingSentenceArg.from_json(fields["arg2"])
        normalized: Dict = {**fields, "arg1": arg1, "arg2": arg2}
        return SupportingSentence(**normalized)


class InteractingAgent(NamedTuple):
    """
    Model defining an agent interaction. The agent in this case refers to the
    agent that the subject agent interacts with. The sentences are the extracted
    mentions that are evidence of the interaction.
    """

    agent: Agent
    sentences: List[SupportingSentence]


class Interactions(NamedTuple):
    """
    Model for an agent and the agents it interacts with.
    """

    agent: Agent
    interacts_with: List[InteractingAgent]


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
    def from_str(str: str) -> "InteractionId":
        parts = str.split("-")
        if len(parts) != 2:
            raise RuntimeError(f"Malformed interaction id: {str}")
        [first, second] = parts
        return InteractionId((first, second))


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
            "YZ85FPO05E", environ["SUPPAI_ALGOLIA_API_KEY"]
        )
        self.index = self.init_algolia_index()

    def init_algolia_index(self):
        index_name = f"agent_{self.version}"
        idx = self.algolia_client.init_index(index_name)
        batch = []
        for agent in self.agents_by_cui.values():
            agent_dict = agent._asdict()
            agent_dict["objectID"] = agent.cui
            batch.append(agent_dict)
            if len(batch) == 100:
                idx.save_objects(batch)
                batch = []
        if len(batch) > 0:
            idx.save_objects(batch)
        return idx

    def get_agent(self, cui: str) -> Optional[Agent]:
        """
        Returns an agent with the provided cui, if one exists. If no agent with
        the provided cui exists None is returned.
        """
        return self.agents_by_cui[cui]

    def find_agents_by_name(self, name: str) -> List[Agent]:
        """
        Attempts to find agents with the provided name. Only exact matches
        are returned.
        """
        agents = []
        resp = self.index.search(name)
        for hit in resp["hits"]:
            agent = self.get_agent(hit["cui"])
            assert agent is not None
            agents.append(agent)
        return agents

    def get_interactions(self, agent: Agent) -> Interactions:
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
                assert interacting_agent is not None
                interactions.append(
                    InteractingAgent(
                        interacting_agent,
                        self.sentences_by_interaction_id[interaction_id],
                    )
                )
            else:
                logger.warn(f"Malformed interaction id: {interaction_id}")

        return Interactions(agent, interacts_with=interactions)

    @staticmethod
    def from_data(archive_name: str, data_dir: str) -> "InteractionIndex":
        return InteractionIndex(
            archive_name.split(".")[0],
            InteractionIndex.load_agents_by_cui(data_dir),
            InteractionIndex.load_sentences_by_interaction_id(data_dir),
            InteractionIndex.load_interaction_ids_by_cui(data_dir),
        )

    @staticmethod
    def load_agents_by_cui(data_dir: str) -> Dict[str, Agent]:
        agents_by_cui: Dict[str, Agent] = {}
        with open(path.join(data_dir, "cui_metadata.json")) as fp:
            raw = load(fp)
            for [cui, fields] in raw.items():
                if cui in agents_by_cui:
                    raise RuntimeError(f"Duplicate cui: {cui}")
                agents_by_cui[cui] = Agent(**{**{"cui": cui}, **fields})
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
                    raise RuntimeError(f"Duplicate interaction id : {interaction_id}")
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
                    raise RuntimeError(f"Duplicate cui : {cui}")
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
