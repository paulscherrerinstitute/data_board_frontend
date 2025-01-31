export type StoredChannel = {
    key: string;
    selected: boolean;
};

export type BackendChannel = {
    backend: string;
    name: string;
    seriesId: number;
    source: string;
    type: string;
    shape: string;
    unit: string;
    description: string;
};
