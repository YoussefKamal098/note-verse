import styled from "styled-components";

const TabBodyStyled = styled.div`
   & > * {
       background-color: var(--color-background-primary);
       border-radius: calc(var(--border-radius) / 2);
       border-top-right-radius: 0;
       border-top-left-radius: 0;
       box-shadow: var(--box-shadow);
    }
`

const TabStyled = styled.div`
    .tap:has(.tool.full-screen)  {
        position: fixed;
        top:0;
        left:0;
        margin: 0;
        padding: 0;
        width: 100vw;
        height: 100vh;
        overflow: auto;
        background-color: var(--color-background-primary);
        z-index: 1000;
    }

    .tap:has(.tool.full-screen) .tab-body > * {
        min-height: 100vh;
    }
    
    .tap:has(.tool.full-screen) .tab-body .cm-editor,
    .tap:has(.tool.full-screen) .tab-body .cm-content{
        min-height: 100vh;
    }
`

const ToolbarStyled= styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background-color: var(--color-background-primary);
    border-bottom: var(--border-width) solid var(--color-border);
    border-radius: calc(var(--border-radius) / 2);
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    box-shadow: var(--box-shadow);
    padding: 0.2em 0.3em;
    margin-bottom: 0.5em;
    gap: 0.5em;
    
    .tool {
        border-radius: calc(var(--border-radius) / 4);
        font-size: 1.3em;
        color: var(--color-primary);
        transition: 0.3s ease;
        cursor: pointer;
    }

    .tool:hover {
        background-color: var(--color-background-secondary);
    }
`

export { TabStyled, ToolbarStyled, TabBodyStyled };