import {differenceInDays, format, formatDistanceToNow, isSameYear} from "date-fns";

const formatSocialDate = (date) => {
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();

        // If the date is invalid
        if (isNaN(dateObj)) return 'N/A';

        const daysDifference = differenceInDays(now, dateObj);

        // Within the last 7 days: show relative time with suffix
        if (daysDifference < 7) {
            return formatDistanceToNow(dateObj, {addSuffix: true});
        }

        // Current year: show month and day
        if (isSameYear(dateObj, now)) {
            return format(dateObj, 'MMM d');
        }

        // Previous years: show month, day, and year
        return format(dateObj, 'MMM d, yyy');
    } catch {
        return 'N/A';
    }
};

export {formatSocialDate};
