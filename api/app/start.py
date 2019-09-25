import argparse
import os
import sys
import logging
from typing import Tuple, Iterable, Optional, List
from gevent.pywsgi import WSGIServer  # type: ignore
from flask import Flask, Response, request, jsonify
from jinja2 import Environment, FileSystemLoader
from app.api import create_api
from app.utils import StackdriverJsonFormatter
from app.data import InteractionIndex


def start(data_dir: str, port: int, prod: bool):
    """
    Starts up a HTTP server attached to the provider port, and optionally
    in development mode (which is ideal for local development but unideal
    for production use).
    """

    logging_config = {
        "level": getattr(logging, os.environ.get("LOG_LEVEL", default="INFO"))
    }

    # If we're in production we setup a handler that writes JSON log messages
    # in a format that Google likes.
    if args.prod:
        json_handler = logging.StreamHandler()
        json_handler.setFormatter(StackdriverJsonFormatter())
        logging_config["handlers"] = [json_handler]

    logging.basicConfig(**logging_config)

    logger = logging.getLogger(__name__)
    logger.debug("AHOY! Let's get this boat out to water...")

    logger.debug("Starting: init agent index...")
    idx = InteractionIndex.from_data(os.environ["SUPPAI_DATA_ARCHIVE"], data_dir)
    logger.debug("Complete: init agent index...")

    logger.debug("Starting: generate sitemap...")
    agents = idx.get_all_agents()
    origin = os.environ["SUPP_AI_CANONICAL_ORIGIN"]
    agent_urls = list(map(lambda agent: f"{origin}/a/{agent.slug}/{agent.cui}", agents))
    interactions = idx.get_all_interactions()
    interaction_urls = list(
        map(
            lambda interaction: f"{origin}/i/{interaction.slug}/{str(interaction.interaction_id)}",
            interactions,
        )
    )
    urls = [origin] + agent_urls + interaction_urls
    static_dir = os.environ.get("SUPP_AI_STATIC_DIR", os.path.abspath("static"))
    templates = Environment(
        loader=FileSystemLoader(os.path.join(os.path.dirname(__file__), "templates"))
    )
    sitemap_files: List[str] = []
    url_batch = []
    sitemap_tmpl = templates.get_template("sitemap.xml")

    def write_sitemap(batch: List[str]):
        filename = f"sitemap-{len(sitemap_files)}.xml"
        sitemap_files.append(f"{origin}/sitemap/{filename}")
        file_path = os.path.join(static_dir, "sitemap", filename)
        with open(file_path, "w+b") as fp:
            xml = sitemap_tmpl.render({"urls": batch})
            fp.write(xml.encode("utf8"))
        logger.info(f"wrote {file_path}....")

    for url in urls:
        url_batch.append(url)
        if len(url_batch) == 10000:
            write_sitemap(url_batch)
            url_batch = []
    if len(url_batch) > 0:
        write_sitemap(url_batch)

    if len(sitemap_files) > 50000:
        raise RuntimeError("Google only allows up to 50000 urls in a single file.")
    sitemap_index_path = os.path.join(static_dir, "sitemap", "index.xml")
    with open(sitemap_index_path, "w+b") as fp:
        xml = templates.get_template("sitemap_index.xml").render(
            {"sitemaps": sitemap_files}
        )
        fp.write(xml.encode("utf8"))
    logger.info(f"wrote {sitemap_index_path}....")
    logger.debug("Complete: generate sitemap....")

    app = Flask(__name__, static_folder=static_dir)

    logger.debug("Starting: init API...")
    app.register_blueprint(create_api(idx), url_prefix="/")
    logger.debug("Complete: init API...")

    # In production we use a HTTP server appropriate for production.
    if args.prod:
        logger.debug("Starting: gevent.WSGIServer...")
        http_server = WSGIServer(
            ("0.0.0.0", args.port), app, log=logger, error_log=logger
        )
        app.logger.info(f"Server listening at http://0.0.0.0:{args.port}")
        http_server.serve_forever()
    else:
        logger.debug("Starting: Flask development server...")
        app.run(host="0.0.0.0", port=args.port)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Starts your application's HTTP server."
    )
    parser.add_argument("--port", "-p", help="The port to listen on", default=8000)
    parser.add_argument(
        "--prod",
        help="If specified the server is started in production mode, where "
        + "the server isn't restarted as changes to the source code occur.",
        action="store_true",
        default=False,
    )
    parser.add_argument(
        "--data-dir",
        help="Path to a directory containing the datafiles that makeup the "
        + "collection of interactions.",
        default="/usr/local/data/skiff",
    )
    args = parser.parse_args()
    start(args.data_dir, args.port, args.prod)
