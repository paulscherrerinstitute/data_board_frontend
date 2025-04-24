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
