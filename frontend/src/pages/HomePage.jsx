import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../components/common/Loader";
import Pagination from "../components/common/Pagination";
import NotesCard from "../components/notes/NoteCards";
import Navbar from "../components/navbar/Navbar";
import NoNotes from "../components/common/NoNotes";
import { AppConfig } from "../config";
import noteService from "../api/noteService";

const HomePage = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(Number(localStorage.getItem("homeCurrentPage")) ||0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [searchText, setSearchText] = useState(localStorage.getItem("homeSearchText") || "");
    const navigate = useNavigate();
    const notesPerPage = AppConfig.NOTES_PER_PAGE;

    useEffect(() => {
        (async ()=> {
            await loadNotes(currentPage, searchText);
            localStorage.setItem("homeSearchText", searchText);
            localStorage.setItem("homeCurrentPage", currentPage.toString());
        })();
    }, [currentPage, searchText]);

    const fetchNotes = useCallback(async (page = 0, searchText = "") => {
        try {
            const queryParams = {
                searchText,
                page,
                perPage: notesPerPage,
                sort: { isPinned: -1, updatedAt: -1, title: 1, createdAt: -1 },
            };

            const result = searchText
                ? await noteService.textSearch(searchText, queryParams)
                : await noteService.getAll(queryParams);

            if (result.statusCode !== 200) {
                throw new Error(result.message);
            }

            return result.data;
        } catch (error) {
            throw new Error(error.message || "An error occurred. Please try again.");
        }
    }, []);

    const loadNotes = async (page = 0, searchText = "") => {
        try {
            setLoading(true);
            const result = await fetchNotes(currentPage, searchText);
            const { data, totalPages, totalItems } = result;

            setTotalPages(totalPages);
            setTotalItems(totalItems);
            setNotes(data);
        } catch (error) {
            toast.error(`Error fetching notes:  ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    const handleSearch =  async (searchText) => {
        setCurrentPage(0);
        setSearchText(searchText);
    };

    const togglePin = async (noteId) => {
        const noteToUpdate = notes.find(note => note.id === noteId);
        const updatedNote = { ...noteToUpdate, isPinned: !noteToUpdate.isPinned };

        try {
            await noteService.update(noteId, { isPinned: updatedNote.isPinned });
            setNotes(prevNotes => prevNotes.map(note => note.id === noteId ? updatedNote : note));
        } catch (error) {
            toast.error(`Error toggling pin:  ${error.message}`);
        }
    };

    const deleteNote = async (noteId) => {
        try {
            if (totalPages > 1 && currentPage !== totalPages - 1) {
                const result = await fetchNotes(currentPage + 1, searchText);
                const nextPageData = result.data;
                setNotes(prevNotes => [...prevNotes.filter(note => note.id !== noteId), nextPageData[0]]);
            } else {
                setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
            }

            setTotalPages(Math.ceil((totalItems - 1) / notesPerPage));
            setTotalItems(totalItems - 1);
            await noteService.delete(noteId);
        } catch (error) {
            toast.error(`Error deleting note:  ${error.message}`);
        }
    };

    const handlePageClick = (data) => {
        if (loading) return;
        setCurrentPage(data.selected);
    };

    const handleAddNoteButtonClick = () => { navigate('/note/new') };

    return (
        <div className="page">
            <Navbar
                showSearch={true}
                showAddNoteButton={true}
                disableAddNoteButton={loading}
                onAddNoteButtonClick={handleAddNoteButtonClick}
                onSearch={handleSearch} />

            <div className="container">
                {loading ? (
                    <Loader />
                ) : notes.length <= 0 ? (
                    <NoNotes>📝 No notes available!</NoNotes>
                ) : (
                    <NotesCard notes={notes} onDelete={deleteNote} togglePin={togglePin} />
                )}
            </div>

            {totalPages > 0 && (
                <Pagination
                    totalPages={totalPages}
                    onPageChange={handlePageClick}
                    isDisabled={loading}
                    currentPage={currentPage}
                />)}
        </div>
    );
};

export default HomePage;
