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

export {
    appearKeyframes,
    appearKeyframesMobile,
    MenuContainerStyled,
    OptionsStyled,
    OptionWrapperStyled,
    OptionStyled,
    OptionIconStyled,
    OptionTextStyled,
    ArrowStyled
}
