import { Channel, TimeValues } from "../Content.types";

export interface PlotWidgetProps {
    channels: Channel[];
    timeValues: TimeValues;
    index: string;
    onChannelsChange: (updatedChannels: Channel[]) => void;
}

export type CurveData = {
    curve: {
        [channel: string]: {
            [timestamp: string]: number | string;
        };
    };
};

export type Curve = {
    backend: string;
    curveData: CurveData;
};

export type ContainerDimensions = {
    height: number;
    width: number;
};

export type ZoomState = {
    xaxisRange: undefined | [number, number];
    yaxisRange: undefined | [number, number];
};
