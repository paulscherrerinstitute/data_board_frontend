import { describe, it, expect } from "vitest";
import {
    filterCurveData,
    getLabelForChannelAttributes,
    getLabelForCurve,
    convertUnixToLocalISO,
    convertLocalISOToUnix,
} from "./curveDataTransformations";
import {
    Curve,
    StoredCurveData,
} from "../components/Content/PlotWidget/PlotWidget.types";

describe("filterCurveData", () => {
    const sampleDataIsoString = {
        curve: {
            value: {
                "2023-01-01T00:00:00Z": 1,
                "2023-01-01T00:00:02Z": 2,
            },
            min: {
                "2023-01-01T00:00:00Z": 0,
                "2023-01-01T00:00:02Z": 1,
            },
            max: {
                "2023-01-01T00:00:00Z": 2,
                "2023-01-01T00:00:02Z": 3,
            },
            meta: {
                pointMeta: {
                    "2023-01-01T00:00:00Z": { a: 1 },
                    "2023-01-01T00:00:02Z": { a: 2 },
                },
            },
        },
    } as unknown as StoredCurveData;

    const sampleDataNumeric = {
        curve: {
            value: { "1000": 1, "2000": 2, "22000": 999 },
            min: { "1000": 0, "2000": 1, "22000": 998 },
            max: { "1000": 2, "2000": 3, "22000": 1000 },
            meta: {
                pointMeta: {
                    "1000": { a: 1 },
                    "2000": { a: 2 },
                    "22000": { a: 999 },
                },
            },
        },
    } as unknown as StoredCurveData;

    it("filters data within ISO timestamp range", () => {
        const result = filterCurveData(
            sampleDataIsoString,
            "2023-01-01T00:00:01Z",
            "2023-01-01T00:00:02Z"
        );
        expect(result.curve.value).toEqual({ "2023-01-01T00:00:02Z": 2 });
        expect(result.curve.min).toEqual({ "2023-01-01T00:00:02Z": 1 });
        expect(result.curve.max).toEqual({ "2023-01-01T00:00:02Z": 3 });
        expect(result.curve.meta.pointMeta).toEqual({
            "2023-01-01T00:00:02Z": { a: 2 },
        });
    });

    it("filters data within numeric range", () => {
        const result = filterCurveData(sampleDataNumeric, "1500", "2500");
        expect(result.curve.value).toEqual({ "2000": 2 });
        expect(result.curve.min).toEqual({ "2000": 1 });
        expect(result.curve.max).toEqual({ "2000": 3 });
        expect(result.curve.meta.pointMeta).toEqual({ "2000": { a: 2 } });
    });

    it("returns empty if nothing in range", () => {
        const result = filterCurveData(sampleDataNumeric, "3000", "4000");
        expect(result.curve.value).toEqual({});
    });
});

describe("getLabelForChannelAttributes", () => {
    it("formats label correctly", () => {
        expect(getLabelForChannelAttributes("foo | bar", "b", "c")).toBe(
            "foo | b | c"
        );
    });

    it("handles empty type", () => {
        expect(getLabelForChannelAttributes("x", "y", "")).toBe(
            "x | y | unknown"
        );
    });
});

describe("getLabelForCurve", () => {
    it("delegates to getLabelForChannelAttributes", () => {
        const curve = {
            name: "x | y",
            backend: "z",
            type: "",
        } as unknown as Curve;
        expect(getLabelForCurve(curve)).toBe("x | z | unknown");
    });
});

describe("timestamp conversions", () => {
    it("converts unix to local ISO and back", () => {
        const original = Date.now();
        const iso = convertUnixToLocalISO(original);
        const reverted = convertLocalISOToUnix(iso);
        expect(reverted).toBe(original);
    });
});
