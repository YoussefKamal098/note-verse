import {useNavigate} from "react-router-dom";
import routesPaths from "../constants/routesPaths";
import {useToastNotification} from "../contexts/ToastNotificationsContext";
import noteService from "../api/noteService";
import cacheService from "../services/cacheService";

const useNoteActions = (noteId, setLoading) => {
    const {notify} = useToastNotification();
    const navigate = useNavigate();

    const saveNoteUpdates = async ({isPinned, tags, title, content}) => {
        setLoading?.(true);

        try {
            await noteService.updateNoteById(noteId, {isPinned, tags, title, content});

            notify.success(`Note updated successfully.`);

            // Attempt to delete the note from the cache.
            // If this fails, the error is silently caught and ignored.
            await cacheService.delete(noteId).catch(() => ({}));
        } catch (error) {
            notify.error(error.message);
        } finally {
            setLoading?.(false);
        }
    };

    const deleteNote = async () => {
        setLoading?.(true);

        try {
            // Delete the note from the backend.
            await noteService.deleteNoteById(noteId);

            // Attempt to delete the note from the cache.
            // If this fails, the error is silently caught and ignored.
            await cacheService.delete(noteId).catch(() => ({}));

            notify.success("Note deleted successfully!");
            navigate(routesPaths.HOME);
        } catch (error) {
            setLoading?.(false);
            notify.error(`Failed to delete note: ${error.message}`);
        }
    };

    return {saveNoteUpdates, deleteNote};
};

export default useNoteActions;
