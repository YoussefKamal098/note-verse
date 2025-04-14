import {useEffect, useMemo} from 'react';
import {debounce} from 'lodash';

function useDebounce(callback, delay = 300, options = {}) {
    const debouncedFn = useMemo(
        () => debounce(callback, delay, options),
        [callback, delay, options]
    );

    // Cleanup on unmounting or dependency change
    useEffect(() => {
        return () => {
            debouncedFn.cancel();
        };
    }, [debouncedFn]);

    return debouncedFn;
}

export default useDebounce;
