import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import useRequestManager from '../hooks/useRequestManager';
import RoutesPaths from "../constants/RoutesPaths";
import noteService from "../api/noteService";
import CacheService from "../services/cacheService";
import {API_CLIENT_ERROR_CODES} from "../api/apiClient";

const useNoteData = (userId, noteId, setLoading = (prev) => (!prev)) => {
    const navigate = useNavigate();
    const [note, setNote] = useState(null);
    const [unsavedChanges, setUnsavedChanges] = useState(null);
    const {createAbortController} = useRequestManager();

    const fetchNoteData = useCallback(async () => {
        if (noteId === "new") {
            return {
                id: "new",
                title: "",
                content: "",
                isPinned: false,
                tags: [],
                createdAt: null
            };
        }

        const controller = createAbortController();

        try {
            const result = await noteService.getUserNoteById(userId, noteId, {signal: controller.signal});
            return result.data;
        } catch (error) {
            if (error.code !== API_CLIENT_ERROR_CODES.ERR_CANCELED) {
                throw new Error(error.message);
            }
        }
    }, [noteId]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const fetchedNote = await fetchNoteData();
                if (!fetchedNote) return; // Aborted request

                const unsavedChanges = await CacheService.get(noteId);
                setNote(fetchedNote);
                setUnsavedChanges(unsavedChanges);
                setLoading(false);
            } catch (error) {
                navigate(RoutesPaths.ERROR, {
                    state: {
                        message: "An error occurred while retrieving your note. " +
                            "The note might not exist, may not be associated with your account, might not be public, " +
                            "or its visibility settings could have been changed by the owner. " +
                            "or there was an issue processing your request. Please try again later."
                    }
                });
            }
        };

        loadData();
    }, [fetchNoteData, userId, noteId, setLoading]);

    return {note, setNote, unsavedChanges};
};

export default useNoteData;
