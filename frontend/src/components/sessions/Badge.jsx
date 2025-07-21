import React from "react";
import styled from "styled-components";

const StyledBadge = styled.span`
    padding: 5px 10px;
    border-radius: 25px;
    font-size: 0.75em;
    font-weight: 600;
    color: ${({$active}) => $active ? 'var(--color-text-dark-lighter)' : 'var(--color-placeholder)'};
    background-color: ${({$active}) => $active ? 'var(--color-accent)' : 'var(--color-background-secondary)'};
    border: ${({$active}) => $active ? 'none' : "2px solid var(--color-border)"};
    user-select: none;
`;

const Badge = ({active, children}) => (
    <StyledBadge $active={active}>{children}</StyledBadge>
);

export default Badge;
