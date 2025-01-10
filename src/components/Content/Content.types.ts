import { UUID } from "crypto";

export interface Channel {
    channelName: string;
    backend: string;
}

export interface Widget {
    key: string;
    channels: Channel[];
}