import React from "react";
import {
    ListItem,
    ListItemButton,
    ListItemIcon,
    Checkbox,
    ListItemText,
    Box,
    Tooltip,
} from "@mui/material";
import * as styles from "./ListItemRow.styles";
import { ListItemRowProps } from "./ListItemRow.types";

const ListItemRow: React.FC<ListItemRowProps> = ({ index, style, data }) => {
    const { items, onSelect, onDeselect, onDragStart, isDraggable } = data;
    const key = items[index].key;
    const isSelected = items[index].selected;
    const [backend, name, type] = key.split("|");

    return (
        <ListItem
            style={{
                ...style,
                background: index % 2 === 0 ? "#505355" : "#3E4142",
            }}
            key={key}
            {...(isDraggable
                ? {
                      draggable: true,
                      onDragStart: (e: React.DragEvent) => onDragStart(e, key),
                  }
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
                        <Tooltip
                            title="Select multiple channels and drag them all at once!"
                            arrow
                        >
                            <Checkbox
                                checked={isSelected}
                                sx={styles.checkboxStyle}
                            />
                        </Tooltip>
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
