import { Theme } from "@mui/material";
import { StoredChannel } from "../Selector.types";

export interface ListItemRowProps {
        filteredChannels: StoredChannel[];
        theme: Theme;
        handleSelectChannel: (seriesId: string) => void;
        handleDeselectChannel: (seriesId: string) => void;
        handleDragStart: (event: React.DragEvent, seriesId: string) => void;
}
