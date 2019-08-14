import React from "react";
import styled from "styled-components";
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
            <Footer />
        </WhiteBackground>
    </React.Fragment>
);

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
