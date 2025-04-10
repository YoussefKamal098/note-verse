import {useCallback, useEffect, useRef, useState} from "react";
import RoutesPaths from "../constants/RoutesPaths";
import usePersistedState from "./usePersistedState";
import useRequestManager from "./useRequestManager";
import {useNavigate} from "react-router-dom";
import noteService from "../api/noteService";
import {API_CLIENT_ERROR_CODES} from "../api/apiClient"

const usePaginatedNotes = (userId, searchText, notesPerPage,) => {
    const navigate = useNavigate();
    const {createAbortController} = useRequestManager();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = usePersistedState("notes_current_page", 0);
    const [totalPages, setTotalPages] = useState(0);
    const totalNotes = useRef(0);

    const fetchPageNotes = useCallback(async (page, search) => {
        const controller = createAbortController();

        try {
            const queryParams = {
                searchText: search,
                page,
                perPage: notesPerPage,
                sort: {isPinned: -1, updatedAt: -1, createdAt: -1},
            };

            const result = await noteService.getUserNotes(userId, queryParams, {
                signal: controller.signal
            });

            return result.data;
        } catch (error) {
            if (error.code !== API_CLIENT_ERROR_CODES.ERR_CANCELED) {
                throw new Error(error.message);
            }
        }
    }, [notesPerPage]);

    const loadNotes = useCallback(async (page, search) => {
        try {
            setLoading(true);
            let result = await fetchPageNotes(page, search);

            if (!result) return; // Aborted request

            if (result.data.length === 0 && result.totalPages > 0) {
                result = await fetchPageNotes(result.totalPages - 1, search);
                if (!result) return; // Aborted request
                setCurrentPage(result.totalPages - 1);
            }

            const {data, totalPages: total, totalItems} = result;
            totalNotes.current = totalItems;
            setTotalPages(total);
            setNotes(data);
            setLoading(false);
        } catch (error) {
            navigate(RoutesPaths.ERROR, {
                state: {
                    message: "An error occurred while retrieving your notes. " +
                        "Please try again later."
                }
            });
        }
    }, [fetchPageNotes, navigate]);

    useEffect(() => {
        loadNotes(currentPage, searchText);
    }, [loadNotes, currentPage, searchText]);

    return {
        notes,
        loading,
        totalPages,
        loadNotes,
        fetchPageNotes,
        totalNotes,
        setNotes,
        setTotalPages,
        currentPage,
        setCurrentPage
    };
};

export default usePaginatedNotes;
