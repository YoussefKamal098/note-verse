import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import useRequestManager from "./useRequestManager";
import {useToastNotification} from "@/contexts/ToastNotificationsContext";
import noteService from "../api/noteService";
import {API_CLIENT_ERROR_CODES} from "../api/apiClient";

const usePaginatedNotes = ({
                               searchText,
                               limit = 10
                           }) => {
    const navigate = useNavigate();
    const {notify} = useToastNotification();
    const {createAbortController} = useRequestManager();

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [nextCursor, setNextCursor] = useState(null);

    const fetchNotes = useCallback(async ({cursor, searchText, limit}) => {
        const controller = createAbortController();

        try {
            const res = await noteService.getUserNotes(
                {searchText, cursor, limit},
                {signal: controller.signal}
            );
            return res.data;
        } catch (err) {
            if (err.code !== API_CLIENT_ERROR_CODES.ERR_CANCELED) {
                throw err;
            }
        }
    }, [createAbortController]);

    const loadNotes = useCallback(async ({cursor, searchText, limit} = {}) => {
        try {
            setLoading(true);
            const result = await fetchNotes({cursor, searchText, limit});
            if (!result) return;

            setNotes((prev) => [...prev, ...result.data]);
            setNextCursor(result.nextCursor);
            setLoading(false);
        } catch (err) {
            if (err.code !== API_CLIENT_ERROR_CODES.ERR_CANCELED) {
                setLoading(false);
                notify.error(err.message);
            }
        }
    }, [fetchNotes, navigate]);

    // Reset on search
    useEffect(() => {
        setNotes([]);
        loadNotes({cursor: null, limit, searchText});
    }, [searchText]);

    return {
        notes,
        loading,
        nextCursor,
        loadNext: () => nextCursor && loadNotes({cursor: nextCursor})
    };
};

export default usePaginatedNotes;
