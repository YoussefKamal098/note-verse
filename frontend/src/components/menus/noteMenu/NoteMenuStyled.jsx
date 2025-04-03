import styled from "styled-components";
import {MenuContainerStyled} from "../MenuStyled";

const NoteMenuWrapperStyled = styled.div`
    @media (max-width: ${props => props.mobile_size}px) {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100vw;
        height: ${(props) => (props.menu_open ? "100vh" : "0")};
        opacity: ${(props) => (props.menu_open ? "1" : "0")};
        transition: opacity 300ms;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(0.1em);
        z-index: 1500;
        overflow: visible;
    }
`

const NoteMenuHeaderStyled = styled.div`
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    padding: 1em;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-background);
    cursor: pointer;
    z-index: 10;

    &::after {
        position: absolute;
        content: '';
        width: 35px;
        height: 3px;
        border-radius: 50px;
        background-color: var(--color-placeholder);
    }
`

const NoteMenuContainerStyled = styled(MenuContainerStyled)`
    @media (max-width: ${props => props.mobile_size}px) {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100vw;
        height: 75vh;
        min-width: 100vw;
        max-height: 100vh;
        translate: 0 0;
        border-radius: 25px 25px 0 0;
        padding: 0 0 2em;
        overflow-y: auto;
        transition: opacit, translate 300ms ease;

        &.menu-exit {
            opacity: 1;
            translate: 0 0 !important;
        }

        &.menu-exit-active {
            opacity: 1;
            translate: 0 100% !important;
        }
    }
`;

const NoteMenuTriggerButton = styled.button`
    background: transparent;
    color: var(--color-placeholder);
    border: none;
    cursor: pointer;
    padding: 0.25em;
    display: flex;
    align-items: center;
    font-size: 1.5em;
`;

export {
    NoteMenuWrapperStyled,
    NoteMenuHeaderStyled,
    NoteMenuContainerStyled,
    NoteMenuTriggerButton
}
