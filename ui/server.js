/**
 * NOTE: This file is not transpiled, and is only executed on the server.
 * One should accordingly stick to writing code compatible with the target
 * NodeJS version (see the ui/Dockerfile).
 */

const next = require('next');
const morgan = require('morgan');
const express = require('express');
const url = require('url');

const server = express();

const isNotProd = process.env.NODE_ENV !== 'production';
const app = next({ dev: isNotProd });

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
    server.use(morgan(format));

    // NextJS requires that dynamic urls be configured with a bit of extra
    // magic. This sets up the routing required for detail pages.
    server.get('/a/:slug/:cui', (req, res) => {
        // TODO: Validate slug and redirect if it's not canonical.
        const parsed = url.parse(req.url, true);
        return app.render(req, res, '/agent', { ...req.params, ...parsed.query });
    });

    server.use(app.getRequestHandler());

    server.listen(port, () => {
        console.log(`listening on http://localhost:${port}`)
    });
});
