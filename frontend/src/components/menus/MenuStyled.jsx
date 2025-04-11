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

const appearKeyframesMobile = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const MenuContainerStyled = styled.div`
    position: absolute;
    min-width: 300px;
    translate: 0 100%;
    bottom: -5px;
    right: 0;
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 1.75em 0;
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
`;

const OptionsStyled = styled.ul`
    display: flex;
    flex-direction: column;
    font-size: 14px;
    gap: 0.5em;
`;

const OptionWrapperStyled = styled.li`
    position: relative;
    width: 100%;
    user-select: none;
`;

const OptionStyled = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    color: var(--color-placeholder);
    padding: 0.75em;
    margin: 0 1em;
    border-radius: var(--border-radius);
    gap: 0.75em;
    transition: 0.2s ease-in-out;
    cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};

    &:hover {
        background-color: var(--color-background-secondary);
        color: ${(props) => (props.danger ? "var(--color-danger)" : "var(--color-primary)")};
        opacity: ${(props) => (props.disabled ? 0.7 : 1)};
    }
`;

const OptionIconStyled = styled.div`
    display: flex;
    font-size: 1.4em;
`;

const OptionTextStyled = styled.div`
    display: flex;
    align-items: center;
    font-weight: 600;
    gap: 0.5em;
`;

const ArrowStyled = styled.div`
    display: flex;
    font-size: 1.3em;
    margin-left: auto;
    transform: rotate(0deg);
    transition: 500ms ease;

    &.open {
        transform: rotate(180deg);
    }
`;

const DynamicMenuWrapperStyled = styled.div`
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

const DynamicMenuContainerStyled = styled(MenuContainerStyled)`
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

    ${(props) => (props.menu_open ? `
        background-color: var(--color-background-secondary);
        rotate: 180deg;
    ` : ``)};
`;


export {
    appearKeyframes,
    appearKeyframesMobile,
    MenuContainerStyled,
    OptionsStyled,
    OptionWrapperStyled,
    OptionStyled,
    OptionIconStyled,
    OptionTextStyled,
    DynamicMenuWrapperStyled,
    DynamicMenuHeaderStyled,
    DynamicMenuContainerStyled,
    DynamicMenuTriggerButton,
    ArrowStyled,
}
