export const Synonyms = ({ synonyms }: { synonyms: string[] }) => (
    <span>A.K.A: {synonyms.join(", ")}</span>
);
