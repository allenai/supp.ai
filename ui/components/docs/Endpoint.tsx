import React from "react";

import { Section } from "../";
import { AnchorPoint } from "./AnchorPoint";
import { Code } from "./Code";
import { FieldTable } from "./FieldTable";

interface Parameter {
    name: string;
    type: React.ReactNode;
    isRequired: boolean;
    defaultValue?: string;
    description: string;
}

interface Props {
    id: string;
    name: string;
    description: string;
    urlString: string;
    parameters: Parameter[];
    example: string;
    returns: React.ReactNode;
}

export const Endpoint = (props: Props) => (
    <Section>
        <AnchorPoint id={props.id} />
        <h2>{props.name}</h2>
        <p>{props.description}</p>
        <p>
            <Code>{props.urlString}</Code>
        </p>
        <h3>Parameters</h3>
        <p>
            <FieldTable
                headers={[
                    "Name",
                    "Type",
                    "Required",
                    "Default Value",
                    "Description"
                ]}
                rows={props.parameters.map(param => [
                    <code>{param.name}</code>,
                    <code>{param.type}</code>,
                    <code>{param.isRequired ? "Yes" : "No"}</code>,
                    <code>{param.defaultValue || "-"}</code>,
                    param.description
                ])}
            />
        </p>
        <h3>Return Type</h3>
        <p>{props.returns}</p>
        <h3>Example</h3>
        <p>
            <Code>{props.example}</Code>
        </p>
    </Section>
);
