# supp.ai 💊

An application that lets end users quickly search for and discover interactions
between supplements and pharmaceuticals.

## Getting Started

Make sure you have [docker](https://www.docker.com/products/docker-desktop)
installed locally, then run:

```
~ docker-compose up --build
```

Once that command is complete, navigate to [http://localhost:8080](http://localhost:8080).

## Verifying your Changes

There aren't any tests (yet) for the project. We do, however, have CI that
verifies some baseline assumptions about the state of the codebase. Before
submitting changes follow these steps:

1. Use `mypy` to statically analyze `api/` subproject:

    ```
    ~ ./bin/dev api types:check
    ```

2. Format the `api/` subproject:

    ```
    ~ ./bin/dev api format
    ```

3. Format the `ui/` subproject:

    ```
    ~ ./bin/dev ui format
    ```
