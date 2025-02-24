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
    shape: string;
    unit: string;
    description: string;
};
