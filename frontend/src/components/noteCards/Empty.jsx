import React from "react";
import styled from "styled-components";
import {FadeInAnimation} from "../animations/ContainerAnimation";
import {FcSearch} from "react-icons/fc";

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

const EmptyNoteCards = ({children}) => {
    return (
        <FadeInAnimation keyProp="no-notes">
            < ContainerStyled>
                <FcSearch size={150}/> No notes available!
                {children}
            </ ContainerStyled>
        </FadeInAnimation>
    );
};

export default EmptyNoteCards;
