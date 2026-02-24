import React from 'react';
import {AnimatePresence} from 'framer-motion';
import {NoteCardsContainerStyles} from './Styles';
import NoteCard from './Card';
import {AnimatedCardsTranslateChildrenFade} from '../animations/ContainerAnimation';

const NotesGrid = React.memo(({notes}) => {
    return (
        <NoteCardsContainerStyles>
            <AnimatePresence>
                <AnimatedCardsTranslateChildrenFade>
                    {notes.map((note) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                        />
                    ))}
                </AnimatedCardsTranslateChildrenFade>
            </AnimatePresence>
        </NoteCardsContainerStyles>
    );
});

export default NotesGrid;
