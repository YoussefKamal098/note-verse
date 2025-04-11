import {useCallback, useState} from "react";
import {deepEqual} from "shared-utils/obj.utils";

const useNoteState = (initialNote = {}) => {
    const [noteState, setNoteState] = useState(initialNote);

    const [hasChanges, setHasChanges] = useState(false);

    const checkChanges = useCallback((currentState) => {
        return Object.keys(initialNote).some(key => {
            if (key === 'tags') return !deepEqual(initialNote[key], currentState[key]);
            return initialNote[key] !== currentState[key];
        });
    }, [initialNote]);

    const updateState = useCallback((updates) => {
        setNoteState(prev => {
            const newState = {...prev, ...updates};
            setHasChanges(checkChanges(newState));
            return newState;
        });
    }, [checkChanges]);

    return {
        noteState,
        hasChanges,
        updateState
    };
};

export default useNoteState;
