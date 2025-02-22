import {useEffect} from "react";

const useOutsideClick = (ref, callback, additionalTargets = []) => {
    useEffect(() => {
        const handleClickOutside = (event) => {
            // If event.target is within any of the additional targets, call callback.
            const clickedOnAdditional = additionalTargets.some(
                (target) => target && event.target === target
            );
            if (clickedOnAdditional) {
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
    }, [ref, callback, additionalTargets]);
};

export default useOutsideClick;
