import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Header, HeaderTitle } from "@allenai/varnish/components/Header";
import {
    PaddedContent,
    Page,
    BackgroundLayout
} from "@allenai/varnish/components/Layout";
import { Footer } from "@allenai/varnish/components/Footer";
import Link from "next/link";
import Head from "next/head";

import { Logo } from "./Logo";
import * as icon from "./icon";
import { OpengraphImage } from "./OpengraphImage";

export const DefaultLayout = ({ children }: { children: React.ReactNode }) => (
    <React.Fragment>
        <Head>
            <link
                rel="shortcut icon"
                type="image/x-icon"
                href="/static/favicon.ico"
            />
            <OpengraphImage />
        </Head>
        <LayoutOverrides />
        <Header>
            <Link href="/">
                <HeaderLink>
                    <Logo height="56" width="56" alt="supp.ai logo" />
                    <HeaderTitle>supp.ai</HeaderTitle>
                    <HeaderSubTitle>
                        Discover Supplement-Drug Interactions
                    </HeaderSubTitle>
                </HeaderLink>
            </Link>
            <Right>
                <a href="https://www.semanticscholar.org">
                    <S2Logo>
                        <icon.PoweredByS2 />
                        <icon.StackedPoweredByS2 />
                    </S2Logo>
                </a>
            </Right>
        </Header>
        <MainPane color="white">
            <PaddedContent>
                <MaxWidth>
                    <PageWithNoMinHeight>{children}</PageWithNoMinHeight>
                </MaxWidth>
            </PaddedContent>
        </MainPane>
        <NeutralBackground>
            <Centered>
                <MaxWidth>
                    <Footer />
                </MaxWidth>
            </Centered>
        </NeutralBackground>
    </React.Fragment>
);

const LayoutOverrides = createGlobalStyle`
    // TODO: This is a hack. Once Varnish allows the <Header />, <Footer />
    // and other things to be styled we should remove this and just used a
    // standard override (i.e. styled(Header)).
    header {
        z-index: 100 !important;
        flex-grow: 0;
    }

    footer {
        flex-grow: 0;
    }
`;

const PageWithNoMinHeight = styled(Page)`
    min-height: 0;

    > *:last-child {
        margin-bottom: 0;
    }
`;

const S2Logo = styled.div`
    > *:first-child {
        display: block;
    }

    > *:last-child {
        display: none;
    }

    @media screen and (max-width: 400px) {
        > *:first-child {
            display: none;
        }

        > *:last-child {
            display: block;
        }
    }
`;

const HeaderSubTitle = styled.h2`
    font-size: ${({ theme }) => theme.typography.h3.fontSize};
    margin: 0 0 0 ${({ theme }) => theme.spacing.xs};
    font-weight: 400;
    padding-top: 5px;

    @media screen and (max-width: 900px) {
        display: none;
    }
`;

const Right = styled.div`
    margin-left: auto;
    padding-left: ${({ theme }) => theme.spacing.md};
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

const MainPane = styled(BackgroundLayout)`
    flex-grow: 1;
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
