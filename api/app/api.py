from flask import Flask, Blueprint, request, current_app, Response
from random import randint
from typing import Tuple, List, Dict
from json import dumps
from time import sleep
from app.data import InteractionIndex
from logging import getLogger
import simplejson
import os


def create_api(data_dir: str) -> Blueprint:
    """
    Creates an instance of your API. If you'd like to toggle behavior based on
    command line flags or other inputs, add them as arguments to this function.
    """
    api = Blueprint("api", __name__)

    logger = getLogger(__name__)

    idx = InteractionIndex.from_data(os.environ["SUPPAI_DATA_ARCHIVE"], data_dir)

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

    @api.route("/agent/<string:cui>", methods=["GET"])
    def get_agent_by_cui(cui: str) -> Response:
        agent = idx.get_agent(cui)
        if agent is None:
            return error("Not Found", 404)
        return Response(
            simplejson.dumps(idx.get_interactions(agent)),
            200,
            content_type="application/json",
        )

    @api.route("/agent/search", methods=["GET"])
    def search_agents() -> Response:
        query = request.args.get("q", default=None)
        if query is None:
            return error("q is required")
        agents = idx.find_agents_by_name(query)
        results = [idx.get_interactions(agent)._asdict() for agent in agents]
        response = simplejson.dumps(
            {"query": {"q": query}, "results": results, "total": len(results)}
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
                }
            ),
            200,
        )

    return api
