import * as React from "react";
import App, { Container } from "next/app";
import Head from "next/head";
import { ThemeProvider } from "@allenai/varnish/theme";

/**
 * A custom NextJS App with a fresh coat o' Varnish 🎨⛵️.
 */
export default class AppWithVarnishTheme extends App {
    render() {
        const { Component, pageProps } = this.props;
        return (
            <React.Fragment>
                <Head>
                    <link
                        href="https://cdn.jsdelivr.net/npm/@allenai/varnish@0.5.8/dist/theme.min.css"
                        rel="stylesheet"
                    />
                    <script
                        src="https://stats.allenai.org/init.min.js"
                        data-spa="true"
                        data-app-name="supp-ai"
                        async
                    />
                    <meta
                        name="google-site-verification"
                        content="buGfEXA0lN1WmGCBLa7WohFGxmYJ51OXzmZBQLTwtf4"
                    />
                </Head>
                <Container>
                    <ThemeProvider>
                        <Component {...pageProps} />
                    </ThemeProvider>
                </Container>
                <style global jsx>{`
                    html {
                        background: #08426c !important;
                    }
                `}</style>
            </React.Fragment>
        );
    }
}
