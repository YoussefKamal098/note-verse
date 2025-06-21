import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef} from 'react';
import PropTypes from 'prop-types';
import useOutsideClick from '../../hooks/useOutsideClick';
import useCollaborators from './useCollaborators';
import CollaboratorsList from './CollaboratorsList';
import SuggestionsList from './SuggestionsList';
import ErrorDisplay from './ErrorDisplay';
import InputField from './InputField';
import {InputContainerStyles, WrapperStyles} from './styles';

const CollaboratorsInput = forwardRef(({
                                           placeholder,
                                           collaborator,
                                           maxCollaborator = 10,
                                           maxSuggestions = 10,
                                           suggestionsCollaborators,
                                           onCollaboratorAdd,
                                           onCollaboratorRemove,
                                       }, ref) => {
    const {
        inputEmail,
        setInputEmail,
        setErrorMessage,
        setSelectedCollaborators,
        selectedCollaborators,
        filteredSuggestions,
        highlightedIndex,
        setHighlightedIndex,
        showSuggestions,
        setShowSuggestions,
        highlightedCollaboratorId,
        setHighlightedCollaboratorId,
        errorMessage,
        suggestionsMap,
        addCollaborator,
        removeCollaborator
    } = useCollaborators({
        collaborator,
        maxCollaborator,
        maxSuggestions,
        onCollaboratorAdd,
        onCollaboratorRemove,
        suggestionsCollaborators
    });

    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    useOutsideClick(wrapperRef, () => setShowSuggestions(false));

    useImperativeHandle(ref, () => ({
        resetInput: () => {
            setSelectedCollaborators(new Map());
            setInputEmail('');
        }
    }));

    useEffect(() => {
        inputRef.current?.focus();
    }, [selectedCollaborators]);

    const handleBackspace = useCallback(() => {
        if (highlightedCollaboratorId) {
            removeCollaborator(highlightedCollaboratorId);
            setHighlightedCollaboratorId(null);
        } else if (selectedCollaborators.size > 0) {
            const lastId = Array.from(selectedCollaborators.keys()).pop();
            if (!selectedCollaborators.get(lastId).pending) {
                setHighlightedCollaboratorId(lastId);
            }
        }
    }, [highlightedCollaboratorId, removeCollaborator, selectedCollaborators]);

    const addSuggestedCollaborator = useCallback((collaboratorId) => {
        const collaborator = suggestionsMap.get(collaboratorId);
        if (!collaborator || selectedCollaborators.has(collaboratorId)) return;

        setSelectedCollaborators(prev => new Map(prev.set(collaboratorId, collaborator)));
        onCollaboratorAdd?.(collaborator);
        setInputEmail('');
    }, [onCollaboratorAdd, selectedCollaborators, suggestionsMap]);

    const handleKeyDown = useCallback(async (e) => {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
                    addSuggestedCollaborator(filteredSuggestions[highlightedIndex].id);
                } else if (inputEmail) {
                    setInputEmail('');
                    await addCollaborator(inputEmail.trim());
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => Math.max(0, prev - 1));
                break;
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => Math.min(filteredSuggestions.length - 1, prev + 1));
                break;
            case 'Backspace':
                if (!inputEmail) handleBackspace();
                break;
        }
    }, [addCollaborator, addSuggestedCollaborator, filteredSuggestions,
        highlightedIndex, inputEmail, handleBackspace]);

    const handleChange = useCallback((e) => {
        setInputEmail(e.target.value);
        setShowSuggestions(true);
        setHighlightedCollaboratorId(null);
    }, []);

    const inputFocus = useCallback(() => {
        if (selectedCollaborators.size < maxCollaborator) {
            inputRef.current?.focus();
            setShowSuggestions(true);
        } else {
            setErrorMessage(`You can only add up to ${maxCollaborator} collaborators`);
        }
    }, [maxCollaborator, selectedCollaborators.size, filteredSuggestions]);

    return (
        <WrapperStyles ref={wrapperRef}>
            <InputContainerStyles
                $hasFocus={showSuggestions}
                onClick={inputFocus}
            >
                <CollaboratorsList
                    collaborators={Array.from(selectedCollaborators.values())}
                    highlightedId={highlightedCollaboratorId}
                    onRemove={removeCollaborator}
                />

                <InputField
                    inputEmail={inputEmail}
                    handleChange={handleChange}
                    handleKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    isDisabled={selectedCollaborators.size >= maxCollaborator}
                    hasCollaborators={selectedCollaborators.size === 0}
                    ref={inputRef}
                />
            </InputContainerStyles>

            <SuggestionsList
                showSuggestions={showSuggestions}
                filteredSuggestions={filteredSuggestions}
                highlightedIndex={highlightedIndex}
                handleSuggestionClick={addSuggestedCollaborator}
            />

            <ErrorDisplay errorMessage={errorMessage}/>
        </WrapperStyles>
    );
});

CollaboratorsInput.propTypes = {
    placeholder: PropTypes.string,
    maxCollaborator: PropTypes.number,
    maxSuggestions: PropTypes.number,
    collaborators: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            firstname: PropTypes.string.isRequired,
            lastname: PropTypes.string.isRequired,
            email: PropTypes.string.isRequired,
            avatarUrl: PropTypes.string
        })
    ),
    suggestionsCollaborators: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            firstname: PropTypes.string.isRequired,
            lastname: PropTypes.string.isRequired,
            email: PropTypes.string.isRequired,
            avatarUrl: PropTypes.string
        })
    ).isRequired,
    onCollaboratorRemove: PropTypes.func.isRequired,
    onCollaboratorAdd: PropTypes.func.isRequired
};

export default React.memo(CollaboratorsInput);
