import React from "react";
import {AnimatedListTranslateChildrenFade} from "../animations/ContainerAnimation";
import {NotesListContainerStyled} from "./NotesListStyles";
import EmptyList from "./EmptyNotesList";
import NoteCard from "./NoteCard";

const NotesList = React.memo(({notes, onDelete, onTogglePin, fetchReplacedNote, loading = false}) => {
    if (notes.length === 0 && !loading) {
        return <EmptyList/>
    }

    return (
        <NotesListContainerStyled loading={loading ? "true" : undefined}>
            <AnimatedListTranslateChildrenFade>
                {notes.map((note, index) => (
                    <NoteCard
                        key={note.id}
                        index={index}
                        note={note}
                        onTogglePin={onTogglePin}
                        onDelete={onDelete}
                        fetchReplacedNote={fetchReplacedNote}
                    />
                ))}
            </AnimatedListTranslateChildrenFade>
        </NotesListContainerStyled>
    );
});

export default NotesList;
