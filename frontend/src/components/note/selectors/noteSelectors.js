import {createSelector} from 'reselect';
import {deepEqual} from "shared-utils/obj.utils";

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
        getStatus: createSelector([selectBase], state => state.status),
        canEdit: createSelector([selectBase], state =>
            ['owner', 'editor'].includes(state.userRole)
        ),
        isOwner: createSelector([selectBase], state =>
            state.userRole === 'owner'
        ),
        hasChanges: createSelector([selectBase], state =>
            !deepEqual(state.originalContent, state.currentContent)
        )
    };
};

export const noteSelectors = createNoteSelectors();
