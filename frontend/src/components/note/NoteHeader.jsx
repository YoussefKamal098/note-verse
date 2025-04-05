import React from "react";
import styled from "styled-components";
import {differenceInDays, format, formatDistanceToNow, isSameYear} from "date-fns";
import Skeleton, {SkeletonTheme} from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Avatar from "../common/Avatar";

const ContainerStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    width: 100%;
`;

const AvatarWrapperStyled = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    font-size: 1em;
    font-weight: 600;
    flex-shrink: 0;
    color: var(--color-placeholder);
    border-radius: 50%;
    border: 0.1em solid var(--color-border);
`;

const UserInfoStyled = styled.div`
    font-weight: 600;
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const FullNameStyled = styled.span`
    font-size: 0.9375rem;
    color: var(--color-text);
`;

const DateStyled = styled.span`
    font-size: 0.7125rem;
    color: var(--color-placeholder);
    opacity: 0.8;
    display: flex;
    align-items: center;
    gap: 4px;
`;

const formatSocialDate = (date) => {
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();

        // If the date is invalid
        if (isNaN(dateObj)) return 'N/A';

        const daysDifference = differenceInDays(now, dateObj);

        // Within the last 7 days: show relative time with suffix
        if (daysDifference < 7) {
            return formatDistanceToNow(dateObj, {addSuffix: true});
        }

        // Current year: show month and day
        if (isSameYear(dateObj, now)) {
            return format(dateObj, 'MMM d');
        }

        // Previous years: show month, day, and year
        return format(dateObj, 'MMM d, yyy');
    } catch {
        return 'N/A';
    }
};

const NoteHeader = ({fullName, createdAt, avatarUrl, loading = false}) => {
    return (
        <SkeletonTheme baseColor="var(--color-background-skeletonbase)"
                       highlightColor="var(--color-background-skeletonhighlight)">
            <ContainerStyled>
                <AvatarWrapperStyled>
                    {loading ? (
                        <Skeleton circle width={45} height={45}/>
                    ) : (
                        <Avatar avatarUrl={avatarUrl}/>
                    )}
                </AvatarWrapperStyled>
                <UserInfoStyled>
                    <FullNameStyled>
                        {loading ? <Skeleton width={150}/> : fullName}
                    </FullNameStyled>
                    <DateStyled>
                        {loading ? <Skeleton width={100}/> : formatSocialDate(createdAt)}
                    </DateStyled>
                </UserInfoStyled>
            </ContainerStyled>
        </SkeletonTheme>
    );
};

export default React.memo(NoteHeader);
