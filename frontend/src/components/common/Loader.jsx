import React from "react";
import LoadingEffect from "./LoadingEffect";
import styled from "styled-components";

const LoaderStyled = styled.div`
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: 1000;
`

const Loader = () => {
    return (
        <LoaderStyled>
            <LoadingEffect color={"var(--color-accent)"} loading={true} size={50}/>
        </LoaderStyled>
    );
};

export default Loader;
