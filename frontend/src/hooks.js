import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import noteService from "./api/noteService";

const useFormNavigation = (fieldRefs) => {
    const handleKeyDown = (event, isSubmitting) => {
        const index = fieldRefs.findIndex(ref => ref.current === document.activeElement);

        if (event.key === "ArrowDown" && index < fieldRefs.length - 1) {
            // Move focus to the next field
            fieldRefs[index + 1]?.current?.focus();
        } else if (event.key === "ArrowUp" && index > 0) {
            // Move focus to the previous field
            fieldRefs[index - 1]?.current?.focus();
        } else if (event.key === "Enter" && index < fieldRefs.length - 1) {
            // Prevent form submission and move to the next field
            event.preventDefault();
            fieldRefs[index + 1]?.current?.focus();
        } else if (event.key === "Enter" && index === fieldRefs.length - 1 && !isSubmitting) {
            // Prevent form submission and move to the next field
            event.preventDefault(); // Prevent default submit action
            event.target.closest('form').requestSubmit(); // Manually trigger form submission
        }
    };

    return { handleKeyDown };
};

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
                sort: { isPinned: -1, updatedAt: -1, title: 1, createdAt: -1 },
            };

            const result = search
                ? await noteService.textSearch(search, queryParams)
                : await noteService.getAll(queryParams);

            return result.data;
        } catch (error) {
            throw new Error (`Error fetching page notes:  ${error.message}`);
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

            const { data, totalPages: total, totalItems } = result;

            totalNotes.current = totalItems;
            setTotalPages(total);
            setNotes(data);
        } catch (error) {
            toast.error(`Error fetching notes: ${error.message}`);
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

export  { useFormNavigation,  usePaginatedNotes };
