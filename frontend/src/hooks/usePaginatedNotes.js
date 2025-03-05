import {useCallback, useEffect, useRef, useState} from "react";
import RoutesPaths from "../constants/RoutesPaths";
import {useNavigate} from "react-router-dom";
import noteService from "../api/noteService";


const ERROR_FETCH_PAGE_NOTES = "An error occurred while retrieving your page notes. " +
    "there was an issue processing your request. " +
    "Please try again later.";

const usePaginatedNotes = (initPage, searchText, notesPerPage) => {
    const navigate = useNavigate();
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

            const result = await noteService.getUserNotes("me", queryParams);

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
            navigate(RoutesPaths.ERROR, {state: {message: ERROR_FETCH_PAGE_NOTES}});
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
