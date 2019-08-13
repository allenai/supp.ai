import styled from "styled-components";

import * as icon from "./icon";
import { model } from "../api";

export const AgentList = styled.ul`
    list-style-type: none;
    padding: 0;
    margin: 0;
`;

interface Props {
    agent: model.Agent;
    children: React.ReactNode;
}

export const AgentListItem = ({ agent, children }: Props) => (
    <ListItem>
        <ListItemIcon>
            {agent.is_supp ? <icon.Supplement /> : <icon.Drug />}
        </ListItemIcon>
        <ListItemContent>{children}</ListItemContent>
    </ListItem>
);

export const AgentListItemTitle = styled.h3`
    margin: 0;
    display: flex;
    align-items: center;
    text-transform: capitalize;
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
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.palette.border.main};
    margin: ${({ theme }) => theme.spacing.xl} 0;
    padding: ${({ theme }) =>
        `${theme.spacing.lg} ${theme.spacing.lg} ${theme.spacing.lg} 0`};
    display: grid;
    grid-template-columns: 60px auto;
`;

const ListItemIcon = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    flex-shrink: 0;
`;

const ListItemContent = styled.span``;
