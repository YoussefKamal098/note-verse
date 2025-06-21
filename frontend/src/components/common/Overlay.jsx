import React from "react";
import styled from "styled-components";

const Styled = styled.div`
    position: ${({$isAbsolute}) => $isAbsolute ? "absolute" : "fixed"};
    top: 0;
    left: 0;
    width: ${({$isAbsolute}) => $isAbsolute ? "100%" : "100vw"};
    height: ${({$isAbsolute}) => $isAbsolute ? "100%" : "100vh"};
    background-color: transparent;
    z-index: ${({$isAbsolute}) => $isAbsolute ? "2" : "10000"};
`;

const Overlay = ({isVisible, isAbsolute = false}) => {
    if (!isVisible) return null;

    return (
        <Styled $isAbsolute={isAbsolute}></Styled>
    );
};

export default Overlay;
