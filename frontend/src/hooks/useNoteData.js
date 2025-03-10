import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import RoutesPaths from "../constants/RoutesPaths";
import noteService from "../api/noteService";
import CacheService from "../services/cacheService";

const useNoteData = (id = "", setLoading = (prev) => (!prev)) => {
    const navigate = useNavigate();
    const [note, setNote] = useState(null);
    const [unSavedChanges, setUnSavedChanges] = useState(null);

    const fetchNoteData = useCallback(async () => {
        if (id === "new") {
            return {
                id: "new",
                title: "",
                content: "# Content",
                isPinned: false,
                tags: ["Tag"],
                createdAt: null,
                updatedAt: null
            };
        }

        try {
            const result = await noteService.getUserNoteById("me", id);
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
                navigate(RoutesPaths.ERROR, {
                    state: {
                        message: "An error occurred while retrieving your note. " +
                            "The note might not exist, may not be associated with your account, might not be public, " +
                            "or its visibility settings could have been changed by the owner. " +
                            "or there was an issue processing your request. Please try again later."
                    }
                });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [fetchNoteData, id, setLoading]);

    return {note, setNote, unSavedChanges};
};

export default useNoteData;
