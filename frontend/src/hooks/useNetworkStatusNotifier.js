import {useEffect, useRef} from 'react';
import {useToastNotification} from "@/contexts/ToastNotificationsContext";

export default function useNetworkStatusNotifier() {
    const {notify} = useToastNotification();
    const wasOffline = useRef(!navigator.onLine); // initial state

    useEffect(() => {
        const handleOnline = () => {
            if (wasOffline.current) {
                notify.success("You are back online.");
                wasOffline.current = false;
            }
        };

        const handleOffline = () => {
            notify.warn("You are offline. Changes will be saved when you're back online.");
            wasOffline.current = true;
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [notify]);
}
