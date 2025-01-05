import React from "react";
import {AnimatedListTranslateChildrenFade} from "../animations/ContainerAnimation";
import {NoteCardsContainerStyled} from "./NoteCardStyles";
import NoteCard from "./NoteCard";

const NoteCards = React.memo(({notes, onDelete, onTogglePin, fetchReplacedNote, loading = false}) => {
    return (
        <NoteCardsContainerStyled loading={loading ? "true" : undefined}>
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
        </NoteCardsContainerStyled>
    );
});

export default NoteCards;
