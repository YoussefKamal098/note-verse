import styled, {keyframes} from "styled-components";
import {MenuContainerStyled} from "../MenuStyled";

const NoteMenuAppearKeyframesMobile = keyframes`
    from {
        opacity: 0;
        translate: 0 100%;
    }
    to {
        opacity: 1;
        translate: 0 0;
    }
`;

const NoteMenuWrapperStyled = styled.div`
    @media (max-width: ${props => props.mobile_size}px) {
        position: fixed;
        bottom: 0;
        left: 0;
        width: ${(props) => (props.menu_open ? "100vw" : "0")};
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(0.1em);

        z-index: 1500;
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
        animation: ${NoteMenuAppearKeyframesMobile} 300ms ease-out;
        overflow-y: auto;

        &.menu-exit {
            opacity: 1;
            transform: translateY(0);
        }

        &.menu-exit-active {
            opacity: 0;
            transform: translateY(100%);
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
