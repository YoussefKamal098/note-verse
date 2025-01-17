import {useNavigate} from "react-router-dom";
import noteService from "../api/noteService";
import {toast} from "react-toastify";
import CacheService from "../services/cacheService";
import {formatBytes, stringSizeInBytes} from "shared-utils/string.utils";

const useNoteActions = (note = {}, setNote = (prev) => (prev), setLoading = (prev) => (!prev)) => {
    const navigate = useNavigate();

    const createNote = async ({id, isPinned, tags, title, content}) => {
        if (!id) return;

        try {
            const {data: note} = await noteService.create({isPinned, tags, title, content});
            toast.success(`New note created with ID: ${note.id}`);
            navigate(`/note/${note.id}`, {replace: true});
            return note;
        } catch (error) {
            throw new Error(`Failed to create note: ${error.message}`);
        }
    };

    const saveNoteUpdates = async ({id, isPinned, tags, title, content}) => {
        if (!id) return;

        try {
            const {data: note} = await noteService.updateAuthenticatedUserNoteById(id, {
                isPinned,
                tags,
                title,
                content
            });
            toast.success(`Content saved! ${formatBytes(stringSizeInBytes(content))}.`);
            return note;
        } catch (error) {
            throw new Error(`Failed to update note: ${error.message}`);
        }
    };

    const handleSave = async ({id, isPinned, tags, title, content}) => {
        setLoading(true);
        let savedNote = null;

        try {
            savedNote = note.id === "new" ?
                savedNote = await createNote({id, isPinned, tags, title, content}) :
                savedNote = await saveNoteUpdates({id, isPinned, tags, title, content});

            await CacheService.delete(id);

            setNote(savedNote);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!note.id) return;
        setLoading(true);

        try {
            await noteService.deleteAuthenticatedUserNoteById(note.id);
            await CacheService.delete(note.id);
            toast.success("Note deleted successfully!");
            navigate("/home");
        } catch (error) {
            setLoading(false);
            toast.error(`Failed to delete note: ${error.message}`);
        }
    };

    return {handleSave, handleDelete};
};

export default useNoteActions;