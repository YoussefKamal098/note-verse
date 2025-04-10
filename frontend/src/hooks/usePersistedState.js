import {useState} from "react";

const usePersistedState = (key, init = null) => {
    const [storedValue, setStoredValue] = useState(() => {
        let item = localStorage.getItem(key);

        if (!item) {
            return init;
        }

        try {
            return JSON.parse(item);
        } catch (err) {
            return item;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
};

const clearAllPersistedData = () => {
    localStorage.clear();
};

export default usePersistedState;
export {clearAllPersistedData};
