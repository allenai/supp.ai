import styled from "styled-components";

import supplementSrc from "./supplement.svg";
import drugSrc from "./drug.svg";
import infoSrc from "./info.svg";
import otherSrc from "./other.svg";
import animalSrc from "./animal.svg";
import otherBulletSrc from "./other-bullet.svg";
import humanSrc from "./human.svg";

import { model } from "../../api";

export const Supplement = styled.img.attrs(() => ({ src: supplementSrc }))``;
export const Drug = styled.img.attrs(() => ({ src: drugSrc }))``;
export const Other = styled.img.attrs(() => ({ src: otherSrc }))``;

export const Info = styled.img.attrs(() => ({ src: infoSrc }))``;
export const Animal = styled.img.attrs(() => ({ src: animalSrc }))``;
export const OtherBullet = styled.img.attrs(() => ({ src: otherBulletSrc }))``;
export const Human = styled.img.attrs(() => ({ src: humanSrc }))``;

interface Props {
    type: model.AgentType;
}

export const AgentTypeIcon = ({ type }: Props) => {
    switch (type) {
        case model.AgentType.DRUG:
            return <Drug />;
        case model.AgentType.SUPPLEMENT:
            return <Supplement />;
        default:
        case model.AgentType.OTHER:
            return <Other />;
    }
};
