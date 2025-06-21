import React from "react";
import styled from "styled-components";
import {MdPublic, MdVpnLock} from "react-icons/md";
import {formatSocialDate} from "../../utils/date";
import Skeleton, {SkeletonTheme} from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Avatar from "../common/Avatar";

const UserCardStyles = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
`;

const AvatarContainerStyles = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 2.5em;
    height: 2.5em;
    font-size: 1em;
    font-weight: 600;
    flex-shrink: 0;
    color: var(--color-placeholder);
    border-radius: 50%;
    border: 0.1em solid var(--color-border);
`;

const UserDetails = styled.div`
    font-weight: 600;
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const UserName = styled.span`
    font-size: 0.9375rem;
    color: var(--color-text);
`;

const MetaInfo = styled.span`
    display: flex;
    align-items: center;
    font-size: 0.7125rem;
    color: var(--color-placeholder);
    opacity: 0.8;
    gap: 4px;
`;

const PublicIconStyles = styled(MdPublic)`
    font-size: 1.5em;
    color: var(--color-placeholder);
`;

const PrivateIconStyles = styled(MdVpnLock)`
    font-size: 1.5em;
    color: var(--color-placeholder);
`;

const UserProfileWithMeta = ({
                                 firstname,
                                 lastname,
                                 avatarUrl,
                                 createdAt,
                                 isPublic = false,
                                 loading = false
                             }) => {
    return (
        <SkeletonTheme baseColor="var(--color-background-skeletonbase)"
                       highlightColor="var(--color-background-skeletonhighlight)"
        >
            <UserCardStyles>
                <AvatarContainerStyles>
                    {loading ? (
                        <Skeleton circle width={45} height={45}/>
                    ) : (
                        <Avatar avatarUrl={avatarUrl}/>
                    )}
                </AvatarContainerStyles>
                <UserDetails>
                    <UserName>
                        {loading && <Skeleton width={150}/>}
                        {firstname && lastname && !loading && `${firstname} ${lastname}`}
                    </UserName>
                    <MetaInfo>
                        {loading && <Skeleton width={100}/>}
                        {createdAt && !loading && (
                            <>
                                {formatSocialDate(createdAt)} .
                                {isPublic ? <PublicIconStyles/> : <PrivateIconStyles/>}
                            </>
                        )}
                    </MetaInfo>
                </UserDetails>
            </UserCardStyles>
        </SkeletonTheme>
    );
};

export default React.memo(UserProfileWithMeta);
