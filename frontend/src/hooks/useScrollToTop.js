import {useEffect} from "react";

const useScrollToTop = (ref, dependencies) => {
    useEffect(() => {
        if (ref.current) {
            ref.current.scrollIntoView({behavior: "smooth", block: "start"});
        }
    }, dependencies);
};

export default useScrollToTop;
