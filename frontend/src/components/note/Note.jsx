import React, {Suspense, useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import 'react-toastify/dist/ReactToastify.css';
import {deepEqual} from "shared-utils/obj.utils";
import {PuffLoader} from 'react-spinners';
import EditableTags from "../tags/EditableTags";
import EditableTitle from "../title/EditableTitle";
import BackHomeButton from "../buttons/BackHomeButton";
import {useToastNotification} from "../../contexts/ToastNotificationsContext";
import {useConfirmation} from "../../contexts/ConfirmationContext";
import {useAuth} from "../../contexts/AuthContext";
import {POPUP_TYPE} from "../confirmationPopup/ConfirmationPopup";
import noteValidationSchema from "../../validations/noteValidtion";
import cacheService from "../../services/cacheService"
import Loader from "../common/Loader";
import Tooltip from "../tooltip/Tooltip";
import NoteHeader from "./NoteHeader";

const NoteMenu = React.lazy(() => import("../menus/noteMenu/NoteMenu"));
const NoteMarkdownTabs = React.lazy(() => import("../NoteMarkdownTabs/NoteMarkdownTabs"));

const NoteContainerStyled = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1em;
    max-width: 55em;
    margin: 1em auto;
    background-color: var(--color-background);
    padding: 1em 1.25em 2em;
    border-radius: var(--border-radius);
    overflow: hidden;
`;

const HeaderContainerStyled = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1em;
    margin-bottom: 2em;
`

const Note = ({
                  id = "",
                  origCreateAt = null,
                  origTitle = '',
                  origContent = '# Content',
                  origIsPinned = false,
                  origTags = ["Tag"],
                  onSave = (noteData) => (noteData),
                  onDelete = () => ({}),
                  unSavedChanges = {}
              } = {}) => {
    const {notify} = useToastNotification();
    const {user} = useAuth();
    const [content, setContent] = useState(origContent || '');
    const [tags, setTags] = useState(origTags || []);
    const [title, setTitle] = useState(origTitle || '');
    const [isPinned, setIsPinned] = useState(origIsPinned || false);
    const [hasChanges, setHasChanges] = useState(false);
    const {showConfirmation} = useConfirmation();

    useEffect(() => {
        if (id) setUnSavedChanges();
    }, [id, origTitle, origContent, origTags, origIsPinned]);

    useEffect(() => {
        setTitle(origTitle);
    }, [origTitle]);

    useEffect(() => {
        setTags(origTags);
    }, [origTags]);

    useEffect(() => {
        setIsPinned(origIsPinned)
    }, [origIsPinned]);

    useEffect(() => {
        setContent(origContent);
    }, [origContent]);

    useEffect(() => {
        setUnSavedChanges();
    }, [unSavedChanges]);

    useEffect(() => {
        if (hasChanges && id) saveUnsavedChanges();
    }, [hasChanges, id, title, content, tags, isPinned]);

    const checkChanges = useCallback(() => {
        return origTitle !== title ||
            !deepEqual(origTags, tags) ||
            origContent !== content ||
            isPinned !== origIsPinned;
    }, [title, content, tags, isPinned]);

    useEffect(() => {
        setHasChanges(checkChanges());
    }, [checkChanges]);

    useEffect(() => {
        setHasChanges(checkChanges());
    }, [title, content, tags, isPinned, checkChanges]);

    const setUnSavedChanges = async () => {
        if (unSavedChanges) {
            setTitle(unSavedChanges.title !== undefined ? unSavedChanges.title : title);
            setContent(unSavedChanges.content !== undefined ? unSavedChanges.content : content);
            setTags(unSavedChanges.tags !== undefined ? unSavedChanges.tags : tags);
            setIsPinned(unSavedChanges.isPinned !== undefined ? unSavedChanges.isPinned : isPinned);
        }
    };

    const saveUnsavedChanges = async () => {
        try {
            const changes = {
                title: origTitle !== title ? title : undefined,
                content: origContent !== content ? content : undefined,
                isPinned: origIsPinned !== isPinned ? isPinned : undefined,
                tags: origTags !== tags ? tags : undefined,
            }

            if (Object.values(changes).filter((value) => value !== undefined).length > 0) {
                await cacheService.save(id, changes);
            } else {
                await cacheService.delete(id).catch(() => ({}));
            }
        } catch (error) {
            notify.error(`Failed to save unsaved changes: ${error.message}.`);
        }
    };

    const onNoteSave = useCallback(() => {
        try {
            noteValidationSchema.title.validateSync(title);
            noteValidationSchema.tags.validateSync(tags);
            noteValidationSchema.content.validateSync(content);
        } catch (error) {
            notify.warn(error.message);
            return;
        }

        if (!id || id === "new") {
            onSave({
                id,
                title,
                content,
                tags,
                isPinned
            });
            return;
        }

        const changes = {};
        if (title !== origTitle) changes.title = title;
        if (content !== origContent) changes.content = content;
        if (!deepEqual(origTags, tags)) changes.tags = tags;
        if (isPinned !== origIsPinned) changes.isPinned = isPinned;

        if (onSave && Object.keys(changes).length > 0) {
            onSave({id, ...changes});
        }
    }, [content, tags, title, isPinned]);

    const onNoteDelete = () => {
        showConfirmation({
            type: POPUP_TYPE.DANGER,
            confirmationMessage: "Are you sure you want to delete this note?",
            onConfirm: () => onDelete(),
        });
    }

    const onNotePin = () => {
        setIsPinned(!isPinned);
        if (id && id !== "new") onSave({id, isPinned: !isPinned});
    }

    const onNoteTags = (tags) => {
        setTags(tags);
        if (id && id !== "new" && onSave) onSave({id, tags});
    }

    const onNoteTitle = (title) => {
        setTitle(title);
        if (id && id !== "new" && onSave) onSave({id, title});
    }

    const onNoteUnSave = async () => {
        setTitle(origTitle);
        setContent(origContent);
        setTags(origTags);
        setIsPinned(origIsPinned);
    }

    const onNoteDiscardChanges = () => {
        showConfirmation({
            type: POPUP_TYPE.DANGER,
            confirmationMessage: "Are you sure you want to discard this changes?",
            onConfirm: () => onNoteUnSave(),
        });
    }

    return (
        <NoteContainerStyled>
            <HeaderContainerStyled>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25em"
                }}>
                    <BackHomeButton/>
                    <NoteHeader
                        fullName={`${user.firstname || ""} ${user.lastname || ""}`}
                        createdAt={origCreateAt}
                        avatarUrl={user.avatarUrl}
                    />
                    {hasChanges &&
                        <Tooltip title={"Save Your Changes – Click to finalize your commit!"}>
                            <div style={{cursor: "pointer"}} onClick={onNoteSave}>
                                <PuffLoader color={"var(--color-accent)"} size={25}/>
                            </div>
                        </Tooltip>
                    }
                </div>

                <Suspense fallback={<Loader/>}>
                    <NoteMenu
                        onNoteDelete={onNoteDelete}
                        onNoteSave={onNoteSave}
                        onNoteUnSave={onNoteDiscardChanges}
                        onNotePin={onNotePin}
                        isPinned={isPinned}
                        disableSave={!hasChanges}
                        disableUnSave={!hasChanges}
                        disableDelete={(!id || id === "new")}
                    />
                </Suspense>
            </HeaderContainerStyled>

            <EditableTitle title={title} onSave={onNoteTitle}/>
            <EditableTags tags={tags} onSave={onNoteTags}/>

            <Suspense fallback={<Loader/>}>
                <NoteMarkdownTabs content={content} onContentChange={setContent}/>
            </Suspense>
        </NoteContainerStyled>
    );
}

export default React.memo(Note);
