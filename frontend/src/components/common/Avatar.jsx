import styled from "styled-components";
import {LuUser} from "react-icons/lu";
import React from "react";

const AvatarContainer = styled.div`
    width: 100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-background);
`;

const StyledAvatar = styled.img`
    width: 100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
    object-fit: cover;
`;

const StyledIcon = styled(LuUser)`
    width: 60%;
    height: 60%;
    color: var(--color-text);
`;

const Avatar = ({avatarUrl}) => {
    return (
        <AvatarContainer>
            {avatarUrl ? <StyledAvatar src={avatarUrl} alt="User Avatar"/> : <StyledIcon/>}
        </AvatarContainer>
    );
};

export default Avatar;
