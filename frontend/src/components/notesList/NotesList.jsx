import React from "react";
import {AnimatedListTranslateChildrenFade} from "../animations/ContainerAnimation";
import {NotesListContainerStyled} from "./NotesListStyles";
import EmptyList from "./EmptyNotesList";
import NoteItem from "./NoteItem";

const NotesList = React.memo(({notes, onDelete, onTogglePin, fetchReplacedNote, loading = false}) => {
    if (notes.length === 0 && !loading) {
        return <EmptyList/>
    }

    return (
        <NotesListContainerStyled loading={loading ? "true" : undefined}>
            <AnimatedListTranslateChildrenFade>
                {notes.map((note, index) => (
                    <NoteItem
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
