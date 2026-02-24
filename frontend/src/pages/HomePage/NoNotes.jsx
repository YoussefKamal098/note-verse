import React from "react";
import styled from "styled-components";
import {FcSearch} from "react-icons/fc";
import {FadeInAnimation} from "@/components/animations/ContainerAnimation";

const ContainerStyled = styled.div`
    display: flex;
    font-size: 1.5em;
    font-weight: bold;
    text-align: center;
    color: var(--color-placeholder);
    flex-direction: column;
    gap: 0.5em;
    justify-content: center;
    align-items: center;
`;

const NoNotes = ({children}) => (
    <FadeInAnimation keyProp="no-notes">
        <ContainerStyled>
            <FcSearch size={150}/>
            No notes available!
            {children}
        </ContainerStyled>
    </FadeInAnimation>
);

export default NoNotes;
