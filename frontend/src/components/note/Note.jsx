import React, {Suspense, useCallback, useEffect} from 'react';
import styled from 'styled-components';
import {deepEqual} from "shared-utils/obj.utils";
import useNoteState from '../../hooks/useNoteState';
import useNoteStateCache from '../../hooks/useNoteStateCache';
import useNoteValidation from '../../hooks/useNoteValidation';
import {useConfirmation} from "../../contexts/ConfirmationContext";
import {useAuth} from "../../contexts/AuthContext";
import {POPUP_TYPE} from '../confirmationPopup/ConfirmationPopup';
import Loader from "../common/Loader";
import EditableTags from "../tags/EditableTags";
import EditableTitle from "../title/EditableTitle";
import NoteHeader from "./NoteHeader"

const NoteMarkdownTabs = React.lazy(() => import("../noteMarkdownTabs/NoteMarkdownTabs"));

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

const getChanges = (original, current) => ({
    ...(original.title !== current.title && {title: current.title}),
    ...(original.content !== current.content && {content: current.content}),
    ...(!deepEqual(original.tags, current.tags) && {tags: current.tags}),
    ...(original.isPinned !== current.isPinned && {isPinned: current.isPinned}),
});

const Note = ({
                  origNote = {},
                  onSave = (id, updates) => ({id, ...updates}),
                  onDelete = () => ({}),
                  unsavedChanges = {}
              }) => {
    const {user} = useAuth();
    const {showConfirmation} = useConfirmation();

    // Note state management
    const {noteState, hasChanges, updateState} = useNoteState(origNote);
    useNoteStateCache(origNote, noteState, hasChanges, unsavedChanges, updateState);

    useEffect(() => {
        updateState(origNote);
    }, [origNote]);

    // Validation
    const {validateNote} = useNoteValidation();

    // Save handler
    const handleSave = useCallback(() => {
        if (!validateNote(noteState)) return;

        if (!origNote.id || origNote.id === "new") {
            onSave(origNote.id, noteState);
        } else {
            const changes = getChanges(origNote, noteState);
            if (Object.keys(changes).length > 0) onSave(origNote.id, {...changes});
        }
    }, [noteState, origNote, onSave]);

    // Delete confirmation
    const handleDelete = useCallback(() => {
        showConfirmation({
            type: POPUP_TYPE.DANGER,
            confirmationMessage: "Delete this note?",
            onConfirm: () => onDelete(),
        });
    }, [onDelete]);

    const onTogglePin = () => {
        updateState({isPinned: !noteState.isPinned});
        if (origNote.id && origNote.id !== "new") onSave(origNote.id, {isPinned: !origNote.isPinned});
    }

    const onTagsUpdate = (tags) => {
        updateState({tags});
        if (origNote.id && origNote.id !== "new" && onSave) onSave(origNote.id, {tags});
    }

    const onTitleUpdate = (title) => {
        updateState({title});
        if (origNote.id && origNote.id !== "new" && onSave) onSave(origNote.id, {title});
    }

    // Discard changes
    const handleDiscard = useCallback(() => {
        showConfirmation({
            type: POPUP_TYPE.DANGER,
            confirmationMessage: "Discard changes?",
            onConfirm: () => updateState(origNote)
        });
    }, [origNote, updateState]);

    const headerActions = {
        onSave: handleSave,
        onDelete: handleDelete,
        onDiscard: handleDiscard,
        onTogglePin: onTogglePin
    };

    return (
        <ContainerStyled>
            <NoteHeader
                user={user}
                actions={headerActions}
                noteState={{
                    ...noteState,
                    hasChanges
                }}
            />

            <EditableTitle
                title={noteState.title}
                onSave={onTitleUpdate}
            />

            <EditableTags
                tags={noteState.tags}
                onSave={onTagsUpdate}
            />

            <Suspense fallback={<Loader/>}>
                <NoteMarkdownTabs
                    content={noteState.content}
                    onContentChange={content => updateState({content})}
                />
            </Suspense>
        </ContainerStyled>
    );
}

export default React.memo(Note);
