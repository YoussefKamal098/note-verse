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

const DynamicMenuContainerStyled = styled.div`
    position: absolute;
    min-width: 300px;
    height: 100vh;
    max-height: 350px;
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
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow-darker);
    user-select: text;
    transition: opacity 300ms ease, transform 300ms ease;
    animation: ${appearKeyframes} 300ms ease-out;
    z-index: 999;

    &.menu-enter {
        opacity: 0;
        transform: translateY(-10px);
    }

    &.menu-enter-active {
        opacity: 1;
        transform: translateY(0);
    }

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
        translate: 0 0;
        padding-top: 0;
        border-radius: 25px 25px 0 0;
        overflow-y: auto;
        transition: opacit 300ms ease, translate 300ms ease;

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
    aspect-ratio: 1/1;
    border-radius: 50%;
    background: transparent;
    color: var(--color-placeholder);
    border: none;
    cursor: pointer;
    padding: 0.25em;
    display: flex;
    align-items: center;
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
    height: 100%;
    min-height: 200px;
    overflow-y: auto;
    overflow-x: hidden;
`

const OptionsStyled = styled.ul`
    position: absolute;
    display: flex;
    width: 100%;
    flex-direction: column;
    font-size: 14px;
    gap: 0.5em;

    &.slide-right-enter {
        transform: translateX(100%);
        transition: transform 0s ease;
    }

    &.slide-right-enter-active {
        transform: translateX(0);
        transition: transform 300ms ease;
    }

    &.slide-right-exit {
        transform: translateX(0);
        transition: transform 0s ease;
    }

    &.slide-right-exit-active {
        transform: translateX(100%);
        transition: transform 300ms ease;
    }

    &.slide-left-enter {
        transform: translateX(-100%);
        transition: transform 0s ease;
    }

    &.slide-left-enter-active {
        transform: translateX(0);
        transition: transform 300ms ease;
    }

    &.slide-left-exit {
        transform: translateX(0);
        transition: transform 0s ease;
    }

    &.slide-left-exit-active {
        transform: translateX(-100%);
        transition: transform 300ms ease;
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
