import styled, {keyframes} from "styled-components";

const appearKeyframes = keyframes`
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;


const mobileAppearKeyframes = keyframes`
    from {
        transform: translateY(100%);
    }
    to {
        transform: translateY(0);
    }
`;

const DynamicMenuWrapperStyled = styled.div`
    @media (max-width: ${props => props.$mobileSize}px) {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100vw;
        height: ${(props) => (props.$isOpen ? "100vh" : "0")};
        opacity: ${(props) => (props.$isOpen ? "1" : "0")};
        transition: opacity 300ms;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(0.1em);
        z-index: 1500;
        overflow: visible;
    }
`

const DynamicMenuHeaderStyled = styled.div`
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

const DynamicMenuContainerStyled = styled.div`
    position: absolute;
    min-width: 200px;
    max-width: 250px;
    max-height: 75vh;
    overflow-y: auto;
    overflow-x: hidden;
    translate: 0 100%;
    bottom: -5px;
    right: 0;
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 1.75em 0.5em;
    background-color: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow-darker);
    user-select: text;
    transition: opacity 300ms ease, transform 300ms ease;
    animation: ${appearKeyframes} 300ms ease-out;
    z-index: 999;

    &.menu-exit {
        opacity: 1;
        transform: translateY(0);
    }

    &.menu-exit-active {
        opacity: 0;
        transform: translateY(-10px);
    }

    @media (max-width: ${props => props.$mobileSize}px) {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100vw;
        height: 75vh;
        min-width: 100vw;
        max-height: 100vh;
        transform: translateX(0);
        padding-top: 0;
        border-radius: 20px 20px 0 0;
        border: none;
        overflow-y: auto;
        transition: opacit 300ms ease, translate 300ms ease;
        animation: ${mobileAppearKeyframes} 300ms ease-out;
        z-index: 2000;

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

const DynamicMenuTriggerButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 1.5em;
    max-width: 1.5em;
    aspect-ratio: 1/1;
    border-radius: 50%;
    background: transparent;
    color: var(--color-placeholder);
    border: none;
    cursor: pointer;
    font-size: 1.5em;
    transition: 300ms ease;

    &:hover {
        background-color: var(--color-background-secondary);
        rotate: 180deg;
    }

    ${(props) => (props.$isOpen ? `
        background-color: var(--color-background-secondary);
        rotate: 180deg;
    ` : ``)};
`;

const OptionsWrapperStyled = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 100px;
    max-height: 220px;
    overflow-y: auto;
    overflow-x: hidden;

    @media (max-width: ${props => props.$mobileSize}px) {
        max-height: 100%;
    }
`

const OptionsStyled = styled.ul`
    list-style-type: none;
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    font-size: 13px;
    gap: 0.5em;

    &.slide-right-enter {
        position: absolute;
        transform: translateX(100%);
        transition: 0s cubic-bezier(0.4, 0, 0.2, 1);
    }

    &.slide-right-enter-active {
        position: absolute;
        transform: translateX(0);
        transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    &.slide-right-enter-done {
        position: relative;
    }

    &.slide-right-exit {
        position: absolute;
        transform: translateX(0);
        transition: 0s cubic-bezier(0.4, 0, 0.2, 1);
    }

    &.slide-right-exit-active {
        position: absolute;
        transform: translateX(100%);
        opacity: 0;
        transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    &.slide-left-enter {
        position: absolute;
        transform: translateX(-100%);
        transition: 0s cubic-bezier(0.4, 0, 0.2, 1);
    }

    &.slide-left-enter-active {
        position: absolute;
        transform: translateX(0);
        transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    &.slide-left-enter-done {
        position: relative;
    }

    &.slide-left-exit {
        position: absolute;
        transform: translateX(0);
        transition: 0s cubic-bezier(0.4, 0, 0.2, 1);
    }

    &.slide-left-exit-active {
        position: absolute;
        transform: translateX(-100%);
        transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }
`;

const OptionWrapperStyled = styled.li`
    position: relative;
    user-select: none;
`;

const OptionStyled = styled.div`
    position: relative;
    display: grid;
    grid-template-rows: 1fr auto;
    grid-template-columns: 1fr auto;
    align-items: center;
    justify-content: space-between;
    color: var(--color-placeholder);
    padding: 0.75em;
    border-radius: var(--border-radius);
    column-gap: 0.75em;
    transition: 0.2s ease-in-out;
    cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};

    &:hover {
        background-color: var(--color-background-secondary);
        color: ${(props) => (props.$danger ? "var(--color-danger)" : "var(--color-primary)")};
        opacity: ${(props) => (props.$disabled ? 0.7 : 1)};
    }
`;

const OptionIconStyled = styled.div`
    display: flex;
    font-size: 1.4em;
`;

const OptionTextStyled = styled.div`
    font-weight: 600;
    text-wrap: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
`;

const OptionIconTextContainerStyled = styled.div`
    display: grid;
    grid-template-rows: auto 1fr;
    grid-template-columns: auto 1fr;
    align-items: center;
    justify-content: center;
    column-gap: 0.5em;
`

const OptionIconsContainerStyled = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`

export {
    DynamicMenuWrapperStyled,
    DynamicMenuHeaderStyled,
    DynamicMenuContainerStyled,
    DynamicMenuTriggerButton,
    OptionsWrapperStyled,
    OptionsStyled,
    OptionWrapperStyled,
    OptionStyled,
    OptionIconStyled,
    OptionTextStyled,
    OptionIconTextContainerStyled,
    OptionIconsContainerStyled
}
