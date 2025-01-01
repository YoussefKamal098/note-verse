import React from "react";
import { AnimatedListTranslateChildrenFade } from "../animations/ContainerAnimation";
import { NoteCardsContainerStyled } from "../noteCard/NoteCardStyles";
import NoteCard from "../noteCard/NoteCard";

const NoteCards = React.memo(({ notes, onDelete, onTogglePin, fetchReplacedNote }) => {
    return (
        <NoteCardsContainerStyled>
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
