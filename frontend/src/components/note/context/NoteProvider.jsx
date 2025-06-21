import {useEffect, useMemo, useRef} from 'react';
import {useNavigate} from "react-router-dom";
import {useImmerReducer} from 'use-immer';
import {useAuth} from '../../../contexts/AuthContext';
import {useToastNotification} from '../../../contexts/ToastNotificationsContext';
import useNoteValidation from '../../../hooks/useNoteValidation';
import useRequestManager from '../../../hooks/useRequestManager';
import {noteReducer} from '../reducers/noteReducer';
import {createNoteActions} from '../reducers/noteActions';
import {noteSelectors} from '../selectors/noteSelectors';
import {INIT_STATE} from '../constants/noteConstants';
import NoteContext from './NoteContext';

const NoteProvider = ({children}) => {
    const navigate = useNavigate();
    const {notify} = useToastNotification();
    const {validateNote} = useNoteValidation();
    const requestManager = useRequestManager();
    const {user} = useAuth();

    const [state, dispatch] = useImmerReducer(noteReducer, INIT_STATE);
    const stateRef = useRef(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const actions = useMemo(() => {
        const getState = () => stateRef.current;

        return createNoteActions(dispatch, getState, {
            navigate,
            notify,
            validateNote,
            requestManager,
            user
        });
    }, [dispatch, navigate, notify, validateNote, user, requestManager]);

    const contextValue = useMemo(() => ({
        state,
        actions,
        selectors: noteSelectors
    }), [state, actions]);

    return (
        <NoteContext.Provider value={contextValue}>
            {children}
        </NoteContext.Provider>
    );
};

export default NoteProvider;
