import styled from "styled-components";

export const ListItem = styled.div`
    display: flex;
    flex-direction: column;
    padding: 10px;
    font-size: 0.9em;
    background: var(--color-background-primary);
    border-radius: 7px;
    transition: all 0.2s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: var(--box-shadow);
        background-color: var(--color-background-secondary);
        cursor: pointer;
    }
`;
