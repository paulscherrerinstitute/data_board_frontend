import {
    Curve,
    CurveMeta,
    CurvePoints,
    StoredCurveData,
} from "../components/Content/PlotWidget/PlotWidget.types";

export function filterCurveAttribute<
    T extends CurveMeta["pointMeta"] | CurvePoints,
>(attribute: T, from: string, to: string): T {
    const filteredData = {} as T;
    if (Number.isInteger(+from) && Number.isInteger(+to)) {
        for (const [timestamp, data] of Object.entries(attribute)) {
            if (
                Number(timestamp) >= Number(from) &&
                Number(timestamp) <= Number(to)
            ) {
                filteredData[timestamp] = data;
            }
        }
    } else {
        for (const [timestamp, data] of Object.entries(attribute)) {
            if (timestamp >= from && timestamp <= to) {
                filteredData[timestamp] = data;
            }
        }
    }
    return filteredData;
}

/**
 * Filters curve data to only include points within the specified timerange
 */
export function filterCurveData(
    curveData: StoredCurveData,
    from: string,
    to: string
): StoredCurveData {
    const filteredCurve: StoredCurveData["curve"] = {
        value: filterCurveAttribute(curveData.curve.value, from, to),
        min: filterCurveAttribute(curveData.curve.min, from, to),
        max: filterCurveAttribute(curveData.curve.max, from, to),
        meta: {
            ...curveData.curve.meta,
            pointMeta: filterCurveAttribute(
                curveData.curve.meta.pointMeta,
                from,
                to
            ),
        },
    };

    return { curve: filteredCurve };
}

/**
 * Constructs a unique label for each channel based on its attributes.
 */
export const getLabelForChannelAttributes = (
    name: string,
    backend: string,
    type: string
) => {
    return `${name.split("|")[0].trim()} | ${backend} | ${type === "" ? "unknown" : type}`;
};

/**
 * Constructs a unique label for each curve based on it's channel attributes.
 */
export const getLabelForCurve = (curve: Curve) => {
    return getLabelForChannelAttributes(curve.name, curve.backend, curve.type);
};

/**
 * Creates a string representation of the date with millisecond precision, compatible with new Date() and Plotly.
 */
export const formatDateWithMs = (date: Date): string => {
    const pad = (n: number, l = 2) => String(n).padStart(l, "0");

    return (
        date.getFullYear() +
        "-" +
        pad(date.getMonth() + 1) +
        "-" +
        pad(date.getDate()) +
        " " +
        pad(date.getHours()) +
        ":" +
        pad(date.getMinutes()) +
        ":" +
        pad(date.getSeconds()) +
        "." +
        pad(date.getMilliseconds(), 3)
    );
};
