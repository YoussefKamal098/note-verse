import {useEffect} from "react";

const useOutsideClick = (ref, callback, additionalTargetRefs = [], excludeTargetRefs = []) => {
    useEffect(() => {
        const handleClickOutside = (event) => {
            const excludeEls = excludeTargetRefs.map(r => r?.current).filter(Boolean);
            const additionalEls = additionalTargetRefs.map(r => r?.current).filter(Boolean);

            const isExcluded = excludeEls.some(el => el && (event.target === el || el.contains(event.target)));
            if (isExcluded) return;

            const isOnAdditional = additionalEls.some(el => el && (event.target === el));
            if (isOnAdditional) {
                callback();
                return;
            }

            // Otherwise, if the event target is not inside the main ref, call callback.
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, callback, additionalTargetRefs, excludeTargetRefs]);
};

export default useOutsideClick;
