import { describe, it, expect } from "vitest";
import {
    pearsonCoefficient,
    spearmanCoefficient,
} from "./correlationCoefficients";

describe("pearsonCoefficient", () => {
    it("returns 1 for perfectly positive linear correlation", () => {
        const x = [1, 2, 3, 4, 5];
        const y = [2, 4, 6, 8, 10];
        const result = pearsonCoefficient(x, y);
        expect(result).toBeCloseTo(1, 5);
    });

    it("returns -1 for perfectly negative linear correlation", () => {
        const x = [1, 2, 3, 4, 5];
        const y = [10, 8, 6, 4, 2];
        const result = pearsonCoefficient(x, y);
        expect(result).toBeCloseTo(-1, 5);
    });

    it("returns ~0 for no correlation", () => {
        const x = [1, 2, 3, 4, 5];
        const y = [7, 6, 7, 6, 7];
        const result = pearsonCoefficient(x, y);
        expect(result).toBeCloseTo(0, 1);
    });
});

describe("spearmanCoefficient", () => {
    it("returns 1 for perfect monotonic increasing relationship", () => {
        const x = [10, 20, 30, 40, 50];
        const y = [1, 2, 3, 4, 5];
        const result = spearmanCoefficient(x, y);
        expect(result).toBeCloseTo(1, 5);
    });

    it("returns -1 for perfect monotonic decreasing relationship", () => {
        const x = [1, 2, 3, 4, 5];
        const y = [5, 4, 3, 2, 1];
        const result = spearmanCoefficient(x, y);
        expect(result).toBeCloseTo(-1, 5);
    });

    it("throws if arrays are not same length", () => {
        expect(() => spearmanCoefficient([1, 2], [1])).toThrow();
    });
});
