import {useEffect} from 'react';
import {useSocket} from '@/contexts/SocketContext';

export const useSocketEvent = (eventName, callback) => {
    const {socket} = useSocket();

    useEffect(() => {
        if (!socket) return;

        socket.off(eventName, callback); // ensure no duplicates
        socket.on(eventName, callback);

        return () => {
            socket.off(eventName, callback);
        };
    }, [socket, eventName, callback]);
};
