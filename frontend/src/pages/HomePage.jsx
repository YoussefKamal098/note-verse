import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/common/Loader";
import Pagination from "../components/common/Pagination";
import NotesCard from "../components/notes/NoteCards";
import Navbar from "../components/navbar/Navbar";
import NoNotes from "../components/common/NoNotes";
import { usePaginatedNotes } from "../hooks";
import { AppConfig } from "../config";

const HomePage = () => {
    const navigate = useNavigate();
    const notesPerPage = AppConfig.NOTES_PER_PAGE;
    const [searchText, setSearchText] = useState(localStorage.getItem("homeSearchText") || "");
    const replacedNoteIndexFromAdjacentPage = useRef(0);

    const {
        notes,
        loading,
        totalPages,
        setTotalPages,
        setNotes,
        currentPage,
        setCurrentPage,
        fetchPageNotes,
        totalNotes
    } = usePaginatedNotes(localStorage.getItem("homeCurrentPage") || 0, searchText, notesPerPage);

    const fetchReplacedNote = async () => {
        try {
            const notes = (totalPages > 1 && currentPage !== totalPages - 1)
                ? (await fetchPageNotes(currentPage + 1, searchText)).data
                : null;

            const note = notes && notes.length > replacedNoteIndexFromAdjacentPage.current
                ? notes[replacedNoteIndexFromAdjacentPage.current]
                : null;

            replacedNoteIndexFromAdjacentPage.current += 1;
            return note;
        } catch (error) {
            throw new Error (`Error fetch replaced note:  ${error.message}`);
        }
    };

    const deleteNote = async (noteId, replacedNote) => {
        setNotes((prevNotes) =>
            replacedNote
                ? [...prevNotes.filter((note) => note.id !== noteId), replacedNote]
                : prevNotes.filter((note) => note.id !== noteId)
        );

        totalNotes.current -= 1;
        const newTotalPages = Math.ceil(totalNotes.current / notesPerPage);
        setCurrentPage((prevPage) =>
            prevPage > 0 && prevPage === totalPages - 1 && totalPages > newTotalPages ? prevPage - 1 : prevPage
        );
        setTotalPages(newTotalPages);
        replacedNoteIndexFromAdjacentPage.current -= 1;
    };

    const handleSearch = (text) => {
        setCurrentPage(0);
        setSearchText(text);
    };

    const handlePageClick = (data) => {
        if (!loading) setCurrentPage(data.selected);
    };

    const handleAddNoteButtonClick = () => navigate("/note/new");

    useEffect(() => {
        localStorage.setItem("homeSearchText", searchText);
        localStorage.setItem("homeCurrentPage", currentPage.toString());
    }, [searchText, currentPage]);

    return (
        <div className="page">
            <Navbar
                showSearch
                showAddNoteButton
                disableAddNoteButton={loading}
                onAddNoteButtonClick={handleAddNoteButtonClick}
                onSearch={handleSearch}
            />

            <div className="container">
                {loading ? (
                    <Loader />
                ) : notes.length === 0 ? (
                    <NoNotes>📝 No notes available!</NoNotes>
                ) : (
                    <NotesCard
                        notes={notes}
                        onDelete={deleteNote}
                        fetchReplacedNote={fetchReplacedNote}
                    />
                )}
            </div>

            {totalPages > 0 && (
                <Pagination
                    totalPages={totalPages}
                    onPageChange={handlePageClick}
                    isDisabled={loading}
                    currentPage={currentPage}
                />
            )}
        </div>
    );
};

export default HomePage;
