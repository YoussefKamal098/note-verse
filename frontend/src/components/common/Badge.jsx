import React from 'react';
import styled from 'styled-components';

const BadgeWrapper = styled.span`
    display: inline-block;
    padding: 2px 5px;
    font-size: 0.6em;
    font-weight: 600;
    font-family: Pacifico, cursive;
    background-color: var(--color-background-secondary);
    border-radius: 25px;
    border: 2px solid var(--color-border-secondary);
    box-shadow: var(--box-shadow);
    text-transform: capitalize;
    user-select: none;
    transition: all 0.3s ease;
    color: var(--color-placeholder-dark);
    transform: scale(1);
    cursor: default;

    ${({$type}) => {
        if ($type === "owner") {
            return "color: var(--color-accent);"
        } else if ($type === "you") {
            return "color: var(--color-primary);"
        }
    }}

`;

const Badge = ({label, ...props}) => {
    const type = label.toLowerCase();
    return <BadgeWrapper $type={type} {...props}>{label}</BadgeWrapper>;
};

export default Badge;
