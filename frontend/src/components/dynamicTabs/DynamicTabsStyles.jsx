import styled from "styled-components";

const TabsListWrapperStyled = styled.div`
    .react-tabs__tab-list {
        display: flex;
        align-items: center;
        padding: 0.3em 0;
        margin: 0 0 0.5em;
        border: none;
        gap: 1.5em;
    }

    .react-tabs__tab,
    .react-tabs__tab:focus {
        position: relative;
        display: inline-block;
        padding: 0.6em 0.9em;
        font-size: 0.9em;
        font-weight: 500;
        color: var(--color-text);
        background: var(--color-background);
        border: var(--border-width) solid var(--color-border-secondary);
        border-radius: calc(var(--border-radius) / 1.5);
        box-shadow: var(--box-shadow);
        transition: 0.3s ease;
    }

    .react-tabs__tab:hover,
    .react-tabs__tab--selected,
    .react-tabs__tab--selected:focus {
        background: var(--color-accent);
        color: var(--color-background);
        border-color: transparent;
        padding: 0.6em 1.1em;
    }

    .react-tabs__tab:active {
        scale: 0.8;
    }

    .react-tabs__tab:after,
    .react-tabs__tab:focus:after,
    .react-tabs__tab--selected:focus:after {
        position: absolute;
        content: '';
        background: transparent;
        border: none;
        border-radius: 1em;
        width: 0;
        height: 0;
        right: 0;
        left: 0;
        top: 0;
        bottom: 0;
    }

    .react-tabs__tab:not(:last-child):after,
    .react-tabs__tab:not(:last-child):focus:after,
    .react-tabs__tab--selected:not(:last-child):focus:after {
        background: var(--color-border);
        border-radius: 1em;
        width: var(--border-width);
        height: 75%;
        top: 50%;
        left: calc(100% + 0.75em + var(--border-width));
        transform: translateY(-50%);
    }

    ${({tabs_count}) => tabs_count && `
    @media (max-width: calc(120px * ${tabs_count} + 120px)) {
        .react-tabs__tab-list {
            flex-direction: column;
        }
    
        .react-tabs__tab:not(:first-child),
        .react-tabs__tab:not(:first-child):focus {
            margin-left: 0;
        }
    
        .react-tabs__tab:not(:last-child):after,
        .react-tabs__tab:not(:last-child):focus:after,
        .react-tabs__tab--selected:not(:last-child):focus:after {
            height: var(--border-width);
            width: 75%;
            left: 50%;
            top: calc(100% + 0.75em + var(--border-width));
            transform: translateX(-50%);
    }`}
`

const TitleWrapperStyled = styled.div`
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0.5em;

    .tab-title {
        max-width: 5em;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden
    }
`

const TabBodyStyled = styled.div`
    & > * {
        background-color: var(--color-background-primary);
        border-radius: calc(var(--border-radius) / 2);
        border-top-right-radius: 0;
        border-top-left-radius: 0;
    }
`

const TabStyled = styled.div`
    &.full-screen {
        position: fixed;
        top: 0;
        left: 0;
        margin: 0;
        padding: 0;
        width: 100vw;
        height: 100vh;
        overflow: auto;
        background-color: var(--color-background-primary);
        z-index: 1000;
    }

    &.full-screen .tab-body > * {
        min-height: 100vh;
    }

    &.full-screen .tab-body {
        margin-top: 2rem;
    }

    // This is especially for markdown editor tab

    &.full-screen .tab-body .cm-editor,
    &.full-screen .tab-body .cm-content {
        min-height: 100vh;
    }
`

const ToolbarStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    background-color: var(--color-background-primary);
    border-bottom: var(--border-width) solid var(--color-border);
    border-radius: calc(var(--border-radius) / 2);
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    box-shadow: var(--box-shadow);
    padding: 0.2em 0.3em;
    margin-bottom: 0.5em;
    gap: 0.5em;

    &.full-screen {
        position: fixed;
        width: 100vw;
        border-radius: 0;
        top: 0;
        left: 0;
        z-index: 1000;
    }

    &.fixed {
        border-radius: 0;
    }
`

const ToolStyled = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 1em;
    aspect-ratio: 1/1;
    border-radius: calc(var(--border-radius) / 4);
    font-size: 1.3em;
    color: var(--color-primary);
    transition: 0.3s ease;
    cursor: pointer;

    &:hover {
        background-color: var(--color-background-secondary);
    }
`

export {
    TabStyled,
    ToolbarStyled,
    TabBodyStyled,
    TitleWrapperStyled,
    TabsListWrapperStyled,
    ToolStyled
};
