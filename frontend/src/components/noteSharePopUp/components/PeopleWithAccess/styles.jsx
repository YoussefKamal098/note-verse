import styled from "styled-components";

const EmptyCollaboratorsStyles = styled.div`
    color: var(--color-text);
    font-size: 0.9em;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.5;
    padding-bottom: 2em;
`

const CollaboratorItemStyles = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-radius: 4px;
    transition: padding 0.2s;

    &:hover {
        padding: 0.5rem;
        background: var(--background-tertiary);
    }

`;

const CollaboratorLeftStyles = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
`;

const CollaboratorInfoStyles = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 1em;
`;

const AvatarWrapperStyles = styled.div`
    width: 32px;
    height: 32px;
`;


const EmailStyles = styled.span`
    font-size: 0.8em;
    color: var(--color-placeholder);
`;

const NameStyles = styled.span`
    ${({$isStroke}) => $isStroke && `
        text-decoration: line-through;
        text-decoration-color: var(--color-placeholder); 
        text-decoration-thickness: 2px;
    `}
    font-size: 0.9em;
`;


const YouBadgeStyles = styled.span`
    color: var(--color-placeholder);
    font-size: 0.8rem;
    margin-left: 0.5rem;
`;

const OwnerBadgeStyles = styled.span`
    background: var(--color-background-secondary);
    color: var(--color-placeholder);
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 0.5rem;
`;

const AccessListStyles = styled.div`
    position: relative;
    max-height: 200px;
    overflow-y: auto;
`;

export {
    EmptyCollaboratorsStyles,
    CollaboratorItemStyles,
    CollaboratorInfoStyles,
    CollaboratorLeftStyles,
    AccessListStyles,
    AvatarWrapperStyles,
    NameStyles,
    EmailStyles,
    YouBadgeStyles,
    OwnerBadgeStyles,
}
