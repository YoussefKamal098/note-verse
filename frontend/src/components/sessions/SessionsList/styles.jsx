import styled from "styled-components";

export const SessionsListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
`;

export const Message = styled.p`
    color: var(--color-placeholder);
    font-size: 1em;
    font-weight: 600;
    text-align: center;
    opacity: 0.75;
`;
