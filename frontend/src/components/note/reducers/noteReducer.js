import {deepEqual} from "shared-utils/obj.utils";
import {ACTION_TYPES} from "../constants/actionTypes";
import {INIT_STATE, NOTE_STATUS} from "../constants/noteConstants";

export const noteReducer = (draft, action) => {
    switch (action.type) {
        case ACTION_TYPES.NOTE.INIT:
            Object.assign(draft, {
                id: action.payload.id,
                createdAt: action.payload.createdAt,
                isPinned: action.payload.isPinned,
                isPublic: action.payload.isPublic,
                owner: action.payload.owner,
                userRole: action.payload.userRole,
                originalContent: action.payload.originalContent,
                currentContent: action.payload.currentContent,
                reactions: action.payload.reactions,
                status: {...NOTE_STATUS, ...action.payload.status}
            });
            break;

        case ACTION_TYPES.NOTE.INIT_NEW:
            Object.assign(draft, {
                ...INIT_STATE,
                owner: action.payload.owner,
                currentContent: action.payload.currentContent,
                status: {...NOTE_STATUS, ...action.payload.status}
            });
            break;

        case ACTION_TYPES.CONTENT.UPDATE_CURRENT:
            Object.assign(draft.currentContent, action.payload);
            break;

        case ACTION_TYPES.CONTENT.SET_ORIGINAL:
            draft.originalContent = action.payload;
            break;

        case ACTION_TYPES.CONTENT.DISCARD_CHANGES:
            draft.currentContent = {...draft.originalContent};
            break;

        case ACTION_TYPES.STATUS.UPDATE:
            Object.assign(draft.status, action.payload);
            break;

        case ACTION_TYPES.NOTE.TOGGLE_PIN:
            draft.isPinned = !draft.isPinned;
            break;

        case ACTION_TYPES.NOTE.TOGGLE_PUBLIC:
            draft.isPublic = !draft.isPublic;
            break;

        case ACTION_TYPES.NOTE.UPDATE_PUBLIC:
            draft.isPublic = action.payload;
            break;

        case ACTION_TYPES.STATUS.TOGGLE_EDIT_MODE:
            draft.status.editMode = !draft.status.editMode;
            break;

        case ACTION_TYPES.CONTENT.RESET_CONTENT:
            draft.originalContent.content = action.payload;
            draft.currentContent.content = action.payload;
            break;

        case ACTION_TYPES.REACTIONS.UPDATE:
            draft.reactions.counts = action.payload.counts;
            draft.reactions.userReaction = action.payload.userReaction;
            break;

        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
};

export const getContentChanges = (original, current) => ({
    ...(original.title !== current.title && {title: current.title}),
    ...(original.content !== current.content && {content: current.content}),
    ...(!deepEqual(original.tags, current.tags) && {tags: current.tags}),
    ...(original.isPinned !== current.isPinned && {isPinned: current.isPinned}),
});
