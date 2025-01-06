export interface ListItemRowProps {
    index: number;
    style: React.CSSProperties;
    data: {
        items: string[];
        onSelect: (key: string) => void;
        onDeselect: (key: string) => void;
        selectedChannels: string[];
    };
}