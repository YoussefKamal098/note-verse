import {useEffect, useRef} from 'react';
import {useSocket} from '@/contexts/SocketContext';
import {SOCKET_EVENTS} from '@/constants/socketEvents';

export const useOnlineNoteRoom = ({noteId, onNoteUpdate}) => {
    const {socket} = useSocket();
    const hasJoined = useRef(false);

    useEffect(() => {
        if (!socket || !noteId || hasJoined.current) return;

        const handleNoteUpdate = (data) => {
            onNoteUpdate?.(data);
        };

        socket.emit(SOCKET_EVENTS.NOTE.JOIN, {noteId});
        socket.on(SOCKET_EVENTS.NOTE.UPDATE, handleNoteUpdate);
        hasJoined.current = true;

        const leaveRoom = () => {
            if (socket.connected) {
                socket.emit(SOCKET_EVENTS.NOTE.LEAVE, {noteId});
            }
            socket.off(SOCKET_EVENTS.NOTE.UPDATE, handleNoteUpdate);
            hasJoined.current = false;
        };

        window.addEventListener('beforeunload', leaveRoom);

        return () => {
            leaveRoom();
            window.removeEventListener('beforeunload', leaveRoom);
        };
    }, [socket, noteId, onNoteUpdate]);
};
