import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { formatBytes, stringSizeInBytes } from "../utils";
import Navbar from "../components/navbar/Navbar";
import Note from "../components/notes/Note";
import Loader from "../components/common/Loader";
import noteService from "../api/noteService";

const NotePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchNoteData = useCallback(async () => {
        setLoading(true);

        if (id === "new") {
            setNote({
                id: null,
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
            toast.error(`"Failed to fetch note :${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        (async () => { await fetchNoteData() })();
    }, [fetchNoteData]);

    const handleSave = async ({id, isPinned, tags, title, content }) => {
        setLoading(true);
        let savedNote;

        if (!note.id) {
            try {
                const result = await noteService.create({ isPinned, tags, title, content });
                savedNote = result.data;
                toast.success(`New note created with ID: ${savedNote.id}`);
                navigate(`/note/${savedNote.id}`, { replace: true });
            } catch (error){
                toast.error(`Failed to create note: ${error.message}`);
            }
        } else {
            try {
                const result = await noteService.update(id, { isPinned, tags, title, content });
                savedNote = result.data;
                toast.success(`Content saved! ${formatBytes(stringSizeInBytes(content))}.`);
            } catch(error) {
                toast.error(`Failed to update note: ${error.message}`);
            }
        }

        setNote((preNote) => ({...preNote, ...savedNote}));
        setLoading(false);
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <Navbar showSearch={false} />
            <div className="wrapper">
                {loading ? (
                    <Loader />
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
