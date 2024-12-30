import React from "react";
import { AnimatedListTranslateChildrenFade } from "../animations/ContainerAnimation";
import { NoteCardsContainerStyled } from "../noteCard/NoteCardStyles";
import NoteCard from "../noteCard/NoteCard";

const NoteCards = React.memo(({ notes, onDelete, togglePin }) => {
    return (
        <NoteCardsContainerStyled>
            <AnimatedListTranslateChildrenFade>
                {notes.map((note, index) => (
                    <NoteCard
                        key={note.id}
                        index={index}
                        note={note}
                        togglePin={() => togglePin(note.id)}
                        onDelete={() => onDelete(note.id)}
                    />
                ))}
            </AnimatedListTranslateChildrenFade>
        </NoteCardsContainerStyled>
    );
});

export default NoteCards;
