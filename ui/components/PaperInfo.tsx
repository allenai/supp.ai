import styled from "styled-components";
import { BodySmall } from "@allenai/varnish/components/typography";

import { model } from "../api";
import * as icon from "./icon";

interface Props {
    paper: model.Paper;
}

function semanticScholarUrl(paper: model.Paper) {
    return `https://semanticscholar.org/paper/${paper.pid}`;
}

const StudyTypeIcon = ({ paper }: { paper: model.Paper }) => {
    if (paper.animal_study) {
        return <icon.Animal />;
    } else if (paper.human_study) {
        return <icon.Human />;
    } else {
        return <icon.SmallPaperIcon />;
    }
};

export const PaperInfo = ({ paper }: Props) => (
    <BodySmall>
        <PaperLinkRow>
            <PaperLink href={semanticScholarUrl(paper)}>
                <StudyTypeIcon paper={paper} /> {paper.title}
            </PaperLink>
        </PaperLinkRow>
        {[paper.venue, paper.year]
            .filter(meta => meta !== undefined)
            .join("\u00A0\u00A0•\u00A0\u00A0")}
        {"\u00A0\u00A0|\u00A0\u00A0"}
        <a href={semanticScholarUrl(paper)}>View Paper</a>
    </BodySmall>
);

const PaperLinkRow = styled.div`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 100%;
`;

const PaperLink = styled.a`
    font-weight: 700;

    &,
    &:hover {
        color: ${({ theme }) => theme.palette.text.primary};
        text-decoration: none;
    }
`;
