import React, {useCallback, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {toast} from "react-toastify";
import {formatBytes, stringSizeInBytes} from "../utils";
import Navbar from "../components/navbar/Navbar";
import Note from "../components/note/Note";
import Loader from "../components/common/Loader";
import CacheService from "../api/cacheService"
import noteService from "../api/noteService";

const NotePage = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [note, setNote] = useState(null);
    const [unSavedChanges, setUnSavedChanges] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchNoteData = useCallback(async () => {
        if (id === "new") {
            return {
                id: "new",
                title: "",
                content: "# Untitled",
                isPinned: false,
                tags: ["Tag"],
                createdAt: null,
                updatedAt: null
            };
        }

        try {
            const result = await noteService.getAuthenticatedUserNoteById(id);
            return result.data;
        } catch (error) {
            throw new Error(`Failed to fetch note :${error.message}`);
        }
    }, [id]);

    useEffect(() => {
        (async () => {
            try {
                const note = await fetchNoteData();
                const unSavedChanges = await loadUnSavedChanges();
                setNote(note);
                setUnSavedChanges(unSavedChanges);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [fetchNoteData]);

    const createNote = async ({id, isPinned, tags, title, content}) => {
        if (!id) return;

        setLoading(true);
        let savedNote = {};

        try {
            const result = await noteService.create({isPinned, tags, title, content});
            savedNote = result.data;
            toast.success(`New note created with ID: ${savedNote.id}`);
            navigate(`/note/${savedNote.id}`, {replace: true});
        } catch (error) {
            throw new Error(`Failed to create note: ${error.message}`)
        } finally {
            setLoading(false);
        }

        setNote((preNote) => ({...preNote, ...savedNote}));
    }

    const saveNoteUpdates = async ({id, isPinned, tags, title, content}) => {
        if (!id) return;
        setLoading(true);
        let savedNote = {};

        try {
            const result = await noteService.updateAuthenticatedUserNoteById(id, {isPinned, tags, title, content});
            savedNote = result.data;
            toast.success(`Content saved! ${formatBytes(stringSizeInBytes(content))}.`);
        } catch (error) {
            throw new Error(`Failed to update note: ${error.message}`)
        } finally {
            setLoading(false);
        }

        setNote((preNote) => ({...preNote, ...savedNote}));
    }

    const loadUnSavedChanges = async () => {
        try {
            return await CacheService.get(id);
        } catch (error) {
            throw new Error(`Failed to load unsaved changes: ${error.message}.`);
        }
    };


    const deleteNoteSavedChangesFromCache = async (id) => {
        try {
            await CacheService.delete(id)
        } catch (error) {
            toast.error(`Failed to delete cached note. ${error.message}`);
        }
    }

    const handleSave = async ({id, isPinned, tags, title, content}) => {
        try {
            if (note.id === "new") {
                await createNote({id, isPinned, tags, title, content});
            } else {
                await saveNoteUpdates({id, isPinned, tags, title, content});
            }
            await deleteNoteSavedChangesFromCache(id);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDelete = async () => {
        if (!note.id) return;

        try {
            setLoading(true);
            await noteService.deleteAuthenticatedUserNoteById(id);
            toast.success("Note deleted successfully!");
            navigate("/home");
        } catch (error) {
            toast.error(`Failed to delete note :${error.message}`);
            return;
        } finally {
            setLoading(false);
        }

        await deleteNoteSavedChangesFromCache(id);
    };

    return (
        <div className="page">
            <Navbar showSearch={false}/>
            <div className="wrapper">
                {loading ? (
                    <Loader/>
                ) : (
                    note && (
                        <Note
                            id={note.id}
                            origCreateAt={note.createdAt}
                            origUpdatedAt={note.updatedAt}
                            origTitle={note.title}
                            origContent={note.content}
                            origIsPinned={note.isPinned}
                            origTags={note.tags}
                            unSavedChanges={unSavedChanges}
                            onSave={handleSave}
                            onDelete={handleDelete}
                        />
                    )
                )}
            </div>
        </div>
    );
};

export default NotePage;
