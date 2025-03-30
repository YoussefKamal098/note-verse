import React, {Suspense, useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import 'react-toastify/dist/ReactToastify.css';
import NoteMarkdownTabs from "./NoteMarkdownTabs";
import EditableTags from "../tags/EditableTags";
import NoteTitleInputField from "./NoteTitleInputField";
import NoteDate from "./NoteDate";
import BackHomeButton from "../buttons/BackHomeButton";
import {useToastNotification} from "../../contexts/ToastNotificationsContext";
import {useConfirmation} from "../../contexts/ConfirmationContext";
import {POPUP_TYPE} from "../confirmationPopup/ConfirmationPopup";
import noteValidationSchema from "../../validations/noteValidtion";
import cacheService from "../../services/cacheService"
import {deepEqual} from "shared-utils/obj.utils";
import Loader from "../common/Loader";

const NoteMenu = React.lazy(() => import("../menus/noteMenu/NoteMenu"));

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
                  origUpdatedAt = null,
                  origTitle = '',
                  origContent = '# Content',
                  origIsPinned = false,
                  origTags = ["Tag"],
                  onSave = (noteData) => (noteData),
                  onDelete = () => ({}),
                  unSavedChanges = {}
              } = {}) => {
    const {notify} = useToastNotification();
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
            await cacheService.save(id, {title, content, tags, isPinned});
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

        if (Object.keys(changes).length > 0) {
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

    const onNoteUnSave = async () => {
        setTitle(origTitle);
        setContent(origContent);
        setTags(origTags);
        setIsPinned(origIsPinned);

        await cacheService.delete(id);
    }

    return (
        <NoteContainerStyled>
            <HeaderContainerStyled>
                <BackHomeButton/>

                <Suspense fallback={<Loader/>}>
                    <NoteMenu
                        onNoteDelete={onNoteDelete}
                        onNoteSave={onNoteSave}
                        onNoteUnSave={onNoteUnSave}
                        onNotePin={onNotePin}
                        isPinned={isPinned}
                        disableSave={!hasChanges}
                        disableUnSave={!hasChanges}
                        disableDelete={(!id || id === "new")}
                    />
                </Suspense>
            </HeaderContainerStyled>

            <NoteTitleInputField title={title} setTitle={setTitle}/>

            {id && id !== "new" && <NoteDate createdAt={origCreateAt} updatedAt={origUpdatedAt}/>}

            <EditableTags tags={tags} setTags={setTags}/>

            <NoteMarkdownTabs content={content} onContentChange={setContent}/>
        </NoteContainerStyled>
    );
}

export default React.memo(Note);
