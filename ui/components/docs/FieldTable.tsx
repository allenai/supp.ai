import styled from "styled-components";
import React from "react";

interface Props {
    headers: string[];
    rows: React.ReactNode[][];
}

export const FieldTable = (props: Props) => {
    return (
        <StyledTable>
            <thead>
                <tr>
                    {props.headers.map(text => (
                        <th key={text}>{text}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {props.rows.map((values, rowIdx) => (
                    <tr key={rowIdx}>
                        {values.map((value, idx) => (
                            <td key={[rowIdx, idx].join(".")}>{value}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </StyledTable>
    );
};

const StyledTable = styled.table`
    width: 100%;

    th {
        font-weight: 700;
        border-bottom: 1px solid ${({ theme }) => theme.color.N4};
    }

    th,
    td {
        padding: ${({ theme }) => theme.spacing.sm};
        vertical-align: baseline;
    }
`;
