import {useCallback, useEffect, useState} from "react";
import noteService from "../api/noteService";
import CacheService from "../services/cacheService";
import {toast} from "react-toastify";

const useNoteData = (id = "", setLoading = (prev) => (!prev)) => {
    const [note, setNote] = useState(null);
    const [unSavedChanges, setUnSavedChanges] = useState(null);

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
            throw new Error(error.message);
        }
    }, [id]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const fetchedNote = await fetchNoteData();
                const unsavedChanges = await CacheService.get(id);
                setNote(fetchedNote);
                setUnSavedChanges(unsavedChanges);
            } catch (error) {
                toast.error(`Failed to fetch note: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [fetchNoteData, id, setLoading]);

    return {note, setNote, unSavedChanges};
};

export default useNoteData;