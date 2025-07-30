import {useCallback, useEffect, useMemo, useState} from 'react';
import {emailValidation} from '@/validations/userValidation';
import userService from '@/api/userService';

const useCollaborators = ({
                              collaborator,
                              maxCollaborator,
                              maxSuggestions,
                              onCollaboratorAdd,
                              onCollaboratorRemove,
                              suggestionsCollaborators
                          }) => {
    const [inputEmail, setInputEmail] = useState('');
    const [selectedCollaborators, setSelectedCollaborators] = useState(
        new Map(collaborator.map(collab => [collab.id, collab]))
    );
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedCollaboratorId, setHighlightedCollaboratorId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [removedCollaboratorId, setRemovedCollaboratorId] = useState(null);
    const [addedCollaborator, setAddedCollaborator] = useState(null);

    const suggestionsMap = useMemo(() => new Map(
        suggestionsCollaborators.map(c => [c.id, c])
    ), [suggestionsCollaborators]);

    const filteredSuggestions = useMemo(() => {
        const searchTerm = inputEmail.toLowerCase();
        return Array.from(suggestionsMap.values())
            .filter(suggestion => {
                const matchesName = suggestion.firstname.toLowerCase().includes(searchTerm) ||
                    suggestion.lastname.toLowerCase().includes(searchTerm);
                return matchesName && !selectedCollaborators.has(suggestion.id);
            })
            .slice(0, maxSuggestions);
    }, [inputEmail, selectedCollaborators, suggestionsMap, maxSuggestions]);

    useEffect(() => {
        if (removedCollaboratorId) {
            onCollaboratorRemove?.(removedCollaboratorId);
            setRemovedCollaboratorId(null);
        }
    }, [removedCollaboratorId, onCollaboratorRemove]);

    useEffect(() => {
        if (addedCollaborator) {
            onCollaboratorAdd?.(addedCollaborator);
            setAddedCollaborator(null);
        }
    }, [addedCollaborator, onCollaboratorAdd]);

    useEffect(() => {
        setShowSuggestions(false);
        setHighlightedCollaboratorId(null);
        setHighlightedIndex(-1);
    }, [selectedCollaborators]);

    useEffect(() => setErrorMessage(""), [inputEmail]);

    const addCollaborator = useCallback(async (email) => {
        if (selectedCollaborators.size >= maxCollaborator) return;
        let pendingId;

        try {
            await emailValidation.validate(email);
            const exists = Array.from(selectedCollaborators.values())
                .some(c => c.email === email);
            if (exists) return setErrorMessage('This email has already been added');

            pendingId = `pending-${Date.now()}-${email}`;
            setSelectedCollaborators(prev => new Map(prev.set(pendingId,
                {id: pendingId, email, pending: true})));

            const response = await userService.getUser({email});
            const user = response.data;
            setSelectedCollaborators(prev => {
                const newMap = new Map(prev);
                newMap.delete(pendingId);
                if (user) {
                    newMap.set(user.id, user);
                    setAddedCollaborator(user);
                } else {
                    setErrorMessage('No user found with this email address');
                }
                return newMap;
            });
        } catch (error) {
            setSelectedCollaborators(prev => {
                const newMap = new Map(prev);
                if (pendingId) newMap.delete(pendingId);
                return newMap;
            });
            setErrorMessage(error.message || 'Failed to add collaborator');
        }
    }, [maxCollaborator, onCollaboratorAdd, selectedCollaborators]);

    const removeCollaborator = useCallback((collaboratorId) => {
        setSelectedCollaborators(prev => {
            const newMap = new Map(prev);
            if (newMap.delete(collaboratorId)) setRemovedCollaboratorId(collaboratorId);
            return newMap;
        });
        setErrorMessage("");
    }, []);

    useEffect(() => {
        return () => {
            selectedCollaborators.clear();
            suggestionsMap.clear()
        };
    }, []);

    return {
        inputEmail,
        setInputEmail,
        selectedCollaborators,
        setSelectedCollaborators,
        filteredSuggestions,
        highlightedIndex,
        setHighlightedIndex,
        showSuggestions,
        setShowSuggestions,
        highlightedCollaboratorId,
        setHighlightedCollaboratorId,
        errorMessage,
        setErrorMessage,
        suggestionsMap,
        addCollaborator,
        removeCollaborator
    };
};

export default useCollaborators;
