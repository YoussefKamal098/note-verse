import React from 'react';
import {AnimatePresence} from 'framer-motion';
import {NoteCardsContainerStyles} from './Styles';
import NoteCard from './Card';
import Empty from './Empty';
import {AnimatedCardsTranslateChildrenFade} from '../animations/ContainerAnimation';

const NotesGrid = React.memo(({notes, onDelete, onTogglePin, loading = false}) => {
    if (notes.length === 0 && !loading) return <Empty/>;

    return (
        <NoteCardsContainerStyles loading={loading ? "true" : undefined}>
            <AnimatePresence>
                <AnimatedCardsTranslateChildrenFade>
                    {notes.map((note) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            onTogglePin={onTogglePin}
                            onDelete={onDelete}
                        />
                    ))}
                </AnimatedCardsTranslateChildrenFade>
            </AnimatePresence>
        </ NoteCardsContainerStyles>
    );
});

export default NotesGrid;
