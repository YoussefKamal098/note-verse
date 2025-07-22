import {useEffect, useRef} from 'react';

/**
 * Runs the callback only if the user was offline and then comes back online.
 * Will not run on initial load if the user is already online.
 */
export function useOnlineBack(callback) {
    const wasOffline = useRef(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            if (wasOffline.current) {
                wasOffline.current = false;
                callback();
            }
        };

        const handleOffline = () => {
            wasOffline.current = true;
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [callback]);
}
