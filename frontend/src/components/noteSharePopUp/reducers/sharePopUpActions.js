import {ACTION_TYPES} from "../constants/actionTypes";
import {API_CLIENT_ERROR_CODES} from '../../../api/apiClient';
import noteService from '../../../api/noteService';
import userService from '../../../api/userService';

export const createSharePopUpActions = (dispatch, getState, dependencies) => {
    const {user, requestManager, notify} = dependencies;

    const handleError = (error) => {
        if (error.name !== API_CLIENT_ERROR_CODES.ERR_CANCELED) {
            notify.error(error.message);
            dispatch({
                type: ACTION_TYPES.UPDATE_STATUS,
                payload: {
                    error: error.message,
                    isLoading: false,
                    initLoading: false
                }
            });
        }
    };

    return {
        fetchInitialData: async () => {
            const controller = requestManager.createAbortController();

            try {
                const [permissionsResponse, grantedPermissionsResponse] = await Promise.all([
                    noteService.getNotePermissions(getState().noteId, {}, {signal: controller.signal}),
                    userService.getPermissionsGrantedByUser(user?.id, {}, {signal: controller.signal})
                ]);

                const collaborators = permissionsResponse.data.map(permission => ({
                    id: permission.user.id,
                    email: permission.user.email,
                    firstname: permission.user.firstname,
                    lastname: permission.user.lastname,
                    avatarUrl: permission.user.avatarUrl,
                    role: permission.role
                }));

                const suggestions = grantedPermissionsResponse.data.map(permission => ({
                    id: permission.user.id,
                    email: permission.user.email,
                    firstname: permission.user.firstname,
                    lastname: permission.user.lastname,
                    avatarUrl: permission.user.avatarUrl
                }));

                dispatch({
                    type: ACTION_TYPES.INITIAL_DATA_LOADED,
                    payload: {
                        collaborators,
                        suggestions
                    }
                });
            } catch (error) {
                handleError(error);
            } finally {
                requestManager.removeAbortController(controller);
            }
        },

        addNewCollaborator: (collaborator) => {
            dispatch({
                type: ACTION_TYPES.ADD_NEW_COLLABORATOR,
                payload: collaborator
            });
        },

        removeNewCollaborator: (id) => {
            dispatch({
                type: ACTION_TYPES.REMOVE_NEW_COLLABORATOR,
                payload: id
            });
        },

        clearNewCollaborator: () => {
            dispatch({
                type: ACTION_TYPES.CLEAR_NEW_COLLABORATOR
            });
        },

        updateCollaborator: (id, role) => {
            dispatch({
                type: ACTION_TYPES.UPDATE_COLLABORATOR,
                payload: {id, role}
            });
        },

        removeCollaborator: (id) => {
            dispatch({
                type: ACTION_TYPES.REMOVE_COLLABORATOR,
                payload: id
            });
        },

        updateGeneralAccess: async (isPublic) => {
            const controller = requestManager.createAbortController();

            try {
                dispatch({type: ACTION_TYPES.UPDATE_STATUS, payload: {isLoading: true}});

                dispatch({
                    type: ACTION_TYPES.UPDATE_GENERAL_ACCESS,
                    payload: isPublic
                });

                await noteService.updateNoteById(
                    {noteId: getState().noteId},
                    {isPublic},
                    {signal: controller.signal}
                );

                notify.success('General access updated successfully');

                dispatch({type: ACTION_TYPES.UPDATE_STATUS, payload: {isLoading: false}});
            } catch (error) {
                handleError(error);

                dispatch({
                    type: ACTION_TYPES.UPDATE_GENERAL_ACCESS,
                    payload: !isPublic
                });
            } finally {
                requestManager.removeAbortController(controller);
            }
        },

        updateGeneralAccessState: (isPublic) => {
            dispatch({
                type: ACTION_TYPES.UPDATE_GENERAL_ACCESS,
                payload: isPublic
            });
        },

        updateNewCollaboratorRole: (role) => {
            dispatch({
                type: ACTION_TYPES.SET_NEW_COLLABORATOR_ROLE,
                payload: role
            });
        },

        updateNotifySetting: (shouldNotify) => {
            dispatch({
                type: ACTION_TYPES.SET_NEW_COLLABORATOR_NOTIFY,
                payload: shouldNotify
            });
        },

        updateMessage: (message) => {
            dispatch({
                type: ACTION_TYPES.SET_NEW_COLLABORATOR_MESSAGE,
                payload: message
            });
        },

        saveChanges: async (options = {}) => {
            const controller = requestManager.createAbortController();
            const {
                noteId,
                newCollaborators,
                newCollaboratorsRole,
                removedCollaborators,
                updatedCollaborators,
                notifyNewCollaborators,
                newCollaboratorsMessage,
            } = getState();

            // Default flags (all true if not specified)
            const {
                addNew = true,     // Process new collaborators
                update = true,     // Process role updates
                remove = true,     // Process removed collaborators
            } = options;

            try {
                dispatch({type: ACTION_TYPES.UPDATE_STATUS, payload: {isLoading: true}});

                const operations = [];

                if (addNew && newCollaborators.size > 0) {
                    operations.push(
                        noteService.grantPermissions(
                            noteId,
                            {
                                userIds: Array.from(newCollaborators.keys()),
                                role: newCollaboratorsRole,
                                notify: notifyNewCollaborators,
                                message: newCollaboratorsMessage,
                            },
                            {signal: controller.signal}
                        )
                    );
                }

                if (remove && removedCollaborators.size > 0) {
                    operations.push(...Array.from(removedCollaborators).map(collaboratorId =>
                        userService.revokePermission(
                            collaboratorId,
                            {noteId},
                            {signal: controller.signal}
                        )
                    ));
                }

                if (update && updatedCollaborators.size > 0) {
                    operations.push(...Array.from(updatedCollaborators.values()).map(collaborator =>
                        userService.updatePermission(
                            collaborator.id,
                            {noteId, role: collaborator.role},
                            {signal: controller.signal}
                        )
                    ));
                }

                await Promise.all(operations);

                if (
                    (addNew && newCollaborators.size > 0) ||
                    (update && updatedCollaborators.size > 0) ||
                    (remove && removedCollaborators.size > 0)
                ) {
                    dispatch({
                        type: ACTION_TYPES.APPLY_CHANGES_TO_COLLABORATORS,
                        payload: {
                            flags: {
                                addNew: options.addNew,
                                update: options.update,
                                remove: options.remove
                            }
                        }
                    });
                    notify.success('Collaborators updated successfully');
                }

                return true;
            } catch (error) {
                handleError(error);
            } finally {
                requestManager.removeAbortController(controller);
                dispatch({type: ACTION_TYPES.UPDATE_STATUS, payload: {isLoading: false}});
            }
        },
    };
};
