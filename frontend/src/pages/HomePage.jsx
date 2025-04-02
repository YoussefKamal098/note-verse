import React, {useEffect, useRef, useState} from "react";
import Loader from "../components/common/Loader";
import Pagination from "../components/common/Pagination";
import NotesCard from "../components/noteCards/NoteCards";
import Navbar from "../components/navbar/Navbar";
import NoNotes from "../components/common/NoNotes";
import usePaginatedNotes from "../hooks/usePaginatedNotes";
import AppConfig from "../config/config";
import {useAuth} from "../contexts/AuthContext";

const HOME_SEARCH_TEXT_STORED_KEY = "homeSearchText";
const HOME_CURRENT_PAGE_STORED_KEY = "homeCurrentPage";

const HomePage = () => {
    const notesPerPage = AppConfig.NOTES_PER_PAGE;
    const {user} = useAuth();
    const [searchText, setSearchText] = useState(localStorage.getItem(HOME_SEARCH_TEXT_STORED_KEY) || "");
    const replacedNoteIndexFromAdjacentPage = useRef(0);
    const pageSectionRef = useRef(null);

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
    } = usePaginatedNotes(user?.id, Number(localStorage.getItem(HOME_CURRENT_PAGE_STORED_KEY)) || 0, searchText, notesPerPage);

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
            throw new Error(`Error fetch replaced note:  ${error.message}`);
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

    useEffect(() => {
        localStorage.setItem(HOME_SEARCH_TEXT_STORED_KEY, searchText);
        localStorage.setItem(HOME_CURRENT_PAGE_STORED_KEY, currentPage.toString());
    }, [searchText, currentPage]);

    useEffect(() => {
        if (!loading && pageSectionRef.current) {
            pageSectionRef.current.scrollIntoView({behavior: "smooth", block: "start"});
        }
    }, [loading]);

    return (
        <div className="page" ref={pageSectionRef}>
            <Navbar
                showSearch={true}
                onSearch={handleSearch}
            />

            <div className="container">
                {loading ? <Loader/> : <></>}

                {notes.length === 0 && !loading ? (<NoNotes>No notes available!</NoNotes>) : (
                    <NotesCard
                        loading={loading}
                        notes={notes}
                        onDelete={deleteNote}
                        fetchReplacedNote={fetchReplacedNote}/>
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
