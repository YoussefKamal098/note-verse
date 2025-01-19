import React from "react";
import {useAuth} from "../../contexts/AuthContext";
import Tooltip from "../tooltip/Tooltip";
import {capitalizeStringFirstLetter, getInitials} from "shared-utils/string.utils";
import styled from "styled-components";

const AvatarStyled = styled.div`
    width: 2.5em;
    height: 2.5em;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: var(--color-background-secondary);
    color: var(--color-text);
    font-size: 1.25em;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;

const Avatar = () => {
    const {user} = useAuth();

    return (
        <Tooltip
            title={`${capitalizeStringFirstLetter(user.firstname)} ${capitalizeStringFirstLetter(user.lastname)}`}>
            <AvatarStyled>{getInitials(user.firstname, user.lastname)}</AvatarStyled>
        </Tooltip>
    );
};

export default Avatar;
