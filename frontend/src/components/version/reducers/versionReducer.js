import {ACTION_TYPES} from "../constants/actionTypes";
import {VERSION_STATUS, INIT_STATE} from "../constants/versionConstants";

export const versionReducer = (draft, action) => {
    switch (action.type) {
        case ACTION_TYPES.VERSION.INIT:
            Object.assign(draft, {
                ...INIT_STATE,
                id: action.payload.id,
                noteId: action.payload.noteId,
                createdAt: action.payload.createdAt,
                commitMessage: action.payload.commitMessage,
                patch: action.payload.patch,
                user: action.payload.user,
                isNoteOwner: action.payload.isNoteOwner,
                status: {...VERSION_STATUS, ...action.payload.status}
            });
            break;

        case ACTION_TYPES.STATUS.UPDATE:
            Object.assign(draft.status, action.payload);
            break;

        case ACTION_TYPES.STATUS.LOADING:
            draft.status.isLoading = action.payload;
            break;
        case ACTION_TYPES.STATUS.INIT_LOADING:
            draft.status.initLoading = action.payload;
            break;

        case ACTION_TYPES.VERSION.SET_FULL_CONTENT:
            draft.fullContent = action.payload;
            break;

        case ACTION_TYPES.STATUS.FULL_CONTENT_LOADING:
            draft.status.isFullContentLoading = action.payload;
            break;

        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
};
