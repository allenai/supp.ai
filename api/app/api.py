from flask import Flask, Blueprint, request, current_app, Response
from random import randint
from typing import Tuple, List, Dict
from json import dumps
from time import sleep
from app.data import InteractionIndex, InteractionId
from logging import getLogger
import simplejson
import os


def create_api(idx: InteractionIndex) -> Blueprint:
    """
    Creates an instance of your API. If you'd like to toggle behavior based on
    command line flags or other inputs, add them as arguments to this function.
    """
    api = Blueprint("api", __name__)

    logger = getLogger(__name__)

    def error(message: str, status: int = 400) -> Response:
        return Response(
            simplejson.dumps({"error": message}),
            status,
            content_type="application/json",
        )

    # This route simply tells anything that depends on the API that it's
    # working. If you'd like to redefine this behavior that's ok, just
    # make sure a 200 is returned.
    @api.route("/")
    def index() -> Response:
        return Response("", 204)

    @api.route("/interaction/<string:iid>", methods=["GET"])
    def get_interaction(iid: str) -> Response:
        interaction_id = InteractionId.from_str(iid)
        first_agent_id, second_agent_id = interaction_id.cuis
        response = simplejson.dumps(
            {
                "interaction_id": str(interaction_id),
                "slug": idx.get_interaction_id_slug(interaction_id),
                "agents": [
                    idx.get_agent(first_agent_id),
                    idx.get_agent(second_agent_id),
                ],
                "evidence": idx.get_evidence(interaction_id),
            }
        )
        return Response(response, 200, content_type="application/json")

    @api.route("/agent/<string:cui>", methods=["GET"])
    def get_agent_by_cui(cui: str) -> Response:
        agent = idx.get_agent_with_interaction_count(cui)
        if agent is None:
            return error("Not Found", 404)
        return Response(simplejson.dumps(agent), 200, content_type="application/json")

    @api.route("/agent/<string:cui>/interactions", methods=["GET"])
    def get_agent_interactions(cui: str) -> Response:
        agent = idx.get_agent(cui)
        if agent is None:
            return error("Not Found", 404)
        try:
            # The page parameter starts at 1 on the client, and 0 on the
            # server.
            page = int(request.args.get("p", default=1)) - 1
        except ValueError:
            return error("Invalid value for 'p'.", 400)
        all_interactions = idx.get_interactions(agent)
        q = request.args.get("q", default="").lower().strip()
        if q != "":
            matches = []
            for interaction in all_interactions:
                if interaction.agent.preferred_name.lower().startswith(q) > 0:
                    matches.append(interaction)
            interactions = matches
        else:
            interactions = all_interactions
        interactions_per_page = 50
        start = page * interactions_per_page
        end = start + interactions_per_page
        interactions_page = interactions[start : min(len(interactions), end)]
        return Response(
            simplejson.dumps(
                {
                    "page": page + 1,
                    "interactions": interactions_page,
                    "interactions_per_page": interactions_per_page,
                    "total": len(interactions),
                }
            ),
            200,
            content_type="application/json",
        )

    @api.route("/agent/suggest", methods=["GET"])
    def suggest_agents() -> Response:
        query = request.args.get("q", default=None)
        size = request.args.get("s", default="5")
        if query is None:
            return error("The q argument is required")
        search_results = idx.search_for_agents(
            query, ["preferred_name", "synonyms", "tradenames"], num_per_page=size
        )
        #
        # We "re-rank" the results from Algolia to:
        # - Bubble items with no-interactions to the end of the list
        # - Prioritize exact matches over fuzzy ones
        #
        exact_match_results = []
        results_with_interactions = []
        results_without_interactions = []
        for result in search_results.results:
            names = set(
                [result.preferred_name.lower()]
                + list(map(lambda s: s.lower(), result.synonyms))
                + list(map(lambda s: s.lower(), result.tradenames))
            )
            if query in names:
                exact_match_results.append(result)
            elif result.interacts_with_count == 0:
                results_without_interactions.append(result)
            else:
                results_with_interactions.append(result)
        sorted_results = (
            exact_match_results
            + results_with_interactions
            + results_without_interactions
        )
        response = simplejson.dumps(
            {"query": {"q": search_results.query}, "results": sorted_results}
        )
        return Response(response, 200, content_type="application/json")

    @api.route("/agent/search", methods=["GET"])
    def search_agents() -> Response:
        query = request.args.get("q", default=None)
        try:
            page = int(request.args.get("p", default=0))
        except ValueError:
            return error("Invalid value for 'p'.", 400)
        if query is None:
            return error("The q argument is required")
        search_results = idx.search_for_agents(query, page=page)
        response = simplejson.dumps(
            {
                "query": {"q": search_results.query, "p": search_results.page},
                "results": search_results.results,
                "total_pages": search_results.total_pages,
                "total_results": search_results.total_results,
                "num_per_page": search_results.num_per_page,
            }
        )
        return Response(response, 200, content_type="application/json")

    @api.route("/meta", methods=["GET"])
    def meta() -> Response:
        return Response(
            simplejson.dumps(
                {
                    "version": idx.version,
                    "interaction_count": idx.interaction_count,
                    "agent_count": idx.agent_count,
                    "supp_count": idx.supp_count,
                    "drug_count": idx.drug_count,
                    **idx.index_meta._asdict(),
                }
            ),
            200,
        )

    return api
