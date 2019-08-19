import React from "react";
import { DocumentContext } from "next/document";

import { fetchAgent } from "../api";

/**
 * The only purpose of this page is to allow users to navigate to
 * `/a/:cui` and get redirected to the canonical url.
 */
export default class AgentRedirect extends React.PureComponent {
    static async getInitialProps({ res, query }: DocumentContext) {
        const { cui } = query;
        if (Array.isArray(cui)) {
            throw new Error("Invalid CUI.");
        }
        if (cui === undefined) {
            throw new Error("CUI must be set.");
        }

        const agent = await fetchAgent(cui);
        const url = `/a/${agent.slug}/${agent.cui}`;
        if (res) {
            res.writeHead(301, { Location: url });
            res.end();
        } else {
            throw new Error("This redirect should only be used server side.");
        }
    }
}
