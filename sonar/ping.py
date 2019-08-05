# -*- coding: utf-8 -*-

import requests
import time
import math

def is_ok(url: str) -> bool:
    """
    Returns True if the provided URL responds with a 2XX when fetched via
    a HTTP GET request.
    """
    try:
        resp = requests.get(url)
    except:
        return False
    return True if math.floor(resp.status_code / 100) == 2 else False

def scan():
    """
    Broadcasts the availability of the proxy's HTTP server once both the
    API and UI are ready for traffic.

    This script exists solely to ease confusion locally, as both Flask and 
    the HTTP server bundled with `create-react-app` output logs telling the
    user about the ports they're bound to (even though they're inaccessible).
    """

    print("")
    print("⚓️ Ahoy!")
    print("")
    print(
        "Your application is starting and will be available at " +
        "http://localhost:8080 when it's ready."
    )
    print("")

    is_api_live = False
    is_ui_live = False
    while (is_api_live != True or is_ui_live != True):
        # We sleep before checking, as we can safely assume that things
        # won't be ready right off the bat.
        time.sleep(5)
        if not is_api_live:
            is_api_live = is_ok("http://api:8000")
        if not is_ui_live:
            is_ui_live = is_ok("http://ui:3000")

    print("")
    print("✨ Your local environment is ready:")
    print("")
    print("     http://localhost:8080")
    print("")
    print("⛵️ Smooth sailing!")
    print("")

if __name__ == "__main__":
    scan()
