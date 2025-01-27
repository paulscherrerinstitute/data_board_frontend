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
    const { items, onSelect, onDeselect, selectedChannels, isDraggable } = data;
    const key = items[index];
    const isSelected = selectedChannels.includes(key);
    const [backend, name, , type] = key.split("|");

    const handleDragStart = (event: React.DragEvent) => {
        const channel: Channel = { channelName: name, backend };
        event.dataTransfer.setData("text", JSON.stringify(channel));

        // Create a visual drag preview element
        const dragPreview = document.createElement("div");
        dragPreview.style.position = "absolute"; // Prevent layout shifts
        dragPreview.style.zIndex = "9999"; // Make sure it appears above everything

        const previewContainer = document.createElement("div");
        previewContainer.innerHTML = `
            <div style="display: flex; align-items: center; padding: 10px; background: #333; border-radius: 5px;">
                <div style="margin-right: 8px; color: white;">✔</div>
                <div>
                    <div style="color: white; font-weight: bold;">${name}</div>
                    <div style="color: #eee; font-size: 0.8em;">${backend}</div>
                </div>
            </div>
        `;
        dragPreview.appendChild(previewContainer);

        document.body.appendChild(dragPreview);
        event.dataTransfer.setDragImage(dragPreview, 0, 0);
        setTimeout(() => document.body.removeChild(dragPreview), 0);
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
                    primaryTypographyProps={{ style: { color: "white" } }}
                    secondaryTypographyProps={{ style: { color: "#eee" } }}
                    primary={name}
                    secondary={`${backend} - ${type}`}
                />
            </Box>
        </ListItem>
    );
};

export default ListItemRow;
