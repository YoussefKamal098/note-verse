import {useEffect, useRef} from 'react';

/**
 * A custom React hook for managing single execution of asynchronous functions with
 * abort capabilities and execution state tracking
 *
 * @typedef {Object} SingleExecutionHook
 * @property {Function} executeOnce - Executes the provided async function once per component lifecycle
 * @property {boolean} isExecuting - Current execution state (true/false)
 * @property {Function} abort - Aborts any pending execution
 *
 * @returns {SingleExecutionHook} Object containing execution control methods and state
 *
 * @example
 * const { executeOnce, isExecuting, abort } = useSingleExecution();
 *
 * useEffect(() => {
 *   executeOnce(async (options) => {
 *     const data = await fetchData(options.signal);
 *     // Handle data
 *   });
 * }, []);
 */
const useSingleExecution = () => {
    /**
     * @type {import('react').MutableRefObject<boolean>}
     * Tracks component mount state to prevent state updates after unmounting
     */
    const isMounted = useRef(true);

    /**
     * @type {import('react').MutableRefObject<AbortController>}
     * AbortController instance for canceling pending operations
     */
    const abortController = useRef(new AbortController());

    /**
     * @type {import('react').MutableRefObject<boolean>}
     * Tracks current execution state to prevent concurrent executions
     */
    const isExecuting = useRef(false);

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            isMounted.current = false;
            abortController.current.abort();
        };
    }, []);

    /**
     * Executes an async function once per component lifecycle with abort control
     *
     * @template T
     * @param {(options: { signal: AbortSignal }) => Promise<T>} asyncFn - Async function to execute
     * @returns {Promise<T|null>} Promise resolving to asyncFn result or null if execution was blocked
     *
     * @example
     * executeOnce(async ({ signal }) => {
     *   const response = await fetch('/api/data', { signal });
     *   return response.json();
     * });
     */
    const executeOnce = async (asyncFn) => {
        if (!isMounted.current || isExecuting.current) return null;

        isExecuting.current = true;
        try {
            return await asyncFn({signal: abortController.current.signal});
        } finally {
            if (isMounted.current) {
                isExecuting.current = false;
            }
        }
    };

    return {
        executeOnce,
        /**
         * @type {boolean}
         * Current execution state (NOTE: this is a snapshot value that might
         * not update during the same render cycle due to ref nature)
         */
        isExecuting: isExecuting.current,
        /**
         * Aborts any pending execution and resets the abort controller
         * @returns {void}
         */
        abort: () => abortController.current.abort()
    };
};

export default useSingleExecution;
