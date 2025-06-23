import { Channel } from "../../Selector/Selector.types";
import { TimeValues } from "../TimeSelector/TimeSelector.types";
import { PlotSettings } from "./PlotSettingsPopup/PlotSettingsPopup.types";

export interface PlotWidgetProps {
    channels: Channel[];
    timeValues: TimeValues;
    index: string;
    initialPlotSettings?: PlotSettings;
    onChannelsChange: (updatedChannels: Channel[]) => void;
    onZoomTimeRangeChange: (startTime: number, endTime: number) => void;
    onUpdatePlotSettings: (
        index: string,
        newPlotSettings: PlotSettings
    ) => void;
}

export type PlotlyHTMLElement = Plotly.PlotlyHTMLElement &
    HTMLDivElement & {
        removeAllListeners(): void;
        _fullLayout: Plotly.Layout;
    };

export type CurvePoints = {
    [timestamp: string]: number;
};

export type CurveMeta = {
    raw: boolean;
    waveform: boolean;
    interval_avg: number | undefined;
    interval_stddev: number | undefined;
    pointMeta: {
        [timestamp: string]: {
            count?: number;
            pulseId?: number;
        };
    };
};

export type BackendCurveData = {
    curve: {
        [channelName: string]: CurvePoints | CurveMeta;
    };
};

export type StoredCurveData = {
    curve: {
        value: CurvePoints;
        min: CurvePoints;
        max: CurvePoints;
        meta: CurveMeta;
    };
};

export type Curve = {
    backend: string;
    type: string;
    shape: string | number[];
    name: string;
    curveData: StoredCurveData;
    isLoading: boolean;
    error: string | null;
};

export type ContainerDimensions = {
    height: number;
    width: number;
};

export const Y_AXIS_ASSIGNMENT_OPTIONS = ["y1", "y2", "y3", "y4"] as const;
export type YAxisAssignment = (typeof Y_AXIS_ASSIGNMENT_OPTIONS)[number];
export type AxisAssignment = YAxisAssignment | "x";

export const USED_Y_AXES = ["yaxis", "yaxis2", "yaxis3", "yaxis4"] as const;
export type UsedYAxis = (typeof USED_Y_AXES)[number];

export type CurveAttributes = {
    channel: Channel;
    color?: string;
    curveShape?: Plotly.PlotData["line.shape"];
    curveMode?: Plotly.PlotData["mode"];
    displayLabel: string;
    axisAssignment: AxisAssignment;
};

export type AxisLimit = number | null;

export type YAxisAttributes = {
    label: YAxisAssignment;
    scaling?: Plotly.AxisType;
    min: AxisLimit;
    max: AxisLimit;
    displayLabel: string;
    manualDisplayLabel: boolean;
};
