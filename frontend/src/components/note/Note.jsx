import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from "react-router-dom";
import styled from 'styled-components';
import {POPUP_TYPE} from '../confirmationPopup/ConfirmationPopup';
import {useConfirmation} from "@/contexts/ConfirmationContext";
import {useNoteContext, useNoteSelector} from "./hooks/useNoteContext"
import EditableTags from "../tags/EditableTags";
import EditableTitle from "../title/EditableTitle";
import NoteHeader from "./NoteHeader"
import NoteMarkdownTabs from "../noteMarkdownTabs/NoteMarkdownTabs";
import SharePopUp from '../noteSharePopUp';
import ContributorsList from "@/components/contributorsList";
import RightSettingsPanel from './RightSettingsPanel';
import CommitHistory from "@/components/infiniteScrollListsPopUp/CommitHistory";
import Contributor from "@/components/infiniteScrollListsPopUp/Contributor";
import UserContributionHistory from "@/components/infiniteScrollListsPopUp/UserContributionHistory";
import useCopyLink from "../../hooks/useCopyLink";
import {ContainerStyles} from "./styles";
import useMediaSize from "@/hooks/useMediaSize";
import {DEVICE_SIZES} from "@/constants/breakpoints";
import routesPaths from "@/constants/routesPaths";
import CommitMessagePopup from "@/components/commitMessagePopup";
import useNoteValidation from "@/hooks/useNoteValidation";

const GridContainerStyles = styled.div`
    display: grid;
    grid-template-areas: ${({$showTop}) => $showTop ?
            `"top right"
             "left right"` :
            `"left right"
             "left right"`
    };
    grid-template-columns: 1fr auto;
    grid-template-rows: auto 1fr;
    gap: 10px;
    width: 100%;
    max-width: ${({$showRightPanel}) => !$showRightPanel ? "775px" : "900px"};
    align-items: start;
`;

const TopContainerStyles = styled(ContainerStyles)`
    grid-area: top;
    padding-bottom: 1.5em;
`;

const LeftContainerStyles = styled(ContainerStyles)`
    grid-area: left;
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
    const [userContributionHistoryOpen, setUserContributionHistoryOpen] = useState(false);
    const [currentUserContributionHistoryId, setCurrentUserContributionHistoryId] = useState(null);
    const [commitMessageOpen, setCommitMessageOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(!isMobile);
    const {editMode, isNew} = useNoteSelector(selectors.getStatus);
    const {id, isPublic} = useNoteSelector(selectors.getMeta);
    const {current, original} = useNoteSelector(selectors.getContent);
    const owner = useNoteSelector(selectors.getOwner);
    const isOwner = useNoteSelector(selectors.isOwner);
    const canEdit = useNoteSelector(selectors.canEdit);
    const isContentChange = useNoteSelector(selectors.isContentChange);
    const markdownTabsRef = useRef(null);

    useEffect(() => {
        if (!isMobile) setShowSettings(true);
        else setShowSettings(false);
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
        setShowSettings(prev => !prev);
    }, []);

    const handleShowCommitHistory = useCallback(() => {
        setCommitHistoryOpen(prev => !prev);
    }, []);

    const handleShowContributors = useCallback(() => {
        setContributorsOpen(prev => !prev);
    }, []);

    const headerActions = useMemo(() => ({
        onSave: handleOnSave,
        onDelete: handleDelete,
        onDiscard: handleDiscard,
        onEdit: handleEdit,
        onCopyLink: handleCopyLink,
        onShowShare: handleShowShare,
        onSettingsIconClick: handleSettingsIconClick,
        onShowCommitHistory: handleShowCommitHistory
    }), [
        handleEdit,
        handleCopyLink,
        handleDelete,
        handleDiscard,
        handleShowShare,
        handleOnSave,
        handleShowCommitHistory,
        handleSettingsIconClick
    ]);

    const handleContributorClick = useCallback((userId) => {
        setContributorsOpen(false);
        setCurrentUserContributionHistoryId(userId);
        setUserContributionHistoryOpen(true);
    }, []);

    const handleCommitClick = useCallback((id) => navigate(routesPaths.NOTE_VERSION(id)), [])

    const handleClick = useCallback((userId) => {
        if (userId === 'overflow') {
            handleShowContributors();
        } else {
            setCurrentUserContributionHistoryId(userId);
            setUserContributionHistoryOpen(true);
        }
    }, []);

    return (
        <GridContainerStyles $showTop={!isNew && !editMode} $showRightPanel={showSettings}>
            {!isNew && !editMode && <TopContainerStyles>
                <ContributorsList
                    noteId={id}
                    noteOwnerId={owner.id}
                    maxVisible={2}
                    onAvatarClick={handleClick}
                />
            </TopContainerStyles>}

            <LeftContainerStyles>
                <NoteHeader actions={headerActions}/>

                <EditableTitle
                    title={current.title}
                    onSave={useCallback((title) => actions.updateContent({title}), [actions.updateContent])}
                    canEdit={editMode && canEdit}
                />

                <EditableTags
                    tags={current.tags}
                    onSave={useCallback((tags) => actions.updateContent({tags}), [actions.updateContent])}
                    canEdit={editMode && isOwner}
                />

                <NoteMarkdownTabs
                    ref={markdownTabsRef}
                    content={current.content}
                    onContentChange={useCallback((content) => actions.updateContent({content}), [actions.updateContent])}
                    canEdit={editMode && isOwner}
                />
            </LeftContainerStyles>

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
                onClose={() => setUserContributionHistoryOpen(false)}
            />
            <CommitMessagePopup
                isOpen={commitMessageOpen}
                onClose={() => setCommitMessageOpen(false)}
                onSave={handleOnCommitSave}
            />

            {isOwner && <RightSettingsPanel
                show={showSettings}
                onClose={() => setShowSettings(false)}
            />}
        </GridContainerStyles>
    );
}

export default React.memo(Note);
