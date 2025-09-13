import {useReducer, useState} from "react";

/**
 * Reducer for managing popup state
 * @param {Object} state - Current state
 * @param {Object} action - Action to process
 * @param {string} action.type - Action type
 * @param {string} action.popup - Popup name to modify
 * @param {*} action.data - Optional data for the popup
 * @param {string} action.userId - User ID for user contribution history
 */
const popupReducer = (state, action) => {
    switch (action.type) {
        case "TOGGLE":
            return {
                ...state,
                [action.popup]: {
                    ...state[action.popup],
                    open: !state[action.popup].open,
                    data: action.data || state[action.popup].data,
                },
            };
        case "CLOSE":
            return {
                ...state,
                [action.popup]: {...state[action.popup], open: false},
            };
        case "SET_USER":
            return {
                ...state,
                userContributionHistory: {
                    ...state.userContributionHistory,
                    data: {userId: action.userId},
                },
            };
        default:
            return state;
    }
};


/**
 * Custom hook for managing all note-related popups and modals
 *
 * @param {boolean} isMobile - Whether the device is mobile
 * @param {boolean} isNew - Whether the note is a new note
 * @returns {Object} Popup management utilities
 * @returns {Object} returns.popups - Current state of all popups
 * @returns {Object} returns.realTimeUpdatesPanel - Real-time updates panel controls
 * @returns {Function} returns.togglePopup - Function to toggle a popup
 * @returns {Function} returns.closePopup - Function to close a popup
 * @returns {Function} returns.setCurrentUserContributionHistoryId - Function to set user ID for contribution history
 */
export const useNotePopupManager = (isMobile, isNew) => {
    const [popups, dispatch] = useReducer(popupReducer, {
        share: {open: false},
        commitHistory: {open: false},
        contributors: {open: false},
        userContributionHistory: {open: false, data: {userId: null}},
        commitMessage: {open: false},
    });

    const [showRealTimeUpdatesPanel, setShowRealTimeUpdatesPanel] = useState(!isMobile && !isNew);

    return {
        popups,
        realTimeUpdatesPanel: {
            show: showRealTimeUpdatesPanel,
            setShow: setShowRealTimeUpdatesPanel,
            toggle: () => setShowRealTimeUpdatesPanel((p) => !p),
            close: () => setShowRealTimeUpdatesPanel(false),
        },
        togglePopup: (popup, data = null) => dispatch({type: "TOGGLE", popup, data}),
        closePopup: (popup) => dispatch({type: "CLOSE", popup}),
        setCurrentUserContributionHistoryId: (userId) => dispatch({type: "SET_USER", userId}),
    };
};
