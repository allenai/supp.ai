import argparse
import os
import sys
import logging
from typing import Tuple, Iterable, Optional
from gevent.pywsgi import WSGIServer  # type: ignore
from flask import Flask, Response, request, jsonify
from app.api import create_api
from app.utils import StackdriverJsonFormatter


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

    app = Flask(__name__)

    # Bind the API functionality to our application. You can add additional
    # API endpoints by editing api.py.
    logger.debug("Starting: init API...")
    app.register_blueprint(create_api(data_dir), url_prefix="/")
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
