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
        if (id === "new") {
            setNote({
                id: null,
                title: "",
                content: "# Untitled",
                isPinned: false,
                tags: [],
                createdAt: null,
                updatedAt: null
            });
            setLoading(false);
        } else {
            setLoading(true);
            const result = await noteService.getById(id);
            if (result.statusCode === 200) {
                setNote(result.data);
            } else {
                toast.error(result.message || "Failed to fetch note");
            }
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
            const result = await noteService.create({ isPinned, tags, title, content });
            if (result.statusCode === 201) {
                savedNote = result.data;
                toast.success(`New note created with ID: ${savedNote.id}`);
                navigate(`/note/${savedNote.id}`, { replace: true });
            } else {
                toast.error(result.message || "Failed to create note");
            }
        } else {
            const result = await noteService.update(id, { isPinned, tags, title, content });
            if (result.statusCode === 200) {
                savedNote = result.data;
                toast.success(`Content saved! ${formatBytes(stringSizeInBytes(content))}.`);
            } else {
                toast.error(result.message || "Failed to update note");
            }
        }

        setNote((preNote) => ({...preNote, ...savedNote}));
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!note.id) return;
        setLoading(true);

        try {
            const result = await noteService.delete(id);
            if (result.statusCode === 200) {
                toast.success("Note deleted successfully!");
                navigate("/home");
                return;
            } else {
                toast.error(result.message || "Failed to delete note");
            }
        } catch (error) {
            toast.error("Failed to delete note.");
        }

        setLoading(false);
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
