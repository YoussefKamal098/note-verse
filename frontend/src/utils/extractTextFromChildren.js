import React from 'react';

/**
 * Recursively extracts plain text from deeply nested React children.
 *
 * @param {React.ReactNode} children - The children prop which can be a string, array, or React element.
 * @returns {string} - Extracted plain text.
 */
const extractTextFromChildren = (children) => {
    if (typeof children === 'string') {
        return children;
    }

    if (Array.isArray(children)) {
        return children.map(extractTextFromChildren).join('');
    }

    if (React.isValidElement(children)) {
        return extractTextFromChildren(children.props?.children);
    }

    return '';
};

export default extractTextFromChildren;
