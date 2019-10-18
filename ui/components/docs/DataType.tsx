import React from "react";

import { AnchorPoint } from "./AnchorPoint";
import { Section } from "../";
import { FieldTable } from "./FieldTable";

interface Field {
    name: string;
    type: React.ReactNode;
    description: string;
}

interface Props {
    id: string;
    name: string;
    description: string;
    fields: Field[];
}

export const DataType = (props: Props) => (
    <Section>
        <AnchorPoint id={props.id} />
        <h2>
            <code>{props.name}</code>
        </h2>
        <p>{props.description}</p>
        <FieldTable
            headers={["Name", "Type", "Description"]}
            rows={props.fields.map(field => [
                <code>{field.name}</code>,
                <code>{field.type}</code>,
                field.description
            ])}
        />
    </Section>
);
