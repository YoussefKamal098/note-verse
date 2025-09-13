import {useCallback} from 'react';
import {POPUP_TYPE} from '@/components/confirmationPopup/confirmationMessagePopup';
import {BUTTON_TYPE} from "@/components/buttons/Button";

/**
 * Custom hook that centralizes all note-related actions
 *
 * @param {Object} params
 * @param {Object} params.actions - Note context actions
 * @param {Function} params.showConfirmation - Function to show confirmation dialog
 * @param {Function} params.showTextConfirmation - Function to show text confirmation dialog
 * @param {Function} params.validateNote - Function to validate note content
 * @param {Function} params.copyLink - Function to copy note link
 * @param {Object} params.original - Original note content
 * @param {Object} params.current - Current note content
 * @param {boolean} params.isNew - Whether the note is new
 * @param {boolean} params.isContentChange - Whether content has changed
 * @param {boolean} params.hasChanges - Whether note has any changes
 * @param {Object} params.markdownTabsRef - Ref to markdown tabs component
 * @param {Function} params.togglePopup - Function to toggle popups
 * @param {Function} params.closePopup - Function to close popups
 * @returns {Object} Collection of note action handlers
 */
export const useNoteActions = ({
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
                               }) => {
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
    }, [actions, showConfirmation, original, current, hasChanges, markdownTabsRef]);

    const handleOnSave = useCallback(async () => {
        const isValid = validateNote(current);

        if (isContentChange && !isNew && isValid) {
            togglePopup('commitMessage');
            return;
        }

        if (!isValid) return;

        await actions.persistNote();
    }, [actions.persistNote, isContentChange, current, validateNote, isNew, togglePopup]);

    const handleOnCommitSave = useCallback(async (message) => {
        closePopup('commitMessage');
        await actions.persistNote({commitMessage: message});
    }, [actions.persistNote, closePopup]);

    const handleEdit = useCallback(() => {
        actions.toggleEditMode();
    }, [actions.toggleEditMode]);

    const handleCopyLink = useCallback(async () => {
        await copyLink();
    }, [copyLink]);

    const handleTogglePin = useCallback(() => {
        isNew ? actions.togglePinState() : actions.togglePin();
    }, [isNew, actions]);

    const handleToggleVisibility = useCallback(() => {
        isNew ? actions.toggleVisibilityState() : actions.toggleVisibility();
    }, [isNew, actions]);

    const handleOnPull = useCallback((pulledContent) => {
        actions.resetContent(pulledContent);
        markdownTabsRef.current?.resetContent?.(pulledContent);
    }, [actions.resetContent, markdownTabsRef]);

    return {
        handleDelete,
        handleDiscard,
        handleOnSave,
        handleOnCommitSave,
        handleEdit,
        handleCopyLink,
        handleTogglePin,
        handleToggleVisibility,
        handleOnPull
    };
};
