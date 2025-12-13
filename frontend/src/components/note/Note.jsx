import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {useNavigate} from "react-router-dom";
import {useConfirmation} from "@/contexts/ConfirmationContext";
import {useNoteContext, useNoteSelector} from "./hooks/useNoteContext";
import useNoteValidation from "@/hooks/useNoteValidation";
import useCopyLink from "@/hooks/useCopyLink";
import useMediaSize from "@/hooks/useMediaSize";
import {DEVICE_SIZES} from "@/constants/breakpoints";
import routesPaths from "@/constants/routesPaths";
import NoteView from './NoteView';
import {useNotePopupManager} from './hooks/useNotePopupManager';
import {useNoteActions} from './hooks/useNoteActions';
import NoteLayout from './NoteLayout';


/**
 * Main Note component that handles note viewing, editing, and management
 *
 * @component
 * @example
 * return <Note />
 *
 * @description
 * This component serves as the main container for note operations including:
 * - Displaying note content
 * - Handling edit mode
 * - Managing note actions (save, delete, share, etc.)
 * - Controlling various popups and modals
 * - Responsive layout management
 *
 * It utilizes several custom hooks for state management and separates concerns
 * through a well-structured component hierarchy.
 */
const Note = () => {
    const navigate = useNavigate();
    const copyLink = useCopyLink();
    const {showConfirmation, showTextConfirmation} = useConfirmation();
    const {validateNote} = useNoteValidation();
    const isMobile = useMediaSize(DEVICE_SIZES.laptop);
    const {actions, selectors} = useNoteContext();

    // Select various pieces of state from the note context
    const {editMode, isNew} = useNoteSelector(selectors.getStatus);
    const {id, isPublic} = useNoteSelector(selectors.getMeta);
    const {current, original} = useNoteSelector(selectors.getContent);
    const owner = useNoteSelector(selectors.getOwner);
    const isOwner = useNoteSelector(selectors.isOwner);
    const hasChanges = useNoteSelector(selectors.hasChanges);
    const isContentChange = useNoteSelector(selectors.isContentChange);

    const markdownTabsRef = useRef(null);

    // Manage all popup states with a custom hook
    const {
        popups,
        realTimeUpdatesPanel,
        togglePopup,
        closePopup,
        setCurrentUserContributionHistoryId
    } = useNotePopupManager(isMobile, isNew);

    // Centralize all note-related action
    const {
        handleDelete,
        handleDiscard,
        handleEdit,
        handleCopyLink,
        handleTogglePin,
        handleToggleVisibility,
        handleOnPull,
        handleOnSave,
        handleOnCommitSave
    } = useNoteActions({
        actions,
        showConfirmation,
        showTextConfirmation,
        validateNote,
        copyLink,
        original,
        current,
        isNew,
        isContentChange,
        hasChanges,
        markdownTabsRef,
        togglePopup,
        closePopup
    });

    // Control real-time updates panel visibility based on device and note status
    useEffect(() => {
        if (!isMobile) {
            realTimeUpdatesPanel.setShow(!isNew);
        } else {
            realTimeUpdatesPanel.setShow(false);
        }
    }, [isMobile, isNew, isOwner]);

    /**
     * Handle visibility change for the note
     * @param {boolean} visibility - New visibility state
     */
    const onVisibilityChange = useCallback((visibility) => {
        actions.updateVisibilityState(visibility);
    }, [actions.updateVisibilityState]);

    /**
     * Navigate to a specific note version
     * @param {string} id - Note version ID
     */
    const handleCommitClick = useCallback((id) => navigate(routesPaths.NOTE_VERSION(id)), [navigate]);

    // Memoize header actions to prevent unnecessary re-renders
    const headerActions = useMemo(() => ({
        onSave: handleOnSave,
        onDelete: handleDelete,
        onDiscard: handleDiscard,
        onEdit: handleEdit,
        onCopyLink: handleCopyLink,
        onShowShare: () => togglePopup('share'),
        onRealTimeUpdateIconClick: realTimeUpdatesPanel.toggle,
        onShowCommitHistory: () => togglePopup('commitHistory'),
        onTogglePin: handleTogglePin,
        onToggleVisibility: handleToggleVisibility,
        updateReaction: (reaction) => actions.updateReaction(reaction)
    }), [
        handleOnSave,
        handleDelete,
        handleDiscard,
        handleEdit,
        handleCopyLink,
        togglePopup,
        realTimeUpdatesPanel.toggle,
        handleTogglePin,
        handleToggleVisibility,
        actions.updateReaction
    ]);

    /**
     * Handle contributor click with special handling for overflow case
     * @param {string} userId - User ID or 'overflow' for overflow menu
     */
    const handleOnContributorClick = useCallback((userId) => {
        if (userId === 'overflow') {
            togglePopup('contributors');
        } else {
            setCurrentUserContributionHistoryId(userId);
            togglePopup('userContributionHistory');
        }
    }, [togglePopup, setCurrentUserContributionHistoryId]);

    /**
     * Handle contributor selection from contributors popup
     * @param {string} userId - Selected user ID
     */
    const handleContributorClick = useCallback((userId) => {
        closePopup('contributors');
        setCurrentUserContributionHistoryId(userId);
        togglePopup('userContributionHistory');
    }, [closePopup, togglePopup, setCurrentUserContributionHistoryId]);

    return (
        <NoteLayout
            showContributors={!isNew && !editMode}
            showRealTimeUpdatesPanel={realTimeUpdatesPanel.show}
            isMobile={isMobile}
        >
            <NoteView
                headerActions={headerActions}
                isMobile={isMobile}
                markdownTabsRef={markdownTabsRef}
                onContributorClick={handleOnContributorClick}
                popups={popups}
                realTimeUpdatesPanel={realTimeUpdatesPanel}
                noteData={{
                    id,
                    isPublic,
                    owner,
                    isOwner,
                    isNew
                }}
                handlers={{
                    onVisibilityChange,
                    handleCommitClick,
                    handleOnCommitSave,
                    handleOnPull,
                    closePopup,
                    togglePopup,
                    handleContributorClick
                }}
            />
        </NoteLayout>
    );
}

export default React.memo(Note);
