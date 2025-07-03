import {useEffect, useMemo, useRef} from 'react';
import {useNavigate} from "react-router-dom";
import {useImmerReducer} from 'use-immer';
import {useToastNotification} from '@/contexts/ToastNotificationsContext';
import {useAuth} from '@/contexts/AuthContext';
import useRequestManager from '@/hooks/useRequestManager';
import {versionReducer} from '../reducers/versionReducer';
import {createVersionActions} from '../reducers/versionActions';
import {versionSelectors} from '../selectors/versionSelectors';
import {INIT_STATE} from '../constants/versionConstants';
import VersionContext from './versionContext';

const VersionProvider = ({children}) => {
    const navigate = useNavigate();
    const {notify} = useToastNotification();
    const requestManager = useRequestManager();
    const {user} = useAuth();

    const [state, dispatch] = useImmerReducer(versionReducer, {...INIT_STATE});
    const stateRef = useRef(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const actions = useMemo(() => {
        const getState = () => stateRef.current;

        return createVersionActions(dispatch, getState, {
            notify,
            requestManager,
            navigate,
            user
        });
    }, [dispatch, notify, navigate, user, requestManager]);

    const contextValue = useMemo(() => ({
        state,
        actions,
        selectors: versionSelectors
    }), [state, actions]);

    return (
        <VersionContext.Provider value={contextValue}>
            {children}
        </VersionContext.Provider>
    );
};

export default VersionProvider;
