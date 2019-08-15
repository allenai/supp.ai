import { useState } from "react";
import styled from "styled-components";
import { parseCookies, setCookie } from "nookies";
import { DocumentContext } from "next/document";

import * as icon from "./icon";

const DISMISSED_COOKIE_NAME = "has-dismissed-disclaimer";

export function hasDismissedDisclaimer(context: DocumentContext): boolean {
    const cookies = parseCookies(context);
    return cookies[DISMISSED_COOKIE_NAME] === "true";
}

export function Disclaimer() {
    const [isHidden, toggleIsHidden] = useState(false);
    const hideAndSetCookie = () => {
        toggleIsHidden(true);
        setCookie({}, DISMISSED_COOKIE_NAME, "true", {
            domain: window.location.hostname,
            path: "/",
            maxAge: 30 * 24 * 60 * 60, // 30 days
            sameSite: "Strict",
            secure: window.location.protocol === "https:"
        });
    };
    return !isHidden ? (
        <Warning>
            <span>
                <strong>Disclaimer:</strong> The information contained herein
                should NOT be used as a substitute for the advice of an
                appropriately qualified and licensed physician or other health
                care provider. The tool is not a substitute for the care
                provided by licensed healthcare practitioners and consumers are
                urged to consult with their healthcare practitioner in all
                instances. The absence of a warning for a given supplement, drug
                or combination thereof in no way should be construed to indicate
                that the supplement, drug or combination is safe, effective or
                appropriate for any given patient. The information provided here
                is for informational purposes only. This tool may not cover all
                possible supplement-drug interactions. Please check with a
                physician if you have health questions or concerns. Although we
                attempt to provide accurate and up-to-date information, no
                guarantee is made to that effect. This tool does not endorse any
                drugs or supplements, diagnose patients, or recommend therapy.
            </span>
            <a onClick={hideAndSetCookie}>
                <icon.Close />
            </a>
        </Warning>
    ) : null;
}

const Warning = styled.div`
    display: grid;
    grid-template-columns: auto min-content;
    background: ${({ theme }) => theme.color.O1};
    border: 1px solid ${({ theme }) => theme.color.O2};
    border-radius: 4px;
    padding: ${({ theme }) => theme.spacing.md};
`;
