import {createSelector} from 'reselect';

export const createSharePopUpSelectors = () => {
    const selectBase = state => state;

    return {
        getCollaborators: createSelector(
            [selectBase],
            state => Array.from(state.collaborators.values())
        ),
        getSuggestions: createSelector(
            [selectBase],
            state => state.suggestions
        ),
        getNewCollaborators: createSelector(
            [selectBase],
            state => Array.from(state.newCollaborators.values())
        ),
        getUpdatedCollaborators: createSelector(
            [selectBase],
            state => Array.from(state.updatedCollaborators.values())
        ),
        getRemovedCollaborators: createSelector(
            [selectBase],
            state => Array.from(state.removedCollaborators)
        ),
        getNewCollaboratorsCount: createSelector(
            [selectBase],
            state => state.newCollaborators.size
        ),
        getUpdatedCollaboratorsCount: createSelector(
            [selectBase],
            state => state.updatedCollaborators.size
        ),
        getRemovedCollaboratorsCount: createSelector(
            [selectBase],
            state => state.removedCollaborators.size
        ),
        getShareSettings: createSelector(
            [selectBase],
            state => ({
                role: state.newCollaboratorsRole,
                notify: state.notifyNewCollaborators,
                message: state.newCollaboratorsMessage
            })
        ),
        hasChanges: createSelector(
            [selectBase],
            state => (
                state.newCollaborators.size > 0 ||
                state.removedCollaborators.size > 0 ||
                state.updatedCollaborators.size > 0
            )
        ),
        getGeneralAccess: createSelector(
            [selectBase],
            state => state.isPublic
        ),
        getInitLoading: createSelector(
            [selectBase],
            state => state.initLoading
        ),
        getIsLoading: createSelector(
            [selectBase],
            state => state.isLoading
        ),
        getError: createSelector(
            [selectBase],
            state => state.error
        )
    };
};

export const sharePopUpSelectors = createSharePopUpSelectors();
