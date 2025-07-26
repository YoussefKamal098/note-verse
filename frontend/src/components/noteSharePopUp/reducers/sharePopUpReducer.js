import {produce} from "immer";
import {ACTION_TYPES} from "../constants/actionTypes";

export const sharePopUpReducer = produce((draft, action) => {
    switch (action.type) {
        case ACTION_TYPES.UPDATE_GENERAL_ACCESS:
            draft.isPublic = action.payload;
            break;

        case ACTION_TYPES.ADD_NEW_COLLABORATOR:
            draft.newCollaborators.set(action.payload.id, action.payload);
            break;

        case ACTION_TYPES.REMOVE_NEW_COLLABORATOR:
            draft.newCollaborators.delete(action.payload);
            break;

        case ACTION_TYPES.CLEAR_NEW_COLLABORATOR:
            draft.newCollaborators.clear();
            break;

        case ACTION_TYPES.UPDATE_COLLABORATOR: {
            const {id, role} = action.payload;
            const collaborator = draft.collaborators.get(id);

            if (collaborator) {
                if (collaborator.role === role) {
                    draft.updatedCollaborators.delete(id);
                } else {
                    draft.updatedCollaborators.set(id, {...collaborator, role});
                }

                if (draft.removedCollaborators.has(id)) {
                    draft.removedCollaborators.delete(id);
                }
            }
            break;
        }

        case ACTION_TYPES.REMOVE_COLLABORATOR: {
            const id = action.payload;
            if (draft.collaborators.has(id)) {
                draft.removedCollaborators.add(id);
                draft.updatedCollaborators.delete(id);
            }
            break;
        }

        case ACTION_TYPES.INITIAL_DATA_LOADED:
            draft.collaborators = new Map(action.payload.collaborators.map(c => [c.id, c]));
            draft.suggestions = action.payload.suggestions;
            draft.initLoading = false;
            draft.initError = null;
            draft.error = null;
            
            break;

        case ACTION_TYPES.APPLY_CHANGES_TO_COLLABORATORS: {
            const {
                addNew = true,
                update = true,
                remove = true
            } = action.payload?.flags || {};

            // Add new collaborators
            if (addNew && draft.newCollaborators.size > 0) {
                for (const [id, collaborator] of draft.newCollaborators) {
                    draft.collaborators.set(id, {...collaborator, role: draft.newCollaboratorsRole});
                }
                draft.newCollaborators.clear();
            }


            // Remove collaborators
            if (remove && draft.removedCollaborators.size > 0) {
                for (const id of draft.removedCollaborators) {
                    draft.collaborators.delete(id);
                }
                draft.removedCollaborators.clear();
            }

            // Update existing collaborators
            if (update && draft.updatedCollaborators.size > 0) {
                for (const [id, updatedCollaborator] of draft.updatedCollaborators) {
                    if (draft.collaborators.has(id)) {
                        const collaborator = draft.collaborators.get(id);
                        draft.collaborators.set(id, {
                            ...collaborator,
                            role: updatedCollaborator.role,
                        });
                    }
                }
                draft.updatedCollaborators.clear();
            }
            break;
        }

        case ACTION_TYPES.SET_NEW_COLLABORATOR_NOTIFY:
            draft.notifyNewCollaborators = action.payload;
            break;

        case ACTION_TYPES.SET_NEW_COLLABORATOR_MESSAGE:
            draft.newCollaboratorsMessage = action.payload;
            break;

        case ACTION_TYPES.SET_NEW_COLLABORATOR_ROLE:
            draft.newCollaboratorsRole = action.payload;
            break;

        case ACTION_TYPES.UPDATE_STATUS:
            draft.initLoading = action.payload.initLoading !== undefined ? action.payload.initLoading : draft.initLoading;
            draft.initError = action.payload.initError !== undefined ? action.payload.initError : draft.initError;
            draft.isLoading = action.payload.isLoading !== undefined ? action.payload.isLoading : draft.isLoading;
            draft.error = action.payload.error !== undefined ? action.payload.error : draft.error;
            break;
    }
});
