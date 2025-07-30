import React, {useCallback, useMemo, useRef, useState, useEffect} from 'react';
import styled from "styled-components";
import {useNoteContext, useNoteSelector} from "../hooks/useNoteContext";
import {useNoteSocket} from "../hooks/useNoteSocket";
import {useToastNotification} from "@/contexts/ToastNotificationsContext";
import SidePanel from '../SidePanel';
import {FiInfo} from "react-icons/fi";
import CommitList from './CommitList';
import LiveUpdatesEmptyState from './LiveUpdatesEmptyState';
import SelectedDiffModal from './SelectedDiffModal';

const InfoIcon = styled(FiInfo)`
    font-size: 0.9em;
    color: var(--color-placeholder);
    cursor: help;
`;

const RealTimeUpdatePanel = ({show, onClose, onPull, isMobile}) => {
    const {notify} = useToastNotification();
    const {selectors} = useNoteContext();
    const {id} = useNoteSelector(selectors.getMeta);
    const owner = useNoteSelector(selectors.getOwner);

    const [commits, setCommits] = useState([]);
    const commitSetRef = useRef(new Set()); //  Track versionIds

    const [selectedDiff, setSelectedDiff] = useState(null);

    const handleNoteUpdate = useCallback((data) => {
        const versionId = data?.versionId;
        if (versionId && !commitSetRef.current.has(versionId)) {
            commitSetRef.current.add(versionId);
            setCommits(prev => [versionId, ...prev]);
            notify.info("✨ A new update was made — check it out in the Live Updates panel!");
        }
    }, [notify]);

    useNoteSocket({
        noteId: id,
        onNoteUpdate: handleNoteUpdate,
    });

    // Cleanup commits if noteId changes (or on unmount)
    useEffect(() => {
        return () => {
            commitSetRef.current.clear();
            setCommits([]);
        };
    }, [id]);

    const handleCommitClick = useCallback((commit) => {
        if (commit?.patch) {
            setSelectedDiff({
                id: commit.id,
                diff: commit.patch,
                message: commit.message,
            });
        }
    }, []);

    const handleCloseModal = useCallback(() => setSelectedDiff(null), []);
    const memoizeSelectedDiff = useMemo(() => selectedDiff, [selectedDiff?.id]);

    const handlePullContent = useCallback(({id, content}) => {
        setCommits((prev) => prev.filter((commitId) => commitId !== id));
        commitSetRef.current.delete(id);
        setSelectedDiff(null);
        onPull?.(content);
    }, [onPull]);

    const memoizedCommits = useMemo(() => commits, [commits.length]);

    return (
        <>
            <SidePanel
                show={show}
                onClose={onClose}
                title="Live Updates"
                area="realtime_updates_panel"
                isMobile={isMobile}
                Icon={InfoIcon}
                iconTooltip={<div>
                    <p>Shows changes as they happen from currently online collaborators.</p>
                    <p>Only displays updates received while you're viewing this note.</p>
                </div>}
                style={!isMobile ? {minWidth: "300px", maxWidth: "300px"} : {}}
            >
                {memoizedCommits.length > 0 ? (
                    <CommitList
                        noteOwnerId={owner?.id}
                        commits={memoizedCommits}
                        onCommitClick={handleCommitClick}
                        isMobile={isMobile}
                    />
                ) : <LiveUpdatesEmptyState/>}
            </SidePanel>

            <SelectedDiffModal
                selectedDiff={memoizeSelectedDiff}
                onClose={handleCloseModal}
                onPull={handlePullContent}
            />
        </>
    );
};

export default React.memo(RealTimeUpdatePanel);
