import styled from "styled-components";

const StyledTooltipWrapper = styled.div`
    position: absolute;
    background-color: var(--color-background);
    color: var(--color-placeholder);
    max-width: 25em;
    text-wrap: wrap;
    word-wrap: break-word;
    white-space: wrap;
    font-size: 0.9em;
    padding: 0.3em 0.4em;
    border: calc(var(--border-width) / 2) solid var(--color-border);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    opacity: ${(props) => (props.show ? 1 : 0)};
    visibility: ${(props) => (props.show ? "visible" : "hidden")};
    transition: opacity 0.3s ease;
    z-index: 999;
    pointer-events: none;
`;

const StyledArrow = styled.div`
    position: absolute;
    content: "";
    width: 1em;
    height: 1em;
    background-color: var(--color-background);
    border: calc(var(--border-width) / 2) solid var(--color-border);
    border-top-left-radius: calc(var(--border-radius) / 2);
    left: 50%;
    rotate: 45deg;
    z-index: -1;

    ${({position}) => position === "top" && `
       bottom: 0;
       border-left-color: transparent;
       border-top-color: transparent;
       border-bottom-right-radius: calc(var(--border-radius) / 2);
       translate: -50% 50%; 
    `}
    ${({position}) => position === "bottom" && `
       top: 0;
       border-right-color: transparent;
       border-bottom-color: transparent;
       border-top-left-radius: calc(var(--border-radius) / 2);
       translate: -50% -50%; 
    `}
`;

export {StyledTooltipWrapper, StyledArrow}