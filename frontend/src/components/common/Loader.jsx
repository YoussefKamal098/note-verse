import React from "react";
import LoadingEffect from "./LoadingEffect";
import styled from "styled-components";

const LoaderStyled = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    position: ${({$isAbsolute}) => $isAbsolute ? "absolute" : "fixed"};
    width: ${({$isAbsolute}) => $isAbsolute ? "100%" : "100vw"};
    height: ${({$isAbsolute}) => $isAbsolute ? "100%" : "100vh"};
    background-color: transparent;
    z-index: ${({$isAbsolute}) => $isAbsolute ? "2" : "1000"};
`

const Loader = ({color = "var(--color-accent)", size = 50, isAbsolute = false}) => {
    return (
        <LoaderStyled $isAbsolute={isAbsolute}>
            <LoadingEffect color={color} loading={true} size={size}/>
        </LoaderStyled>
    );
};

export default Loader;
