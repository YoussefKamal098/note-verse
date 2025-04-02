import {useNavigate} from "react-router-dom";
import RoutesPaths from "../constants/RoutesPaths";
import {useToastNotification} from "../contexts/ToastNotificationsContext";
import noteService from "../api/noteService";
import CacheService from "../services/cacheService";

const useNoteActions = (note = {}, setNote = (prev) => (prev), setLoading = (prev) => (!prev)) => {
    const {notify} = useToastNotification();
    const navigate = useNavigate();

    const createNote = async ({id, isPinned, tags, title, content}) => {
        if (!id) return;

        try {
            const {data: note} = await noteService.create(note.userId, {isPinned, tags, title, content});
            notify.success(`New note created successfully.`);
            navigate(RoutesPaths.NOTE(note.id), {replace: true});
            return note;
        } catch (error) {
            throw new Error(`Failed to create note: ${error.message}`);
        }
    };

    const saveNoteUpdates = async ({id, isPinned, tags, title, content}) => {
        if (!id) return;

        try {
            const {data: note} = await noteService.updateUserNoteById(note.userId, id, {
                isPinned,
                tags,
                title,
                content
            });
            notify.success(`Note updated successfully.`);
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

            // Attempt to delete the note from the cache.
            // If this fails, the error is silently caught and ignored.
            await CacheService.delete(note.id).catch(() => ({}));

            setNote(savedNote);
        } catch (error) {
            notify.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!note.id) return;
        setLoading(true);

        try {
            // Delete the note from the backend.
            await noteService.deleteUserNoteById(note.userId, note.id);

            // Attempt to delete the note from the cache.
            // If this fails, the error is silently caught and ignored.
            await CacheService.delete(note.id).catch(() => ({}));

            notify.success("Note deleted successfully!");
            navigate(RoutesPaths.HOME);
        } catch (error) {
            setLoading(false);
            notify.error(`Failed to delete note: ${error.message}`);
        }
    };

    return {handleSave, handleDelete};
};

export default useNoteActions;
