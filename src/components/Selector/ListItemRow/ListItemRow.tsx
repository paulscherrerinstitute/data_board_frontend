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
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import * as styles from "./ListItemRow.styles";
import { ListItemRowProps } from "./ListItemRow.types";

const ListItemRow: React.FC<ListItemRowProps> = ({ index, style, data }) => {
    const { items, onSelect, onDeselect, onDragStart, isDraggable, theme } =
        data;
    const seriesId = items[index].attributes.seriesId;
    const isSelected = items[index].selected;
    const name = items[index].attributes.name;
    const type = items[index].attributes.type;
    const shape =
        Array.isArray(items[index].attributes.shape) &&
        items[index].attributes.shape.length === 1
            ? "[" + items[index].attributes.shape + "]"
            : undefined;
    const backend = items[index].attributes.backend;

    const primaryText = name;
    const secondaryText =
        `${backend} - ${type || "unknown"}` + (shape ? ` - ${shape}` : "");

    return (
        <ListItem
            style={{
                ...style,
                background:
                    index % 2 === 0
                        ? theme.palette.custom.sidebar.results.primary
                        : theme.palette.custom.sidebar.results.secondary,
            }}
            key={seriesId}
        >
            <Box sx={styles.boxStyle}>
                <ListItemButton
                    sx={styles.listItemButtonStyle}
                    onClick={() =>
                        isSelected ? onDeselect(seriesId) : onSelect(seriesId)
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
                        primary: {
                            style: { color: theme.palette.custom.sidebar.text },
                        },
                        secondary: {
                            style: { color: theme.palette.custom.sidebar.text },
                        },
                    }}
                    primary={primaryText}
                    secondary={secondaryText}
                />
                {isDraggable && (
                    <ListItemIcon
                        sx={styles.dragIconStyle}
                        draggable={true}
                        onDragStart={(e: React.DragEvent) =>
                            onDragStart(e, seriesId)
                        }
                    >
                        <DragIndicatorIcon />
                    </ListItemIcon>
                )}
            </Box>
        </ListItem>
    );
};

export default ListItemRow;
