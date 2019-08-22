import React from "react";
import styled from "styled-components";
import { Popover } from "antd";

import * as icon from "./icon";
import { model } from "../api";

interface Props {
    agent: model.Agent;
    children: React.ReactNode;
}

export const WithAgentDefinitionPopover = ({ agent, children }: Props) => (
    <Container
        placement="bottomLeft"
        content={<Definition>{agent.definition}</Definition>}
        trigger="hover"
        transitionName="none"
    >
        {children}
        <IconContainer>
            <icon.Info width="19" height="19" />
        </IconContainer>
    </Container>
);

const Container = styled(Popover)`
    display: flex;
    align-items: baseline;
`;

const IconContainer = styled.span`
    display: flex;
    align-items: baseline;
    margin: 0 ${({ theme }) => theme.spacing.sm};
`;

const Definition = styled.div`
    max-width: 60ch;
    text-align: left;
`;
