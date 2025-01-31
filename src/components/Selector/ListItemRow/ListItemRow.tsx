import React from "react";
import {
    ListItem,
    ListItemButton,
    ListItemIcon,
    Checkbox,
    ListItemText,
    Box,
} from "@mui/material";
import * as styles from "./ListItemRow.styles";
import { ListItemRowProps } from "./ListItemRow.types";
import { Channel } from "../../Content/Content.types";

const ListItemRow: React.FC<ListItemRowProps> = ({ index, style, data }) => {
    const { items, onSelect, onDeselect, isDraggable } = data;
    const key = items[index].key;
    const isSelected = items[index].selected;
    const [backend, name, type] = key.split("|");

    const handleDragStart = (event: React.DragEvent) => {
        const channel: Channel = { channelName: name, backend, datatype: type };
        event.dataTransfer.setData("text", JSON.stringify(channel));

        const dragPreview = document.createElement("div");
        dragPreview.style.cssText = `
            display: flex; align-items: center; padding: 10px; width: 300px; 
            background: #333; border-radius: 5px; color: white; font-weight: bold;
        `;
        dragPreview.innerText = `${name} (${backend} - ${type})`;

        document.body.appendChild(dragPreview);
        event.dataTransfer.setDragImage(dragPreview, 0, 0);
        setTimeout(() => dragPreview.remove(), 0);
    };

    return (
        <ListItem
            style={style}
            key={key}
            disablePadding
            {...(isDraggable
                ? { draggable: true, onDragStart: handleDragStart }
                : {})}
        >
            <Box sx={styles.boxStyle}>
                <ListItemButton
                    sx={styles.listItemButtonStyle}
                    onClick={() =>
                        isSelected ? onDeselect(key) : onSelect(key)
                    }
                >
                    <ListItemIcon>
                        <Checkbox
                            checked={isSelected}
                            sx={styles.checkboxStyle}
                        />
                    </ListItemIcon>
                </ListItemButton>
                <ListItemText
                    sx={styles.listItemTextStyle}
                    slotProps={{
                        primary: { style: { color: "white" } },
                        secondary: { style: { color: "#eee" } },
                    }}
                    primary={name}
                    secondary={`${backend} - ${type}`}
                />
            </Box>
        </ListItem>
    );
};

export default ListItemRow;
