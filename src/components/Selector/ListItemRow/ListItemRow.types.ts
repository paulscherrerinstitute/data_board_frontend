import { StoredChannel } from "../Selector.types";

export interface ListItemRowProps {
    index: number;
    style: React.CSSProperties;
    data: {
        items: StoredChannel[];
        onSelect: (key: string) => void;
        onDeselect: (key: string) => void;
        isDraggable: boolean;
    };
}
