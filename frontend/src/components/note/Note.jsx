import React, {useCallback, useMemo, useState} from 'react';
import styled from 'styled-components';
import {POPUP_TYPE} from '../confirmationPopup/ConfirmationPopup';
import {useConfirmation} from "../../contexts/ConfirmationContext";
import {useNoteContext, useNoteSelector} from "./hooks/useNoteContext"
import EditableTags from "../tags/EditableTags";
import EditableTitle from "../title/EditableTitle";
import NoteHeader from "./NoteHeader"
import NoteMarkdownTabs from "../noteMarkdownTabs/NoteMarkdownTabs";
import SharePopUp from '../noteSharePopUp';
import useCopyLink from "../../hooks/useCopyLink";

const ContainerStyled = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1em;
    max-width: 55em;
    margin: 1em auto;
    padding: 1em 1.25em 2em;
    background-color: var(--color-background);
    border-radius: var(--border-radius);
    overflow: hidden;
`;

const Note = () => {
    const copyLink = useCopyLink();
    const {actions, selectors} = useNoteContext();
    const [showShare, setShowShare] = useState(false);
    const {editMode} = useNoteSelector(selectors.getStatus);
    const {id, isPublic} = useNoteSelector(selectors.getMeta);
    const {current} = useNoteSelector(selectors.getContent);
    const isOwner = useNoteSelector(selectors.isOwner);
    const canEdit = useNoteSelector(selectors.canEdit);

    const {showConfirmation} = useConfirmation();

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
            onConfirm: actions.discardChanges,
        });
    }, [actions.discardChanges, showConfirmation]);

    const onVisibilityChange = useCallback((visibility) => {
        actions.updatePublicState(visibility);
    }, [actions.updatePublicState])

    const handlePinToggle = useCallback(async () => {
        await actions.togglePin();
    }, [actions.togglePin]);

    const handleOnSave = useCallback(async () => {
        await actions.persistNote();
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

    const headerActions = useMemo(() => ({
        onSave: handleOnSave,
        onDelete: handleDelete,
        onDiscard: handleDiscard,
        onTogglePin: handlePinToggle,
        onEdit: handleEdit,
        onCopyLink: handleCopyLink,
        onShowShare: handleShowShare
    }), [actions, handleCopyLink, handleShowShare]);

    return (
        <ContainerStyled>
            <NoteHeader
                noteMeta={{isPublic}}
                actions={headerActions}
            />

            <EditableTitle
                title={current.title}
                onSave={useCallback((title) => actions.updateContent({title}), [actions.updateContent])}
                canEdit={editMode && canEdit}
            />

            <EditableTags
                tags={current.tags}
                onSave={useCallback((tags) => actions.updateContent({tags}), [actions.updateContent])}
                canEdit={editMode && canEdit}
            />

            <NoteMarkdownTabs
                content={current.content}
                onContentChange={useCallback((content) => actions.updateContent({content}), [actions.updateContent])}
                canEdit={editMode && canEdit}
            />

            {isOwner && <SharePopUp
                noteMeta={{id, isPublic}}
                onClose={handleShowShare}
                onVisibilityChange={onVisibilityChange}
                show={showShare}
            />}
        </ContainerStyled>
    );
}

export default React.memo(Note);
