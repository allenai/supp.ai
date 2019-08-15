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
                        href="https://cdn.jsdelivr.net/npm/@allenai/varnish@0.3.18/theme.css"
                        rel="stylesheet"
                    />
                </Head>
                <Container>
                    <ThemeProvider>
                        <Component {...pageProps} />
                    </ThemeProvider>
                </Container>
                <style global jsx>{`
                    html {
                        background: #08426C !important;
                    }
                    body > div {
                        display: flex;
                        flex-direction: column;
                        min-height: 100%;
                    }
                `}</style>
            </React.Fragment>
        );
    }
}
