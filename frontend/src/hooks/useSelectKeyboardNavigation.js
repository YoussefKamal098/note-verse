import {useCallback, useEffect, useState} from 'react';

export const useSelectKeyboardNavigation = (selectRef, items, isOpen, onSelect, onClose) => {
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const handleKeyDown = useCallback((e) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'Escape':
                onClose();
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => Math.max(0, prev - 1));
                break;
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => Math.min(items.length - 1, prev + 1));
                break;
            case 'Enter':
                if (highlightedIndex >= 0) {
                    onSelect(items[highlightedIndex].value);
                }
                break;
        }
    }, [isOpen, highlightedIndex, items, onSelect, onClose]);

    useEffect(() => {
        if (selectRef.current && isOpen && highlightedIndex >= 0) {
            const option = selectRef.current.querySelector(`[role="option"]:nth-child(${highlightedIndex + 1})`);
            option?.focus();
        }
    }, [highlightedIndex, isOpen]);

    useEffect(() => {
        if (!isOpen) setHighlightedIndex(-1);
    }, [isOpen]);

    return {highlightedIndex, setHighlightedIndex, handleKeyDown};
};

export default useSelectKeyboardNavigation;
