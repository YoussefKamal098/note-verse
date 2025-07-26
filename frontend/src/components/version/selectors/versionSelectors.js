import {createSelector} from 'reselect';

export const createVersionSelectors = () => {
    const selectBase = state => state;

    return {
        getVersion: createSelector([selectBase], state => ({
            id: state.id,
            noteId: state.noteId,
            createdAt: state.createdAt,
            commitMessage: state.commitMessage,
            patch: state.patch,
            user: state.user
        })),
        getUser: createSelector([selectBase], state => state.user),
        getStatus: createSelector([selectBase], state => state.status),
        isNoteOwner: createSelector([selectBase], state => state.isNoteOwner),
        getFullContent: createSelector([selectBase], state => state.fullContent)
    };
};

export const versionSelectors = createVersionSelectors();
