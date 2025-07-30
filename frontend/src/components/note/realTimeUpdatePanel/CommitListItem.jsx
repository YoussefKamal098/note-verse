import React, {useEffect} from 'react';
import styled from 'styled-components';
import Tooltip from "@/components/tooltip/Tooltip";
import UserDetailsWithVersionMeta from "@/components/userDetails/UserDetailsWithVersionMeta";
import {useAuth} from "@/contexts/AuthContext";
import useVersion from '@/hooks/useVersion';
import Button, {BUTTON_TYPE} from "@/components/buttons/Button";

const ListItem = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 10px;
    font-size: 0.9em;
    background: var(--color-background-primary);
    border-radius: 7px;
    transition: all 0.2s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: var(--box-shadow);
        background-color: var(--color-background-secondary);
        cursor: pointer;
    }
`;

const RetryWrapper = styled.div`
    padding: 10px;
    font-size: 0.75em;
    font-weight: 600;
    text-align: center;
    color: var(--color-danger);
`;

const CommitListItem = ({noteOwnerId, versionId, onClick}) => {
    const {user} = useAuth();
    const {
        version,
        createdByUser,
        loading,
        error,
        fetch
    } = useVersion(versionId);

    useEffect(() => {
        fetch();
    }, [fetch]);

    if (error) {
        return (
            <RetryWrapper>
                <Button
                    type={BUTTON_TYPE.INFO} onClick={fetch}
                    style={{width: "fit-content", margin: "0 auto 10px"}}
                >
                    Retry
                </Button>
                Failed to load commit data.
            </RetryWrapper>
        );
    }

    return (
        <ListItem onClick={!error && !loading ? () => onClick(version) : undefined}>
            <Tooltip title={loading ? "loading..." : `"${version?.message || ''}"`}>
                <UserDetailsWithVersionMeta
                    firstname={createdByUser?.firstname}
                    lastname={createdByUser?.lastname}
                    avatarUrl={createdByUser?.avatarUrl}
                    createdAt={version?.createdAt}
                    commitMessage={version?.message}
                    versionLabel={version?.label}
                    showYouBadge={user?.id === createdByUser?.id}
                    showOwnerBadge={createdByUser?.id === noteOwnerId}
                    isLoading={loading}
                />
            </Tooltip>
        </ListItem>
    );
};

export default React.memo(CommitListItem);
