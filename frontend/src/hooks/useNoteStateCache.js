import {useToastNotification} from "../contexts/ToastNotificationsContext";
import {useEffect} from "react";
import cacheService from "../services/cacheService";
import {deepEqual} from "shared-utils/obj.utils";

const useNoteStateCache = (
    origNote,
    noteState,
    hasChanges,
    unsavedChanges,
    updateState
) => {
    const {notify} = useToastNotification();

    useEffect(() => {
        const restoreFromCache = async () => {
            if (!unsavedChanges) return;

            const cachedData = await cacheService.get(origNote.id);
            if (cachedData) {
                updateState(cachedData);
            }
        };

        restoreFromCache();
    }, [unsavedChanges]);

    useEffect(() => {
        const saveToCache = async () => {
            const changes = {
                ...(noteState.title !== origNote.title && {title: noteState.title}),
                ...(noteState.content !== origNote.content && {content: noteState.content}),
                ...(!deepEqual(noteState.tags, origNote.tags) && {tags: noteState.tags}),
                ...(noteState.isPinned !== origNote.isPinned && {isPinned: noteState.isPinned})
            };

            try {
                if (Object.keys(changes).length > 0) {
                    await cacheService.save(origNote.id, changes);
                } else {
                    await cacheService.delete(origNote.id).catch(() => ({}));
                }
            } catch (error) {
                notify.error(`Cache update failed: ${error.message}`);
            }
        };

        saveToCache();
    }, [noteState, hasChanges]);
};

export default useNoteStateCache;
