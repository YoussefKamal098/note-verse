import React from 'react';
import CardHeader from './Header';
import CardContent from './Content';
import {CardStyles} from './Styles';

const NoteCard = React.memo(({note}) => {
    return (
        <CardStyles className={note.isPinned ? 'pinned' : ''}>
            <CardHeader note={note}/>
            <CardContent note={note}/>
        </CardStyles>
    )
});

export default React.memo(NoteCard);
