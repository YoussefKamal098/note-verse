import React, {useCallback} from 'react';
import {TbHistoryToggle} from "react-icons/tb";
import UserDetailsWithVersionMeta from "@/components/userDetails/UserDetailsWithVersionMeta";
import Tooltip from "@/components/tooltip/Tooltip";
import InfiniteScrollList from '@/components/infiniteScrollListPopUp';
import {ListItem} from "./styles";
import {useAuth} from "@/contexts/AuthContext";
import noteService from "@/api/noteService";

const CommitHistory = ({noteId, isOpen = false, onItemClick, onClose}) => {
    const {user} = useAuth();

    const fetchCommits = useCallback(async (page, pageSize) => {
        const result = await noteService.getCommitHistory(noteId, {page, limit: pageSize});
        return result.data;
    }, [noteId]);

    const renderCommitItem = useCallback((commit) => (
        <ListItem key={commit.id} onClick={() => onItemClick?.(commit.id)}>
            <Tooltip title={`"${commit.message}"`}>
                <UserDetailsWithVersionMeta
                    firstname={commit.user.firstname}
                    lastname={commit.user.lastname}
                    avatarUrl={commit.user.avatarUrl}
                    createdAt={commit.createdAt}
                    commitMessage={commit.message}
                    showYouBadge={user.id === commit.user.id}
                />
            </Tooltip>
        </ListItem>
    ), []);

    return (
        <InfiniteScrollList
            isOpen={isOpen}
            onClose={onClose}
            title="Commit History"
            icon={<TbHistoryToggle/>}
            fetchData={fetchCommits}
            renderItem={renderCommitItem}
        />
    );
};

export default React.memo(CommitHistory);
