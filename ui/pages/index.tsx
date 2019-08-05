import React from "react";
import { Header } from "@allenai/varnish/components/Header";
import { HeaderTitle } from "@allenai/varnish/components/Header";
import { PaddedContent, Page } from "@allenai/varnish/components/shared";

export default function Home() {
    return (
        <React.Fragment>
            <Header>
                <HeaderTitle>Coming Soon</HeaderTitle>
            </Header>
            <PaddedContent>
                <Page>🚧</Page>
            </PaddedContent>
        </React.Fragment>
    );
}
