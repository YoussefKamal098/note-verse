import React, {useCallback} from 'react';
import {FaUsers} from "react-icons/fa";
import InfiniteScrollList from '@/components/infiniteScrollListPopUp';
import UserDetailsWithContributions from "@/components/userDetails/UserDetailsWithContributions";
import {ListItem} from "./styles";
import noteService from "@/api/noteService";

const ContributorInfiniteScrollList = ({noteId, isOpen = false, onItemClick, onClose}) => {
    const fetchContributors = useCallback(async (page, pageSize) => {
        const result = await noteService.getContributors(noteId, {page, limit: pageSize});
        return result.data.contributors;
    }, [noteId]);

    const renderContributorItem = useCallback((contributor) => (
        <ListItem key={contributor.id} onClick={() => onItemClick?.(contributor.user.id)}>
            <UserDetailsWithContributions
                firstname={contributor.user.firstname}
                lastname={contributor.user.lastname}
                avatarUrl={contributor.user.avatarUrl}
                lastContributed={contributor.lastCommitAt}
                contributions={contributor.commitCount}
            />
        </ListItem>
    ), []);

    return (
        <InfiniteScrollList
            isOpen={isOpen}
            onClose={onClose}
            title="Contributors"
            icon={<FaUsers/>}
            fetchData={fetchContributors}
            renderItem={renderContributorItem}
        />
    );
};

export default React.memo(ContributorInfiniteScrollList);
