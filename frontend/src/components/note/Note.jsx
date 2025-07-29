import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from "react-router-dom";
import styled from 'styled-components';
import {POPUP_TYPE} from '@/components/confirmationPopup/ConfirmationPopup';
import {useConfirmation} from "@/contexts/ConfirmationContext";
import Contributor from "@/components/infiniteScrollListsPopUp/Contributor";
import CommitHistory from "@/components/infiniteScrollListsPopUp/CommitHistory";
import UserContributionHistory from "@/components/infiniteScrollListsPopUp/UserContributionHistory";
import SharePopUp from "@/components/noteSharePopUp";
import CommitMessagePopup from "@/components/commitMessagePopup";
import useNoteValidation from "@/hooks/useNoteValidation";
import MainContent from "@/components/note/MainContent";
import useCopyLink from "@/hooks/useCopyLink";
import useMediaSize from "@/hooks/useMediaSize";
import {useNoteContext, useNoteSelector} from "./hooks/useNoteContext";
import Contributors from "./Contributors";
import RightSettingsPanel from './SettingsPanel';
import RealTimeUpdatePanel from './RealTimeUpdatePanel';
import {DEVICE_SIZES} from "@/constants/breakpoints";
import routesPaths from "@/constants/routesPaths";

const GridContainerStyles = styled.div`
    display: grid;
    grid-template-areas: ${({$showContributors, $showSettingsPanel}) => $showContributors ? `
        "contributors  ${$showSettingsPanel ? "settings_panel" : "realtime_updates_panel"}"
        "main_content  ${$showSettingsPanel ? "settings_panel" : "realtime_updates_panel"}"
        "main_content realtime_updates_panel"` : `
        "main_content ${$showSettingsPanel ? "settings_panel" : "realtime_updates_panel"}"
        "main_content realtime_updates_panel"`
    };

    grid-template-columns: 1fr auto;
    grid-template-rows: ${({$showContributors}) => $showContributors ? "auto auto 1fr" : "auto 1fr"};

    gap: 10px;
    width: 100%;
    max-width: ${({$showSettingsPanel, $showRealTimeUpdatesPanel}) =>
            $showSettingsPanel || $showRealTimeUpdatesPanel ? "900px" : "775px"};
    align-items: start;
`;

const Note = () => {
    const navigate = useNavigate();
    const copyLink = useCopyLink();
    const {showConfirmation} = useConfirmation();
    const {validateNote} = useNoteValidation();
    const isMobile = useMediaSize(DEVICE_SIZES.tablet);
    const {actions, selectors} = useNoteContext();
    const [showShare, setShowShare] = useState(false);
    const [commitHistoryOpen, setCommitHistoryOpen] = useState(false);
    const [contributorsOpen, setContributorsOpen] = useState(false);
    const [showSettings, setShowSettingsPanel] = useState(true);
    const [userContributionHistoryOpen, setUserContributionHistoryOpen] = useState(false);
    const [currentUserContributionHistoryId, setCurrentUserContributionHistoryId] = useState(null);
    const [commitMessageOpen, setCommitMessageOpen] = useState(false);
    const [showRealTimeUpdatesPanel, setShowRealTimeUpdatesPanel] = useState(!isMobile);
    const {editMode, isNew} = useNoteSelector(selectors.getStatus);
    const {id, isPublic} = useNoteSelector(selectors.getMeta);
    const {current, original} = useNoteSelector(selectors.getContent);
    const owner = useNoteSelector(selectors.getOwner);
    const isOwner = useNoteSelector(selectors.isOwner);
    const isContentChange = useNoteSelector(selectors.isContentChange);
    const markdownTabsRef = useRef(null);

    useEffect(() => {
        if (!isMobile) {
            setShowSettingsPanel(true);
            setShowRealTimeUpdatesPanel(true);
        } else {
            setShowSettingsPanel(false);
            setShowRealTimeUpdatesPanel(false);
        }
    }, [isMobile]);

    const handleDelete = useCallback(() => {
        showConfirmation({
            type: POPUP_TYPE.DANGER,
            confirmationMessage: "Are you sure you want to permanently delete this note? This action cannot be undone.",
            onConfirm: actions.deleteNote,
        });
    }, [actions.deleteNote, showConfirmation]);

    const handleDiscard = useCallback(() => {
        showConfirmation({
            type: POPUP_TYPE.WARNING,
            confirmationMessage: "Are you sure you want to discard all unsaved changes? Your modifications will be lost permanently.",
            onConfirm: async () => {
                markdownTabsRef.current.resetContent(original.content);
                await actions.discardChanges();
            },
        });
    }, [actions.discardChanges, showConfirmation, original.content]);

    const onVisibilityChange = useCallback((visibility) => {
        actions.updateVisibilityState(visibility);
    }, [actions.updateVisibilityState]);

    const handleOnSave = useCallback(async () => {
        const isValid = validateNote(current);

        if (isContentChange && !isNew && isValid) {
            setCommitMessageOpen(true);
            return;
        }

        if (!isValid) return;

        await actions.persistNote();
    }, [actions.persistNote, isContentChange, current]);

    const handleOnCommitSave = useCallback(async (message) => {
        setCommitMessageOpen(false);
        await actions.persistNote({commitMessage: message});
    }, [actions.persistNote]);

    const handleEdit = useCallback(() => {
        actions.toggleEditMode();
    }, [actions.toggleEditMode]);

    const handleCopyLink = useCallback(async () => {
        await copyLink();
    }, []);

    const handleShowShare = useCallback(() => {
        setShowShare((prev) => !prev);
    }, []);

    const handleSettingsIconClick = useCallback(() => {
        setShowSettingsPanel(prev => !prev);
    }, []);

    const handleRealTimeUpdatesIconClick = useCallback(() => {
        setShowRealTimeUpdatesPanel(prev => !prev);
    }, []);

    const handleShowCommitHistory = useCallback(() => {
        setCommitHistoryOpen(prev => !prev);
    }, []);

    const handleShowContributors = useCallback(() => {
        setContributorsOpen(prev => !prev);
    }, []);

    const handleCloseRealTimePanel = useCallback(() => {
        setShowRealTimeUpdatesPanel(false);
    }, []);

    const handleCloseSettingsPanel = useCallback(() => {
        setShowSettingsPanel(false);
    }, []);

    const handleCloseUserContributionHistory = useCallback(() => {
        setUserContributionHistoryOpen(false);
    }, []);

    const handleCloseCommitMessagePopup = useCallback(() => {
        setCommitMessageOpen(false);
    }, []);

    const handleContributorClick = useCallback((userId) => {
        setContributorsOpen(false);
        setCurrentUserContributionHistoryId(userId);
        setUserContributionHistoryOpen(true);
    }, []);

    const handleOnContributorClick = useCallback((userId) => {
        if (userId === 'overflow') {
            handleShowContributors();
        } else {
            setCurrentUserContributionHistoryId(userId);
            setUserContributionHistoryOpen(true);
        }
    }, []);

    const handleCommitClick = useCallback((id) => navigate(routesPaths.NOTE_VERSION(id)), [])
    
    const headerActions = useMemo(() => ({
        onSave: handleOnSave,
        onDelete: handleDelete,
        onDiscard: handleDiscard,
        onEdit: handleEdit,
        onCopyLink: handleCopyLink,
        onShowShare: handleShowShare,
        onSettingsIconClick: handleSettingsIconClick,
        onRealTimeUpdateIconClick: handleRealTimeUpdatesIconClick,
        onShowCommitHistory: handleShowCommitHistory
    }), [
        handleEdit,
        handleCopyLink,
        handleDelete,
        handleDiscard,
        handleShowShare,
        handleOnSave,
        handleShowCommitHistory,
        handleSettingsIconClick,
        handleRealTimeUpdatesIconClick
    ]);

    return (
        <GridContainerStyles
            $showContributors={!isNew && !editMode}
            $showSettingsPanel={showSettings}
            $showRealTimeUpdatesPanel={showRealTimeUpdatesPanel}
            $isMobile={isMobile}
        >
            <Contributors onContributorClick={handleOnContributorClick}/>
            <MainContent headerActions={headerActions} markdownTabsRef={markdownTabsRef}/>

            {isOwner && <SharePopUp
                noteMeta={{id, isPublic}}
                onClose={handleShowShare}
                onVisibilityChange={onVisibilityChange}
                show={showShare}
            />}
            <CommitHistory
                noteId={id}
                noteOwnerId={owner.id}
                isOpen={commitHistoryOpen}
                onItemClick={handleCommitClick}
                onClose={handleShowCommitHistory}
            />
            <Contributor
                noteId={id}
                noteOwnerId={owner.id}
                isOpen={contributorsOpen}
                onItemClick={handleContributorClick}
                onClose={handleShowContributors}
            />
            <UserContributionHistory
                noteId={id}
                userId={currentUserContributionHistoryId}
                noteOwnerId={owner.id}
                isOpen={userContributionHistoryOpen}
                onItemClick={handleCommitClick}
                onClose={handleCloseUserContributionHistory}
            />
            <CommitMessagePopup
                isOpen={commitMessageOpen}
                onClose={handleCloseCommitMessagePopup}
                onSave={handleOnCommitSave}
            />

            {isOwner && <RightSettingsPanel
                show={showSettings}
                onClose={handleCloseSettingsPanel}
                isMobile={isMobile}
            />}

            <RealTimeUpdatePanel
                show={showRealTimeUpdatesPanel}
                onClose={handleCloseRealTimePanel}
                isMobile={isMobile}
            />
        </GridContainerStyles>
    );
}

export default React.memo(Note);
