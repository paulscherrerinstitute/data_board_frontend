import {
    Curve,
    CurveMeta,
    CurvePoints,
    StoredCurveData,
} from "../components/Content/PlotWidget/PlotWidget.types";

const timezoneOffsetMs = new Date().getTimezoneOffset() * -60000;

function filterCurveAttribute<T extends CurveMeta["pointMeta"] | CurvePoints>(
    attribute: T,
    from: string,
    to: string
): T {
    const filteredData = {} as T;
    for (const [timestamp, data] of Object.entries(attribute)) {
        if (timestamp >= from && timestamp <= to) {
            (filteredData as any)[timestamp] = data;
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
 * Constructs a unique label for each channel based on it's attributes.
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
 * Converts a unix timestamp (integer, formatted as string, e.g. "1234") to it's ISO representation, but in local time. Used to trick plotly into displaying local time, as it only accepts UTC time.
 * Converted timestamps therefore look like UTC-Timestamps, but are actually in local time.
 */
export const convertUnixToLocalISO = (timestamp: string) => {
    return new Date(Number(timestamp) / 1e6 + timezoneOffsetMs).toISOString();
};

/**
 * Converts a local timestap written in UTC-Format back to the correct unix timestamp as an integer..
 */
export const convertLocalISOToUnix = (timestamp: string) => {
    return new Date(timestamp).getTime() - timezoneOffsetMs;
};
