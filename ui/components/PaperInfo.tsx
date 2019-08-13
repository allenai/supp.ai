import styled from "styled-components";
import { BodySmall } from "@allenai/varnish/components/typography";

import { model } from "../api";

interface Props {
    paper: model.Paper;
}

function semanticScholarUrl(paper: model.Paper) {
    return `https://semanticscholar.org/paper/${paper.pid}`;
}

export const PaperInfo = ({ paper }: Props) => (
    <BodySmall>
        <div>
            <PaperLink href={semanticScholarUrl(paper)}>
                {paper.title}
            </PaperLink>
        </div>
        {[paper.venue, paper.year]
            .filter(meta => meta !== undefined)
            .join("\u00A0\u00A0•\u00A0\u00A0")}
        {"\u00A0\u00A0|\u00A0\u00A0"}
        <a href={semanticScholarUrl(paper)}>View Paper</a>
    </BodySmall>
);

const PaperLink = styled.a`
    font-weight: 700;

    &,
    &:hover {
        color: ${({ theme }) => theme.palette.text.primary};
        text-decoration: none;
    }
`;
