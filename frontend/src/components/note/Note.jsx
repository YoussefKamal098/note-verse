import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from "react-router-dom";
import styled from 'styled-components';
import {POPUP_TYPE} from '@/components/confirmationPopup/confirmationMessagePopup';
import {BUTTON_TYPE} from "@/components/buttons/Button";
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
import RealTimeUpdatePanel from './realTimeUpdatePanel';
import {DEVICE_SIZES} from "@/constants/breakpoints";
import routesPaths from "@/constants/routesPaths";

const GridContainerStyles = styled.div`
    display: grid;
    grid-template-areas: ${({$showContributors}) => $showContributors ? `
        "realtime_updates_panel contributors settings_panel"
        "realtime_updates_panel main_content settings_panel"
        "realtime_updates_panel main_content settings_panel"` : `
        "realtime_updates_panel main_content settings_panel"
        `
    };

    grid-template-columns: auto 1fr auto;
    grid-template-rows: ${({$showContributors}) => $showContributors ? "auto auto 1fr" : "auto 1fr"};

    gap: 10px;
    width: 100%;

    ${({$isMobile}) => $isMobile && "max-width: 775px"};

    ${({$isMobile, $showSettingsPanel, $showRealTimeUpdatesPanel}) =>
            (!$showSettingsPanel || !$showRealTimeUpdatesPanel) && !$isMobile && "max-width: 900px"};

    align-items: start;
`;

const Note = () => {
    const navigate = useNavigate();
    const copyLink = useCopyLink();
    const {showConfirmation, showTextConfirmation} = useConfirmation();
    const {validateNote} = useNoteValidation();
    const isMobile = useMediaSize(DEVICE_SIZES.laptop);
    const {actions, selectors} = useNoteContext();
    const [showShare, setShowShare] = useState(false);
    const [commitHistoryOpen, setCommitHistoryOpen] = useState(false);
    const [contributorsOpen, setContributorsOpen] = useState(false);
    const [showSettingsPanel, setShowSettingsPanel] = useState(true);
    const [userContributionHistoryOpen, setUserContributionHistoryOpen] = useState(false);
    const [currentUserContributionHistoryId, setCurrentUserContributionHistoryId] = useState(null);
    const [commitMessageOpen, setCommitMessageOpen] = useState(false);
    const [showRealTimeUpdatesPanel, setShowRealTimeUpdatesPanel] = useState(!isMobile);
    const {editMode, isNew} = useNoteSelector(selectors.getStatus);
    const {id, isPublic} = useNoteSelector(selectors.getMeta);
    const {current, original} = useNoteSelector(selectors.getContent);
    const owner = useNoteSelector(selectors.getOwner);
    const isOwner = useNoteSelector(selectors.isOwner);
    const hasChanges = useNoteSelector(selectors.hasChanges);
    const isContentChange = useNoteSelector(selectors.isContentChange);
    const markdownTabsRef = useRef(null);

    useEffect(() => {
        if (!isMobile) {
            setShowSettingsPanel(isOwner);
            setShowRealTimeUpdatesPanel(!isNew);
        } else {
            setShowSettingsPanel(false);
            setShowRealTimeUpdatesPanel(false);
        }
    }, [isMobile, isNew, isOwner]);

    const handleDelete = useCallback(() => {
        showTextConfirmation({
            title: "Delete Note",
            description: "Are you sure you want to permanently delete this note? This action cannot be undone.",
            confirmText: original.title,
            confirmButtonText: "Delete",
            confirmButtonType: BUTTON_TYPE.DANGER,
            onConfirm: actions.deleteNote,
        });
    }, [actions.deleteNote, showTextConfirmation, original.title]);

    const handleDiscard = useCallback(async () => {
        if (hasChanges) {
            showConfirmation({
                type: POPUP_TYPE.WARNING,
                confirmationMessage: "Are you sure you want to discard all unsaved changes? Your modifications will be lost permanently.",
                onConfirm: async () => {
                    original.content !== current.content && markdownTabsRef.current.resetContent(original.content);
                    await actions.discardChanges();
                },
            });
        } else {
            await actions.toggleEditMode();
        }
    }, [actions.discardChanges, showConfirmation, original.content, current.content, hasChanges]);

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

    const handleOnPull = useCallback((pulledContent) => {
        actions.resetContent(pulledContent);
        markdownTabsRef.current?.resetContent?.(pulledContent);
    }, [actions.resetContent]);

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
            $showSettingsPanel={showSettingsPanel}
            $showRealTimeUpdatesPanel={showRealTimeUpdatesPanel}
            $isMobile={isMobile}
        >
            <Contributors onContributorClick={handleOnContributorClick}/>
            <MainContent headerActions={headerActions} isMobile={isMobile} markdownTabsRef={markdownTabsRef}/>

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
                show={showSettingsPanel}
                onClose={handleCloseSettingsPanel}
                isMobile={isMobile}
            />}

            {!isNew && <RealTimeUpdatePanel
                show={showRealTimeUpdatesPanel}
                onPull={handleOnPull}
                onClose={handleCloseRealTimePanel}
                isMobile={isMobile}
            />}
        </GridContainerStyles>
    );
}

export default React.memo(Note);
