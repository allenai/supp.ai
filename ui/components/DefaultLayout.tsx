import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Header, HeaderTitle } from "@allenai/varnish/components/Header";
import { Footer } from "@allenai/varnish/components/Footer";
import {
    PaddedContent,
    Page,
    WhiteBackground
} from "@allenai/varnish/components/shared";
import Link from "next/link";

import { Disclaimer } from "./Disclaimer";
import { Logo } from "./Logo";

export const DefaultLayout = ({ children }: { children: React.ReactNode }) => (
    <React.Fragment>
        <HeaderZIndexFix />
        <Header>
            <Link href="/">
                <HeaderLink>
                    <Logo height="56" width="56" alt="supp.ai logo" />
                    <HeaderTitle>supp.ai</HeaderTitle>
                </HeaderLink>
            </Link>
        </Header>
        <WhiteBackground>
            <PaddedContent>
                <MaxWidth>
                    <Page>{children}</Page>
                    <Disclaimer />
                </MaxWidth>
            </PaddedContent>
        </WhiteBackground>
        <NeutralBackground>
            <Centered>
                <MaxWidth>
                    <Footer />
                </MaxWidth>
            </Centered>
        </NeutralBackground>
    </React.Fragment>
);

const HeaderZIndexFix = createGlobalStyle`
    header {
        z-index: 10000 !important;
    }
`;

const MaxWidth = styled.div`
    && {
        max-width: 869px;
    }
`;

const HeaderLink = styled.a`
    display: flex;
    align-items: center;

    &:hover {
        text-decoration: none;
    }
`;

const Centered = styled.div`
    margin: 0 auto;
    max-width: ${({ theme }) => theme.breakpoints.xl};
`;

const NeutralBackground = styled.div`
    background: ${({ theme }) => theme.color.N2};

    // TODO: This is a hack, remove once Varnish's Footer can be restyled.
    footer {
        text-align: left !important;
        padding: ${({ theme }) => theme.spacing.lg} !important;
    }
`;
