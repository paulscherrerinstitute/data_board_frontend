import { Channel } from "../../Selector/Selector.types";
import { TimeValues } from "../Content.types";

export interface PlotWidgetProps {
    channels: Channel[];
    timeValues: TimeValues;
    index: string;
    onChannelsChange: (updatedChannels: Channel[]) => void;
    onZoomTimeRangeChange: (startTime: number, endTime: number) => void;
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
