/**
 * Removes all attributes that are undefined from an object.
 * Recursively goes over all entries, only keeping the ones that aren't undefined.
 */
export function stripUndefined<T>(input: T): T {
    if (Array.isArray(input)) {
        return input.map((item) => stripUndefined(item)) as T;
    } else if (input && typeof input === "object") {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(input)) {
            if (value !== undefined) {
                result[key] = stripUndefined(value as unknown);
            }
        }
        return result as T;
    } else {
        return input;
    }
}
