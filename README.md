# skiff-template

Ahoy! Welcome to your new [skiff](https://github.com/allenai/skiff) template
application that includes:

* A Python based, [Flask](http://flask.pocoo.org/) HTTP server responsible for
  serving static assets and dynamic API endpoints.
* A [TypeScript](https://www.typescriptlang.org/), [ReactJS](https://reactjs.org/)
  and [Varnish](http://github.com/allenai/varnish) based user interface.
* Automatic deploys to shared infrastructure and other functionality provided by
  [skiff](https://github.com/allenai/skiff).

To start a new repository from this template, click [here](https://github.com/allenai/skiff-template/generate).

## Prerequisites

Make sure that you have the latest version of [Docker 🐳](https://www.docker.com/get-started)
installed on your local machine.

## Getting Started

Start by opening `skiff.json` and updating the `appName`, `contact` and 
`team` fields:

* The `appName` field should be a short, unique and url-safe identifier for
  your application. This value determines the url of your application, which
  will be `${appName}.apps.allenai.org`.
* The `contact` field should be the `@allenai.org` email address that is
  responsible for the demo. Don't include the `@allenai.org` portion,
  just the prefix.
* The `team` field is the name of the team at AI2 that's responsible for
  the demo.

After commiting and pushing these changes make sure to submit a 
[request to be onboarded](https://github.com/allenai/skiff/issues/new/choose).

To start a version of the application locally for development purposes, run
this command:

```
~ docker-compose up --build
```

This process launches 3 services, the `ui`, `api` and a `proxy` responsible
for forwarding traffic to the appropriate services. You'll see output
from each.

It might take a minute or two for your application to start, particularly
if it's the first time you've executed this command. Be patience and wait
for a clear message indicating that all of the required services have
started up.

As you make changes the running application will be automatically updated. 
Simply refresh your browser to see them.

Sometimes one portion of your application will crash due to errors in the code.
When this occurs resolve the related issue and re-run `docker-compose up --build`
to start things back up.

## Installing Third Party Packages

You'll likely want to install third party packages at some point. To do so
follow the steps described below.

### Python Dependencies

To add new dependencies to the Python portion of the project, follow these steps:

1. Make sure your local environment is running (i.e. you've ran `docker-compose up`).
2. Start a shell session in the server container:
    ```
    ~ ./bin/sh api
    ```
3. Install the dependency in question:
    ```
    ~ pip install <dependency>
    ```
4. Update the dependency manifest:
    ```
    ~ pip freeze > requirements.txt
    ```
5. Exit the container:
    ```
    ~ exit
    ```

Remember to commit and push the `requirements.txt` file to apply your changes.

### UI Dependencies

To add new dependencies to the UI, follow these steps:

1. Make sure your local environment is running (i.e. you've ran `docker-compose up`).
2. Start a shell session in the ui container:
    ```
    ~./bin/sh ui
    ```
3. Install the dependency in question:
    ```
    ~ yarn add <dependency>
    ```
4. Exit the container:
    ```
    ~ exit
    ```

Remember to commit and push both the `yarn.lock` and `package.json` files
to apply your changes.

## Deploying

Your code will be deployed as you push changes to your repository. Too see
deploys related to your application visit the [Google Cloud Build Console](https://console.cloud.google.com/cloud-build/builds?project=ai2-reviz).

Alternatively, if you'd like to temporarily deploy a version of the application
based on the changes you've made locally, follow these steps:

1. Make sure any outstanding changes are committed.
2. Run:
    ```
    ~ ./bin/deploy up
    ```
3. When you're finished with the environment, remove the associated infrastructure
   via:
   ```
   ~ ./bin/deploy down
   ```

## Metrics and Logs

You can find links to the metrics and log entries related to your application
by visiting the [Marina](https://marina.apps.allenai.org).

## Helpful Links

Here's a list of resources that might be helpful as you get started:

* [Skiff User Guide](https://github.com/allenai/skiff/blob/master/doc/UserGuide.md)
* [TypeScript in 5 minutes](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
* [ReactJS Tutorial](https://reactjs.org/tutorial/tutorial.html)
* [Flask Documentation](http://flask.pocoo.org/docs/1.0/)
* [Ant Design](https://ant.design)
* [Varnish](https://github.com/allenai/varnish)

## Getting Help

If you're stuck don't hesitate to reach out:

* Sending an email to [reviz@allenai.org](mailto:reviz@allenai.org)
* Joining the `#skiff-users` slack channel
* Opening a [Github Issue](https://github.com/allenai/skiff/issues/new/choose)

We're eager to improve `skiff` and need your feedback to do so!

Smooth sailing ⛵️!
