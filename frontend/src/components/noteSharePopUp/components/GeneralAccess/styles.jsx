import styled from "styled-components";

const AccessRowStyles = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    border-radius: 4px;
    padding: 0.5rem 0;
    transition: padding 0.2s;

    &:hover {
        padding: 0.5rem;
        background: var(--background-tertiary);
    }
`;

const AccessLeftStyles = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const AccessInfoStyles = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
`;

const AccessRightStyles = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const AccessTypeStyles = styled.div`
    color: var(--color-text);
    font-size: 0.9em;
`;

const AccessDescriptionStyles = styled.div`
    font-size: 0.8rem;
    color: var(--color-placeholder);
`;


export {
    AccessRowStyles,
    AccessTypeStyles,
    AccessDescriptionStyles,
    AccessLeftStyles,
    AccessInfoStyles,
    AccessRightStyles
}
