import {useEffect, useMemo, useRef} from 'react';
import {useImmerReducer} from 'use-immer';
import useRequestManager from "../../../hooks/useRequestManager";
import {useAuth} from "../../../contexts/AuthContext";
import {useToastNotification} from '../../../contexts/ToastNotificationsContext';
import {sharePopUpReducer} from '../reducers/sharePopUpReducer';
import {createSharePopUpActions} from '../reducers/sharePopUpActions';
import {sharePopUpSelectors} from '../selectors/sharePopUpSelectors';
import {INIT_STATE} from '../constants/initialState';
import SharePopUpContext from './SharePopUpContext';

const SharePopUpProvider = ({children, noteMeta}) => {
    const [state, dispatch] = useImmerReducer(sharePopUpReducer, {
        ...INIT_STATE,
        noteId: noteMeta.id,
        isPublic: noteMeta.isPublic
    });
    const requestManager = useRequestManager();
    const {notify} = useToastNotification();
    const {user} = useAuth();
    const stateRef = useRef(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const actions = useMemo(() => {
        const getState = () => stateRef.current;
        return createSharePopUpActions(dispatch, getState, {
            requestManager,
            notify,
            user
        });
    }, [dispatch, requestManager, notify, user]);

    const contextValue = useMemo(() => ({
        state,
        actions,
        selectors: sharePopUpSelectors
    }), [state, actions]);

    return (
        <SharePopUpContext.Provider value={contextValue}>
            {children}
        </SharePopUpContext.Provider>
    );
};

export default SharePopUpProvider;
