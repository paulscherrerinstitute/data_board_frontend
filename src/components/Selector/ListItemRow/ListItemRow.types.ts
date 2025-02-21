import { StoredChannel } from "../Selector.types";

export interface ListItemRowProps {
    index: number;
    style: React.CSSProperties;
    data: {
        items: StoredChannel[];
        onSelect: (seriesId: number) => void;
        onDeselect: (seriesId: number) => void;
        onDragStart: (event: React.DragEvent, seriesId: number) => void;
        isDraggable: boolean;
    };
}
