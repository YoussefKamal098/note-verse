import React, {useEffect} from "react";
import NoteProvider from "./context/NoteProvider";
import {useNoteContext, useNoteSelector} from "./hooks/useNoteContext";
import Loader from "../common/Loader";
import Note from "./Note";

const NoteWrapper = ({id}) => {
    const {actions, selectors} = useNoteContext();
    const {initLoading, isLoading} = useNoteSelector(selectors.getStatus);

    useEffect(() => {
        if (id === 'new') {
            actions.initializeNewNote();
        } else {
            actions.fetchNote(id);
        }
    }, [id]);

    return (
        <>
            {initLoading ? <Loader/> : <Note/>}
            {isLoading && <Loader/>}
        </>
    );
};

function Index({id}) {
    return (
        <NoteProvider>
            <NoteWrapper id={id}/>
        </NoteProvider>
    );
}

export default React.memo(Index);
