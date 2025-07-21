import React from "react";
import styled from "styled-components";

const StyledMarker = styled.span`
    padding: 5px 10px;
    border-radius: 5px;
    background-color: var(--color-primary);
    color: var(--color-text-dark-lighter);
    font-size: 0.75em;
    font-weight: 600;
    text-wrap: nowrap;
    user-select: none;
`;

const CurrentSessionMarker = ({children}) => (
    <StyledMarker>{children}</StyledMarker>
);

export default CurrentSessionMarker;
