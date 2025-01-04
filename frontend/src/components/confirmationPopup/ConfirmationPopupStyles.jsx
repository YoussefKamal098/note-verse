import styled from "styled-components";

const PopUpOverlay = styled.div`
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(0.1em);
    z-index: 1000;
`;

const PopupContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2em;
    align-items: center;
    background-color: var(--color-background);
    padding: 1em;
    border-radius: var(--border-radius);
    width: 75vw;
    max-width: 30em;
    box-shadow: var(--box-shadow);
    position: relative;

    .confirm-text {
        align-self: flex-start;
        display: flex;
        align-items: center;
        gap: 0.5em;
        font-size: 1em;
        font-weight: 500;
        text-align: left;
        color: var(--color-placeholder);
    }
    
    .icon {
        align-self: flex-start;
        font-size: 1.1em;
    }

    .controlling-buttons {
        font-size: 0.9em;
        align-self: flex-end;
        display: flex;
        gap: 0.5em;
    }
`;

export { PopUpOverlay, PopupContainer };
