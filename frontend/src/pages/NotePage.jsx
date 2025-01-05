import React, {useCallback, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {toast} from "react-toastify";
import {formatBytes, stringSizeInBytes} from "../utils";
import Navbar from "../components/navbar/Navbar";
import Note from "../components/notes/Note";
import Loader from "../components/common/Loader";
import CacheService from "../api/cacheService"
import noteService from "../api/noteService";

const NotePage = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchNoteData = useCallback(async () => {
        setLoading(true);

        if (id === "new") {
            setNote({
                id: "new",
                title: "",
                content: "# Untitled",
                isPinned: false,
                tags: ["Tag"],
                createdAt: null,
                updatedAt: null
            });

            setLoading(false);
            return;
        }

        try {
            const result = await noteService.getById(id);
            setNote(result.data);
        } catch (error) {
            toast.error(`Failed to fetch note :${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        (async () => {
            await fetchNoteData()
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
            const result = await noteService.update(id, {isPinned, tags, title, content});
            savedNote = result.data;
            toast.success(`Content saved! ${formatBytes(stringSizeInBytes(content))}.`);
        } catch (error) {
            throw new Error(`Failed to update note: ${error.message}`)
        } finally {
            setLoading(false);
        }

        setNote((preNote) => ({...preNote, ...savedNote}));
    }

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
            await noteService.delete(id);
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
