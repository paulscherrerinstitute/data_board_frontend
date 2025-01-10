import { UUID } from "crypto";
import ReactGridLayout from "react-grid-layout";

export interface Channel {
    channelName: string;
    backend: string;
}

export interface Widget {
    channels: Channel[];
    layout: ReactGridLayout.Layout
}