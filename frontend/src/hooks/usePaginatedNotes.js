import {useCallback, useEffect, useRef, useState} from "react";
import {toast} from "react-toastify";
import noteService from "../api/noteService";

const usePaginatedNotes = (initPage, searchText, notesPerPage) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(initPage);
    const [totalPages, setTotalPages] = useState(0);
    const totalNotes = useRef(0);

    const fetchPageNotes = useCallback(async (page, search) => {
        try {
            const queryParams = {
                searchText: search,
                page,
                perPage: notesPerPage,
                sort: {isPinned: -1, updatedAt: -1, title: 1, createdAt: -1},
            };

            const result = await noteService.getAuthenticatedUserNotes(queryParams);

            return result.data;
        } catch (error) {
            throw new Error(error.message);
        }
    }, [notesPerPage]);

    const loadNotes = useCallback(async (page, search) => {
        try {
            setLoading(true);
            let result = await fetchPageNotes(page, search);
            if (result.data.length === 0 && result.totalPages > 0) {
                result = await fetchPageNotes(result.totalPages - 1, search);
                setCurrentPage(result.totalPages - 1);
            }

            const {data, totalPages: total, totalItems} = result;

            totalNotes.current = totalItems;
            setTotalPages(total);
            setNotes(data);
        } catch (error) {
            toast.error(`Error fetching page notes: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [fetchPageNotes]);

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
