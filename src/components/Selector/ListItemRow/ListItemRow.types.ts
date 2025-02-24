import { StoredChannel } from "../Selector.types";

export interface ListItemRowProps {
    index: number;
    style: React.CSSProperties;
    data: {
        items: StoredChannel[];
        onSelect: (seriesId: string) => void;
        onDeselect: (seriesId: string) => void;
        onDragStart: (event: React.DragEvent, seriesId: string) => void;
        isDraggable: boolean;
    };
}
