import styled from "styled-components";
import { Twitter, Facebook, Reddit } from "react-social-sharing";

interface Props {
    twitterMessage: string;
    link: string;
}

export const ShareButtons = ({ twitterMessage, link }: Props) => (
    <Row>
        <ShareTitle>Share:</ShareTitle>
        <ShareBg>
            <Twitter
                link={link}
                message={twitterMessage}
                simple />
        </ShareBg>
        <ShareBg>
            <Facebook link={link} simple />
        </ShareBg>
        <ShareBg>
            <Reddit link={link} simple />
        </ShareBg>
    </Row>
);

const Row = styled.div`
    display: grid;
    grid-gap: ${({ theme }) => theme.spacing.xs};
    grid-template-columns: repeat(4, min-content);
    align-items: center;
`;

const ShareTitle = styled.h5`
    font-weight: 700;
    margin: 0;
    color: ${({ theme }) => theme.color.N7};
`

const ShareBg = styled.div`
    background: ${({ theme }) => theme.color.B8};
    border-radius: 4px;
    padding: ${({ theme }) => theme.spacing.xxs};

    a {
        margin: 0 !important;
    }

    a, svg {
        display: block;
    }

    svg {
        fill: #fff !important;
        stroke: #fff !important;
        width: 18px;
        height: 18px;
    }
`;
