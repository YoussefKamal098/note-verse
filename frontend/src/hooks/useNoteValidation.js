import {useCallback} from "react";
import {useToastNotification} from "@/contexts/ToastNotificationsContext";
import noteValidationSchema from "@/validations/noteValidtion";

const useNoteValidation = () => {
    const {notify} = useToastNotification();

    const validateField = (schema, value, fieldName) => {
        try {
            schema.validateSync(value);
            return true;
        } catch (error) {
            notify.warn(`${fieldName} Error: ${error.message}`);
            return false;
        }
    };

    const validateTitle = useCallback((title) =>
        validateField(noteValidationSchema.title, title, 'Title'), []);

    const validateContent = useCallback((content) =>
        validateField(noteValidationSchema.content, content, 'Content'), []);

    const validateTags = useCallback((tags) =>
        validateField(noteValidationSchema.tags, tags, 'Tags'), []);

    const validateNote = useCallback((note) => {
        const isTitleValid = validateTitle(note.title);
        const isContentValid = validateContent(note.content);
        const isTagsValid = validateTags(note.tags);
        return isTitleValid && isContentValid && isTagsValid;
    }, [validateTitle, validateContent, validateTags]);

    return {
        validateNote,
        validateTitle,
        validateContent,
        validateTags
    };
};

export default useNoteValidation;
