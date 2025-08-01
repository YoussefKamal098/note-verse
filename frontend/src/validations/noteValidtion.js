import * as yup from 'yup';

const noteValidationSchema = {
    title: yup.string()
        .trim()
        .test('not-empty', 'Title cannot be empty or just spaces', (value) => value && value.trim().length > 0)
        .max(150, 'Title cannot exceed 150 characters')
        .required('Title is required'),

    tag: yup.string()
        .trim()
        .test('not-empty', 'Tag cannot be empty or just spaces', (value) => value && value.trim().length > 0)
        .min(1, 'Tag must be at least 1 characters')
        .max(50, 'Tag cannot exceed 50 characters')
        .required('Tag is required'),

    tags: yup.array()
        .of(
            yup.string()
                .min(1, 'Each tag must be at least 1 characters')
                .max(50, 'Each tag cannot exceed 50 characters')
                .required('Each tag is required'),
        )
        .min(1, 'You must have at least one tag')
        .max(10, 'You can have up to 10 tags')
        .required('Tags are required')
        .test('unique-tags', 'Tag already exists', (value) => {
            if (!value) return true;
            const lowerCaseTags = value.map((tag) => tag.toLowerCase());
            const uniqueTags = new Set(lowerCaseTags);
            return lowerCaseTags.length === uniqueTags.size;
        }),

    content: yup.string()
        .trim()
        .test('not-empty', 'Content cannot be empty or just spaces', (value) => value && value.trim().length > 0)
        .max(1024 * 500, 'Content cannot exceed 500KB')
        .required('Content is required'),
};

export default noteValidationSchema;
