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
        const gaScript = [
            "window.dataLayer = window.dataLayer || [];",
            "function gtag(){ dataLayer.push(arguments); }",
            "gtag('js', new Date());",
            "gtag('config', 'UA-136317607-8');`;"
        ].join("\n");
        return (
            <React.Fragment>
                <Head>
                    <link
                        href="https://cdn.jsdelivr.net/npm/@allenai/varnish@0.3.18/theme.css"
                        rel="stylesheet"
                    />
                    {process.env.NODE_ENV === "production" ? (
                        <React.Fragment>
                            <script
                                async
                                src="https://www.googletagmanager.com/gtag/js?id=UA-136317607-8"
                            ></script>
                            <script
                                dangerouslySetInnerHTML={{ __html: gaScript }}
                            />
                        </React.Fragment>
                    ) : null}
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
