import styled from "styled-components";

import supplementSrc from "./supplement.svg";
import drugSrc from "./drug.svg";
import infoSrc from "./info.svg";

export const Supplement = styled.img.attrs(() => ({ src: supplementSrc }))``;
export const Drug = styled.img.attrs(() => ({ src: drugSrc }))``;
export const Info = styled.img.attrs(() => ({ src: infoSrc }))``;
