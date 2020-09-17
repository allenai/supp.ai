import * as React from "react";
import Router from "next/router";
import App, { Container } from "next/app";
import Head from "next/head";
import { ThemeProvider } from "@allenai/varnish/theme";

/**
 * A custom NextJS App with a fresh coat o' Varnish 🎨⛵️.
 */
export default class AppWithVarnishTheme extends App {
    trackPageView(path: string) {
        if (process.env.NODE_ENV === "production") {
            // We use `setTimeout` so that the `document.title` is *likely*
            // already updated. This appears to work without issue, but could
            // in theory expose a race condition where the recorded title
            // is that of the previous page.
            setTimeout(() => {
                if (window.gtag && window.googleAnalyticsId) {
                    window.gtag("config", window.googleAnalyticsId, {
                        page_title: document.title,
                        page_path: path
                    });
                }
            }, 0);
        } else {
            console.log("Page change not tracked - analytics disabled.");
        }
    }
    componentDidMount() {
        Router.events.on("routeChangeComplete", this.trackPageView);
    }
    componentWillUnmount() {
        Router.events.off("routeChangeComplete", this.trackPageView);
    }
    render() {
        const { Component, pageProps } = this.props;
        const gaScript = [
            "window.googleAnalyticsId = 'UA-136317607-8';",
            "window.dataLayer = window.dataLayer || [];",
            "function gtag(){ dataLayer.push(arguments); }",
            "gtag('js', new Date());",
            "gtag('config', window.googleAnalyticsId);"
        ].join("\n");
        return (
            <React.Fragment>
                <Head>
                    <link
                        href="https://cdn.jsdelivr.net/npm/@allenai/varnish@0.5.8/dist/theme.min.css"
                        rel="stylesheet"
                    />
                    <script src="https://stats.allenai.org/init.min.js" data-spa="true" data-app-name="supp-ai" async />
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
