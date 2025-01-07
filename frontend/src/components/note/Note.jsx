import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import styled from 'styled-components';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {MdDeleteForever, MdSave} from "react-icons/md";
import {IoMdArrowRoundBack} from "react-icons/io";
import NoteMarkdownTabs from "./NoteMarkdownTabs";
import PinButton from "../buttons/PinButton";
import EditableTags from "../tags/EditableTags";
import NoteTitleInputField from "./NoteTitleInputField";
import NoteDate from "./NoteDate";
import Button, {ButtonsContainerStyled} from "../buttons/Button";
import Loader from "../common/Loader";
import {useConfirmation} from "../../contexts/ConfirmationContext";
import {deepArrayEqual} from "../../utils";
import noteValidationSchema from "../../validations/noteValidtion";
import CacheService from "../../api/cacheService"

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

const BackHomeStyled = styled.div`
    font-size: 1.2em;
    color: var(--color-accent);
    transition: transform 0.3s, color 0.3s;
    cursor: pointer;

    &:hover {
        color: var(--color-accent);
        transform: scale(1.2);
    }

    &:active {
        transform: scale(0.9);
    }
`

const BackHome = () => {
    const navigate = useNavigate();

    return (
        <BackHomeStyled>
            <IoMdArrowRoundBack onClick={() => navigate('/home')}> </IoMdArrowRoundBack>
        </BackHomeStyled>
    )
}

const Note = React.memo(function Note({
                                          id = null,
                                          origCreateAt = null,
                                          origUpdatedAt = null,
                                          origTitle = 'Untitled',
                                          origContent = '# Untitled',
                                          origIsPinned = false,
                                          origTags = ["InspireYourself"],
                                          onSave = (noteData) => (noteData),
                                          onDelete = () => {
                                          }
                                      }) {
    const [content, setContent] = useState(origContent || '');
    const [tags, setTags] = useState(origTags || []);
    const [title, setTitle] = useState(origTitle || '');
    const [isPinned, setIsPinned] = useState(origIsPinned || false);
    const [hasChanges, setHasChanges] = useState(false);
    const [loading, setLoading] = useState(true);
    const {showConfirmation} = useConfirmation();

    useEffect(() => {
        if (id) loadUnSavedChanges();
    }, [id, origTitle, origContent, origTags, origIsPinned]);


    useEffect(() => {
        if (hasChanges && id) saveUnsavedChanges();
    }, [hasChanges, id, title, content, tags, isPinned]);

    const checkChanges = useCallback(() => {
        return origTitle !== title ||
            !deepArrayEqual(origTags, tags) ||
            origContent !== content ||
            isPinned !== origIsPinned;
    }, [title, content, tags, isPinned]);


    useEffect(() => {
        setHasChanges(checkChanges());
    }, [checkChanges]);

    useEffect(() => {
        setHasChanges(checkChanges());
    }, [title, content, tags, isPinned, checkChanges]);


    const loadUnSavedChanges = async () => {
        try {
            const cachedData = await CacheService.get(id);
            if (cachedData) {
                setTitle(cachedData.title !== undefined ? cachedData.title : title);
                setContent(cachedData.content !== undefined ? cachedData.content : content);
                setTags(cachedData.tags !== undefined ? cachedData.tags : tags);
                setIsPinned(cachedData.isPinned !== undefined ? cachedData.isPinned : isPinned);
            }
        } catch (error) {
            toast.error(`Failed to load unsaved changes: ${error.message}.`);
        } finally {
            setLoading(false);
        }
    };

    const saveUnsavedChanges = async () => {
        try {
            await CacheService.save(id, {title, content, tags, isPinned});
        } catch (error) {
            toast.error(`Failed to save unsaved changes: ${error.message}.`);
        }
    };

    const onNoteSave = useCallback(() => {
        try {
            noteValidationSchema.title.validateSync(title);
            noteValidationSchema.tags.validateSync(tags);
            noteValidationSchema.content.validateSync(content);
        } catch (error) {
            toast.error(error.message);
            return;
        }

        onSave({
            id,
            content: content,
            title,
            isPinned,
            tags
        });
    }, [content, tags, title, isPinned]);

    const onNoteDelete = () => {
        showConfirmation({
            type: "danger",
            confirmationMessage: "Are you sure you want to delete this note?",
            onConfirm: () => onDelete(),
        });
    }

    return (<>
            {loading ? (
                <Loader/>
            ) : (
                <NoteContainerStyled>
                    <HeaderContainerStyled>
                        <BackHome/>
                        <PinButton isPinned={isPinned} togglePin={() => setIsPinned(!isPinned)}/>
                    </HeaderContainerStyled>
                    <NoteTitleInputField title={title} setTitle={setTitle}/>
                    {origCreateAt && <NoteDate createdAt={origCreateAt} updatedAt={origUpdatedAt}/>}
                    <EditableTags tags={tags} setTags={setTags}/>
                    <ButtonsContainerStyled>
                        <Button type="danger" disabled={(id === null || id === "new")} icon={MdDeleteForever}
                                onClick={onNoteDelete}> Delete </Button>
                        <Button type="primary" disabled={!hasChanges} icon={MdSave} onClick={onNoteSave}> Save </Button>
                    </ButtonsContainerStyled>
                    <NoteMarkdownTabs content={content} onContentChange={setContent}/>
                </NoteContainerStyled>)}
        </>
    );
});

export default Note;
