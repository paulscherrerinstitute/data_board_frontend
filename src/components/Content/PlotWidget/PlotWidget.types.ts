import { Channel } from "../../Selector/Selector.types";
import { TimeValues } from "../Content.types";
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

export type CurveData = {
    curve: {
        [channel: string]: {
            [timestamp: string]: number;
        };
    };
};

export type Curve = {
    backend: string;
    type: string;
    curveData: CurveData;
    isLoading: boolean;
    error: string | null;
};

export type ContainerDimensions = {
    height: number;
    width: number;
};

export type YAxisAssignment = "y1" | "y2" | "y3" | "y4";
export type AxisAssignment = YAxisAssignment | "x";

export type CurveAttributes = {
    channel: Channel;
    color: string;
    curveShape: Plotly.PlotData["line.shape"];
    curveMode: Plotly.PlotData["mode"];
    displayLabel: string;
    axisAssignment: AxisAssignment;
};

export type AxisLimit = number | null;

export type YAxisAttributes = {
    label: YAxisAssignment;
    scaling: Plotly.AxisType;
    min: AxisLimit;
    max: AxisLimit;
    displayLabel: string;
    manualDisplayLabel: boolean;
};
