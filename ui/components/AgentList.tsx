import styled from "styled-components";

import * as icon from "./icon";
import { model } from "../api";

interface Props {
    agent: model.Agent;
    children: React.ReactNode;
}

export const AgentListItem = ({ agent, children }: Props) => (
    <ListItem>
        <ListItemIcon>
            <icon.AgentTypeIcon type={agent.ent_type} />
        </ListItemIcon>
        <ListItemContent>{children}</ListItemContent>
    </ListItem>
);

export const AgentListItemTitle = styled.h3`
    margin: 0;
    display: flex;
    align-items: center;
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-weight: 400;

    &,
    a {
        color: ${({ theme }) => theme.palette.text.primary};
        text-decoration: none;
    }
`;

export const AgentListItemContent = styled.div`
    display: block;
    margin: ${({ theme }) => theme.spacing.sm} 0;
`;

const ListItem = styled.li`
    border: 1px solid ${({ theme }) => theme.palette.border.main};
    border-radius: 4px;
    padding: ${({ theme }) => theme.spacing.lg};
    margin: ${({ theme }) => theme.spacing.lg} 0;
    display: grid;
    grid-template-columns: min-content auto;
    grid-gap: ${({ theme }) => theme.spacing.lg};
`;

const ListItemIcon = styled.span`
    display: flex;
    align-items: flex-start;
    flex-shrink: 0;
    padding: 4px 0;
`;

const ListItemContent = styled.span`
    overflow: hidden;
`;
