import React from "react";
import styled from "styled-components";
import {LuUser} from "react-icons/lu";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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
    font-weight: 600;

    span {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }

    span .react-loading-skeleton {
        --base-color: var(--color-background-skeletonbase);
        --highlight-color: var(--color-background-skeletonhighlight);
        width: 100%;
        height: 100%;
        border-radius: 50%;
    }
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

const Avatar = ({avatarUrl, isLoading = false}) => {
    const [imageError, setImageError] = React.useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    if (isLoading) {
        return (
            <AvatarContainer>
                <Skeleton/>
            </AvatarContainer>
        );
    }

    return (
        <AvatarContainer>
            {avatarUrl && !imageError ? (
                <StyledAvatar
                    src={avatarUrl}
                    alt="User Avatar"
                    onError={handleImageError}
                />
            ) : (
                <StyledIcon/>
            )}
        </AvatarContainer>
    );
};

export default Avatar;
