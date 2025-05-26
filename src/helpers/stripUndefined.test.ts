import { describe, it, expect } from "vitest";
import { stripUndefined } from "./stripUndefined";

describe("stripUndefined", () => {
    it("removes top-level undefined fields", () => {
        const input = { a: 1, b: undefined, c: "hello" };
        const expected = { a: 1, c: "hello" };
        expect(stripUndefined(input)).toEqual(expected);
    });

    it("recursively removes undefined in nested objects", () => {
        const input = {
            a: 1,
            b: undefined,
            c: {
                d: 2,
                e: undefined,
                f: {
                    g: undefined,
                    h: 3,
                },
            },
        };
        const expected = {
            a: 1,
            c: {
                d: 2,
                f: {
                    h: 3,
                },
            },
        };
        expect(stripUndefined(input)).toEqual(expected);
    });

    it("handles arrays with nested undefineds", () => {
        const input = [
            { a: 1, b: undefined },
            { c: undefined, d: 4 },
            undefined,
        ];
        const expected = [{ a: 1 }, { d: 4 }, undefined];
        expect(stripUndefined(input)).toEqual(expected);
    });

    it("returns primitives unchanged", () => {
        expect(stripUndefined(42)).toBe(42);
        expect(stripUndefined("test")).toBe("test");
        expect(stripUndefined(null)).toBe(null);
    });

    it("returns undefined input as-is", () => {
        expect(stripUndefined(undefined)).toBe(undefined);
    });

    it("returns empty object when all properties are undefined", () => {
        const input = { a: undefined, b: undefined };
        expect(stripUndefined(input)).toEqual({});
    });

    it("returns empty array if all elements are undefined", () => {
        const input = [undefined, undefined];
        const expected = [undefined, undefined];
        expect(stripUndefined(input)).toEqual(expected);
    });
});
