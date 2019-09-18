import * as React from "react";
import styled from "styled-components";
import { ExternalLink } from "@allenai/varnish/components/link/ExternalLink";

import lucyImg from "./images/lucy.jpg";
import oyvindImg from "./images/oyvind.jpg";
import sarthakImg from "./images/sarthak.jpg";
import armanImg from "./images/arman.jpg";
import samImg from "./images/sam.jpg";
import carissaImg from "./images/carissa.jpg";
import nickImg from "./images/nick.jpg";
import waleedImg from "./images/waleed.jpg";
import orenImg from "./images/oren.jpg";

const authors = [
    {
        name: "Lucy Lu Wang",
        url: "https://llwang.net/",
        img: lucyImg
    },
    {
        name: "Oyvind Tafjord",
        url: "https://allenai.org/team/oyvindt/",
        img: oyvindImg
    },
    {
        name: "Sarthak Jain",
        url: "https://www.khoury.northeastern.edu/people/sarthak-jain-2/",
        img: sarthakImg
    },
    {
        name: "Arman Cohan",
        url: "http://armancohan.com/",
        img: armanImg
    },
    {
        name: "Sam Skjonsberg",
        url: "https://codeviking.net/",
        img: samImg
    },
    {
        name: "Carissa Schoenick",
        url: "https://www.linkedin.com/in/carissaschoenick/",
        img: carissaImg
    },
    {
        name: "Nick Botner",
        url: "https://www.linkedin.com/in/nickbotner/",
        img: nickImg
    },
    {
        name: "Waleed Ammar",
        url: "https://wammar.github.io/",
        img: waleedImg
    },
    {
        name: "Oren Etzioni",
        url: "https://allenai.org/team/orene/",
        img: orenImg
    }
];

export const AuthorList = () => (
    <React.Fragment>
        <p>
            SUPP.AI is developed by the following team:
        </p>
        <List>
            {authors.map(author => (
                <ListItem key={author.name}>
                    <ExternalLink href={author.url}>
                        <ProfileImg
                            src={author.img}
                            width="130"
                            height="130"
                            alt={author.name}
                        />
                        {author.name}
                    </ExternalLink>
                </ListItem>
            ))}
        </List>
    </React.Fragment>
);

const List = styled.ul`
    margin: 0;
    padding: 0;
    display: flex;
    list-style-type: none;
    flex-wrap: wrap;
    margin: ${({ theme }) => `-${theme.spacing.md}`};
    min-width: 100%;

    @media (max-width: ${({ theme }) => theme.breakpoints.xs}) {
        justify-content: center;
    }
`;

const ListItem = styled.li`
    margin: ${({ theme }) => theme.spacing.sm};
    text-align: center;

    a {
        display: block;
    }
`;

const ProfileImg = styled.img`
    display: block;
    margin: ${({ theme }) => `0 auto ${theme.spacing.md}`};
    border: 1px solid ${({ theme }) => theme.palette.border.main};
`;
