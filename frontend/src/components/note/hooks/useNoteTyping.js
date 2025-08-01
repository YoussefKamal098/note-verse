import {useEffect, useRef, useCallback, useState} from 'react';
import {useSocket} from '@/contexts/SocketContext';
import {SOCKET_EVENTS} from '@/constants/socketEvents';

export const useNoteTyping = ({noteId}) => {
    const {socket} = useSocket();
    const [typingUsers, setTypingUsers] = useState([]);
    const typing = useRef(false);
    const typingTimeout = useRef(null);
    const listenerAttachedRef = useRef(false); // Ensure only one listener is attached

    const handleTypingUpdate = useCallback((users) => {
        setTypingUsers((prev) => {
            const newUsersMap = new Map();
            for (const user of users) {
                newUsersMap.set(user.id, {
                    id: user.id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    avatarUrl: user.avatarUrl,
                });
            }

            const prevIds = new Set(prev.map(u => u.id));
            const newIds = new Set(newUsersMap.keys());

            const isSame =
                prev.length === newUsersMap.size &&
                [...newIds].every(id => prevIds.has(id));

            if (isSame) return prev;
            return [...newUsersMap.values()];
        });
    }, []);

    useEffect(() => {
        if (!socket || !noteId || listenerAttachedRef.current) return;

        socket.on(SOCKET_EVENTS.NOTE_TYPING.UPDATE, handleTypingUpdate);
        listenerAttachedRef.current = true;

        // 🆕 Fetch current typing users on init
        socket.emit(SOCKET_EVENTS.NOTE_TYPING.GET, {noteId});

        return () => {
            socket.off(SOCKET_EVENTS.NOTE_TYPING.UPDATE, handleTypingUpdate);
            listenerAttachedRef.current = false;
        };
    }, [socket, noteId, handleTypingUpdate]);


    const emitStopTyping = () => {
        if (!typing.current) return;
        socket.emit(SOCKET_EVENTS.NOTE_TYPING.STOP, {noteId});
        typing.current = false;
    };

    const handleTyping = useCallback(() => {
        if (!typing.current) {
            socket.emit(SOCKET_EVENTS.NOTE_TYPING.START, {noteId});
            typing.current = true;
        }

        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(emitStopTyping, 2000); // 2s idl
    }, [noteId, socket]);

    // call this on each keystroke
    const onUserTyping = useCallback(() => {
        if (!socket || !noteId) return;
        handleTyping();
    }, [socket, noteId, handleTyping]);

    // cleanup on unmount
    useEffect(() => {
        return () => {
            clearTimeout(typingTimeout.current);
            emitStopTyping();
        };
    }, []);

    return {onUserTyping, typingUsers};
};
