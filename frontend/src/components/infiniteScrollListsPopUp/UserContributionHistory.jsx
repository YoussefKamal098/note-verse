import React, {useCallback, useRef, useEffect, useState, useMemo} from 'react';
import {FaHistory} from "react-icons/fa";
import styled from "styled-components";
import InfiniteScrollList from '@/components/infiniteScrollListPopUp';
import Avatar from "@/components/common/Avatar";
import Tooltip from "@/components/tooltip/Tooltip";
import UserDetailsWithVersionMeta from "@/components/userDetails/UserDetailsWithVersionMeta";
import {useToastNotification} from "@/contexts/ToastNotificationsContext";
import {ListItem} from "./styles";
import userService from "@/api/userService";
import Badge from "@/components/common/Badge";
import {useAuth} from "@/contexts/AuthContext";

const AvatarWrapper = styled.div`
    position: relative;
    width: 1.25em;
    height: 1.25em;
    min-width: 1.25em;
    min-height: 1.25em;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--color-border);
    border-radius: 50%;
    background-color: var(--color-background-secondary);
    color: var(--color-placeholder);
    font-size: 1.25em;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
    overflow: hidden;
`;

const UserWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
`

const TitleWrapper = styled.div`
    display: flex;
    align-items: center;
    min-width: max-content;
    gap: 10px;
`

const UserContributionHistory = ({userId, noteId, isOpen = false, onItemClick, onClose}) => {
    const {user: authUser} = useAuth();
    const notify = useToastNotification();
    const infiniteScrollRef = useRef(null);
    const [isUserLoading, setIsUserLoading] = useState(false);
    const [user, setUser] = useState(null);

    const fetchUser = useCallback(async () => {
        try {
            setIsUserLoading(true);
            const result = await userService.getUser({id: userId});
            setUser(result.data);
        } catch (error) {
            notify.error('Failed to fetch contributor, ', error);
        } finally {
            setIsUserLoading(false);
        }
    }, [userId]);

    const fetchContributions = useCallback(async (page, pageSize) => {
        const result = await userService.getUserCommits(userId, {noteId, page, limit: pageSize});
        return result.data;
    }, [userId, noteId]);

    useEffect(() => {
        if (userId) fetchUser();
    }, [userId])

    const renderContributionItem = useCallback((contribution) => (
        <ListItem key={contribution.id} onClick={() => onItemClick?.(contribution.id)}>
            <Tooltip title={`"${contribution.message}"`}>
                <UserDetailsWithVersionMeta
                    firstname={contribution.firstname}
                    lastname={contribution.lastname}
                    avatarUrl={contribution.avatarUrl}
                    createdAt={contribution.createdAt}
                    commitMessage={contribution.message}
                />
            </Tooltip>
        </ListItem>
    ), []);

    const Title = useMemo(() => (
        user ?
            <TitleWrapper>
                Contributions of User
                <UserWrapper>
                    <Tooltip title={isUserLoading ? "loading..." : `${user.firstname} ${user.lastname}`}>
                        <AvatarWrapper>
                            <Avatar avatarUrl={user.avatarUrl} isLoading={isUserLoading}/>
                        </AvatarWrapper>
                    </Tooltip>
                    {authUser.id === userId && <Badge label={"you"}/>}
                </UserWrapper>
            </TitleWrapper> : ""
    ), [user, isUserLoading]);

    useEffect(() => {
        if (infiniteScrollRef.current) {
            infiniteScrollRef.current.resetData();
        }
    }, [userId]);

    return (
        <InfiniteScrollList
            ref={infiniteScrollRef}
            isOpen={isOpen}
            onClose={onClose}
            title={Title}
            icon={<FaHistory/>}
            iconLeft={true}
            fetchData={fetchContributions}
            renderItem={renderContributionItem}
        />
    );
};

export default React.memo(UserContributionHistory);
