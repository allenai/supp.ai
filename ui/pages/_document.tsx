import * as React from "react";
import Document, { DocumentContext } from "next/document";
import { ServerStyleSheet } from "styled-components";

/**
 * A custom NextJS Document that provided style-components support, ensuring
 * that styles injected via styled-components are rendered both on the client
 * and server.
 */
export default class DocumentWithStyledComponents extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const originalRenderPage = ctx.renderPage;
        const sheet = new ServerStyleSheet();

        try {
            // Capture the styles that our application injects, so that we can
            // package things up nicely for server side rendering.
            ctx.renderPage = () =>
                originalRenderPage({
                    enhanceApp: App => props =>
                        sheet.collectStyles(<App {...props} />)
                });

            // Wrap everything up the way NextJS expects it.
            const initialProps = await Document.getInitialProps(ctx);
            return {
                ...initialProps,
                styles: (
                    <React.Fragment>
                        {initialProps.styles}
                        {sheet.getStyleElement()}
                    </React.Fragment>
                )
            };
        } finally {
            sheet.seal();
        }
    }
}
