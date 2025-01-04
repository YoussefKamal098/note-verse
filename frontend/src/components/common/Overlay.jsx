import React from "react";
import styled from "styled-components";

const Styled = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: transparent;
    z-index: 1000
`;

const Overlay = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <Styled></Styled>
    );
};

export default Overlay;
