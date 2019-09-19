/**
 * NOTE: This file is not transpiled, and is only executed on the server.
 * One should accordingly stick to writing code compatible with the target
 * NodeJS version (see the ui/Dockerfile).
 */

const next = require('next');
const morgan = require('morgan');
const express = require('express');
const url = require('url');
const path = require('path');

const server = express();

const isNotProd = process.env.NODE_ENV !== 'production';
const app = next({ dev: isNotProd });

server.disable('x-powered-by');

// We define a custom format that's used in production that makes our request
// logs parseable (and thereby searchable) using Google's logging platform.
morgan.format('json', JSON.stringify({
    status: ':status',
    method: ':method',
    url: ':url',
    response_time: ':response-time ms'
}));

app.prepare().then(() => {
    const format = process.env.SUPPAIR_LOG_FORMAT || (isNotProd ? 'tiny' : 'json');
    const port = process.env.SUPPAI_UI_PORT || 3000;
    const { host: canonicalHost } = url.parse(process.env.SUPP_AI_CANONICAL_ORIGIN || 'localhost:8080');
    if (!canonicalHost) {
        throw new Error("Invalid or missing environment variable: SUPP_AI_CANONICAL_ORIGIN");
    }

    server.use(morgan(format));

    server.use((req, res, next) => {
        //
        // Parse the "Forwarded" HTTP header, which is set by the proxy, as
        // to verify that the user is using the canonical site url.
        //
        // We skip this check if the user-agent is that of the Kubernetes
        // probe (as to allow for health-checks).
        //
        // See: https://tools.ietf.org/html/rfc7239
        //
        if (
            (
                !req.headers["user-agent"] ||
                !req.headers["user-agent"].startsWith("kube-probe")
            )
            && req.headers["forwarded"]
        ) {
            const valuesByName = (
                req.headers["forwarded"].split(";")
                    .map(pair => pair.split("="))
                    .reduce((byName, [ name, value ]) => {
                        byName[name] = value;
                        return byName;
                    }, {})
            );
            const host = valuesByName["host"];
            const proto = valuesByName["proto"] || "https";
            if (host.trim().length > 0 && proto) {
                if (host && host !== canonicalHost) {
                    const requestUrl = url.parse(req.url);
                    requestUrl.protocol = proto;
                    requestUrl.host = canonicalHost;
                    res.redirect(`${url.format(requestUrl)}`, 301);
                    return;
                }
            }
        }
        next();
    });

    // Serve the robots.txt when it's requested from the root.
    server.get('/robots.txt', (req, res) => {
        return res.status(200).sendFile(
            path.join(__dirname, 'static', 'robots.txt'),
            { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
        );
    });

    // NextJS requires that dynamic urls be configured with a bit of extra
    // magic. This sets up the routing required for detail pages.
    server.get('/a/:slug/:cui', (req, res) => {
        const parsed = url.parse(req.url, true);
        app.render(req, res, '/agent', { ...req.params, ...parsed.query });
    });
    server.get('/i/:slug/:interaction_id', (req, res) => {
        const parsed = url.parse(req.url, true);
        app.render(req, res, '/interaction', { ...req.params, ...parsed.query });
    });

    server.use(app.getRequestHandler());

    server.listen(port, () => {
        console.log(`listening on http://localhost:${port}`)
    });
});
