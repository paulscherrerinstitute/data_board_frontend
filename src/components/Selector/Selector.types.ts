export interface SelectorProps {
    setSidebarIsFocused: React.Dispatch<React.SetStateAction<boolean>>;
}

export type StoredChannel = {
    attributes: Channel;
    selected: boolean;
};

export type Channel = {
    backend: string;
    name: string;
    seriesId: string;
    source: string;
    type: string;
    shape: string | number[];
    unit: string;
    description: string;
};

export type AddChannelsToFirstPlotEvent = CustomEvent<{
    channels: Channel[];
}>;

export const ADD_CHANNELS_TO_FIRST_PLOT_EVENT = "add-channels-to-first-plot";
