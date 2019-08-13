import React from "react";
import styled from "styled-components";
import { Header, HeaderTitle } from "@allenai/varnish/components/Header";
import { Footer } from "@allenai/varnish/components/Footer";
import {
    PaddedContent,
    Page,
    WhiteBackground
} from "@allenai/varnish/components/shared";

import { Logo } from "./Logo";

export const DefaultLayout = ({ children }: { children: React.ReactNode }) => (
    <React.Fragment>
        <Header>
            <Logo height="56" width="56" alt="supp.ai logo" />
            <HeaderTitle>supp.ai</HeaderTitle>
        </Header>
        <WhiteBackground>
            <PaddedContent>
                <MaxWidth>
                    <Page>{children}</Page>
                </MaxWidth>
            </PaddedContent>
            <Footer />
        </WhiteBackground>
    </React.Fragment>
);

const MaxWidth = styled.div`
    && {
        max-width: 869px;
    }
`;
