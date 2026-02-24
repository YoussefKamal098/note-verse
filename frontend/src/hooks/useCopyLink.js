import {useCallback} from "react";
import {useToastNotification} from "@/contexts/ToastNotificationsContext";

const useCopyLink = () => {
    const {notify} = useToastNotification();

    return useCallback(async (options = {}) => {
        const {
            path = '',
            includeQuery = true,
            hash = '',
            customText = '',
            successMessage = "Link copied to clipboard!",
            errorMessage = 'Failed to copy link'
        } = options;

        try {
            const {origin, pathname, search} = window.location;

            const urlPath = path || pathname;
            const urlQuery = includeQuery ? search : '';
            const urlHash = hash ? `#${hash}` : '';

            const textToCopy = customText || `${origin}${urlPath}${urlQuery}${urlHash}`;

            await navigator.clipboard.writeText(textToCopy);
            notify.success(successMessage);
            return true;
        } catch (err) {
            notify.error(errorMessage);
            console.error('Copy failed:', err);
            return false;
        }
    }, [notify]);
};

export default useCopyLink;
