import styled from "styled-components";

const StyledTooltipWrapper = styled.div`
    position: fixed;
    background-color: var(--color-background);
    color: var(--color-placeholder);
    max-width: 25em;
    text-align: center;
    text-wrap: wrap;
    word-wrap: break-word;
    white-space: wrap;
    font-size: 0.75em;
    font-weight: 600;
    padding: 0.3em 0.4em;
    border: 2px solid var(--color-border);
    border-radius: 10px;
    box-shadow: var(--box-shadow);
    translate: ${(props) => (props.show ? 0 : "0 -1em")};
    opacity: ${(props) => (props.show ? 1 : 0)};
    visibility: ${(props) => (props.show ? "visible" : "hidden")};
    transition: opacity 0.3s ease, translate 0.3s ease;
    z-index: 3000;
    pointer-events: none;
`;

const StyledArrow = styled.div`
    position: absolute;
    content: "";
    width: 1em;
    aspect-ratio: 1/1;
    background-color: var(--color-background);
    border: 2px solid var(--color-border);
    border-top-left-radius: 5px;
    left: 50%;
    rotate: 45deg;
    z-index: -1;

    ${({position}) => position === "top" && `
       bottom: 0;
       border-left-color: transparent;
       border-top-color: transparent;
       border-bottom-right-radius: 5px;
       translate: -50% 50%; 
    `}
    ${({position}) => position === "bottom" && `
       top: 0;
       border-right-color: transparent;
       border-bottom-color: transparent;
       border-top-left-radius: 5px;
       translate: -50% -50%; 
    `}
`;

export {StyledTooltipWrapper, StyledArrow}
