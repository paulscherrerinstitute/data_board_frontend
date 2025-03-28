import { useState, useEffect } from "react";

/**
 * useLocalStorage hook
 *
 * A custom React hook to synchronize state with localStorage.
 *
 * It stores a value (like a string or number) in localStorage and dispatches a
 * custom event ("localStorageUpdate") so that multiple hook instances using
 * the same key remain in sync, even within the same tab.
 *
 * @template T - The type of the value being stored (e.g., string, number).
 * @param key - The localStorage key.
 * @param initialValue - The initial value to use if the key is not found in localStorage.
 * @param readOnly - If true, the value is only read from localStorage and updates
 *                   will only apply to the local state. However, any changes made
 *                   externally in localStorage will overwrite the local state.
 * @returns A stateful value and a setter function that updates both state and localStorage.
 */
export const useLocalStorage = <T>(
    key: string,
    initialValue?: T,
    readOnly: boolean = false
): [T, React.Dispatch<React.SetStateAction<T>>] => {
    // Retrieve and parse the stored value, or use the initial value if not present.
    const storedValue = localStorage.getItem(key);
    let parsedValue: T;
    if (storedValue !== null) {
        parsedValue = JSON.parse(storedValue);
    } else {
        parsedValue = initialValue as T;

        if (initialValue !== undefined && !readOnly) {
            // Store the initialValue in localStorage if it doesn't exist
            localStorage.setItem(key, JSON.stringify(initialValue));
        }
    }

    const [value, setValue] = useState<T>(parsedValue);

    // Custom setter that updates state, localStorage, and dispatches a custom event.
    const setValueWithStorage: React.Dispatch<React.SetStateAction<T>> = (
        newValue
    ) => {
        setValue(newValue);
        if (!readOnly) {
            localStorage.setItem(key, JSON.stringify(newValue));
            // Dispatch a custom event so other hook instances in the same tab update.
            window.dispatchEvent(
                new CustomEvent("localStorageUpdate", {
                    detail: { key, newValue },
                })
            );
        }
    };

    useEffect(() => {
        // Update state when localStorage is modified externally (e.g. in Dev Tools) or via our custom event.
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === key) {
                const newValue = event.newValue
                    ? JSON.parse(event.newValue)
                    : initialValue;
                setValue(newValue);
            }
        };

        const handleCustomUpdate = (event: Event) => {
            const customEvent = event as CustomEvent<{
                key: string;
                newValue: T;
            }>;
            if (customEvent.detail.key === key) {
                setValue(customEvent.detail.newValue);
            }
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("localStorageUpdate", handleCustomUpdate);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener(
                "localStorageUpdate",
                handleCustomUpdate
            );
        };
    }, [key, initialValue]);

    return [value, setValueWithStorage];
};
