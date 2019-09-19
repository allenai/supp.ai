import styled from "styled-components";
import { ExternalLink } from "@allenai/varnish/components/link/ExternalLink";

import { Caption } from "./icon";

export const Feedback = ({ className }: { className?: string }) => (
    <div className={className}>
        <span>
            <CaptionWithRightMargin
                width="14"
                height="14"
                alt="Feedback Icon"
            />
            Help us improve <strong>supp.ai</strong>, we'd love to hear your
            feedback:
        </span>{" "}
        <ExternalLink href="mailto:supp-ai-feedback@allenai.org">
            Submit Feedback
        </ExternalLink>
    </div>
);

const CaptionWithRightMargin = styled(Caption)`
    margin-right: 8px;
`;
