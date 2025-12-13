import {createSelector} from 'reselect';
import {deepEqual} from "shared-utils/obj.utils";
import {roles} from "@/constants/roles"

export const createNoteSelectors = () => {
    const selectBase = state => state;

    return {
        getMeta: createSelector([selectBase], state => ({
            id: state.id,
            createdAt: state.createdAt,
            isPinned: state.isPinned,
            isPublic: state.isPublic
        })),
        getContent: createSelector([selectBase], state => ({
            current: state.currentContent,
            original: state.originalContent
        })),
        getOwner: createSelector([selectBase], state => state.owner),
        getUserRole: createSelector([selectBase], state => state.userRole),
        getUserReaction: createSelector([selectBase], state => state.reactions.userReaction),
        getStatus: createSelector([selectBase], state => state.status),
        canEdit: createSelector([selectBase], state =>
            [roles.OWNER, roles.EDITOR].includes(state.userRole)
        ),
        isOwner: createSelector([selectBase], state =>
            state.userRole === roles.OWNER
        ),
        hasChanges: createSelector([selectBase], state =>
            !deepEqual(state.originalContent, state.currentContent)
        ),
        isContentChange: createSelector([selectBase], state =>
            state.originalContent.content !== state.currentContent.content
        )
    };
};

export const noteSelectors = createNoteSelectors();
