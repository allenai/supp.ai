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

import { Logo } from "./Logo";
import * as icon from "./icon";

export const DefaultLayout = ({ children }: { children: React.ReactNode }) => (
    <React.Fragment>
        <LayoutOverrides />
        <Header>
            <Link href="/">
                <HeaderLink>
                    <Logo height="56" width="56" alt="supp.ai logo" />
                    <HeaderTitle>supp.ai</HeaderTitle>
                </HeaderLink>
            </Link>
            <Right>
                <a href="https://www.semanticscholar.org">
                    <icon.PoweredByS2 />
                </a>
            </Right>
        </Header>
        <MainPane>
            <PaddedContent>
                <MaxWidth>
                    <Page>{children}</Page>
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

const MainPane = styled(WhiteBackground)`
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
