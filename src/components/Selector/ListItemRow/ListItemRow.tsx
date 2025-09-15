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
import { RowComponentProps } from "react-window";

export default function ListItemRowComponent({
    index,
    style,
    filteredChannels,
    theme,
    handleSelectChannel,
    handleDeselectChannel,
    handleDragStart,
}: RowComponentProps<ListItemRowProps>) {
    const seriesId = filteredChannels[index].attributes.seriesId;
    const name = filteredChannels[index].attributes.name;
    const type = filteredChannels[index].attributes.type;
    const isSelected = filteredChannels[index].selected;
    const shape =
        Array.isArray(filteredChannels[index].attributes.shape) &&
        filteredChannels[index].attributes.shape.length === 1
            ? "[" + filteredChannels[index].attributes.shape + "]"
            : undefined;
    const backend = filteredChannels[index].attributes.backend;
    const primaryText = name;
    const secondaryText =
        `${backend} - ${type || "unknown"}` + (shape ? ` - ${shape}` : "");
    const isDraggable = true;

    return (
        <ListItem
            style={{
                ...style,
                background:
                    index % 2 === 0
                        ? theme.palette.custom.sidebar.results.primary
                        : theme.palette.custom.sidebar.results.secondary,
            }}
            role="listitem"
            key={seriesId}
        >
            <Box sx={styles.boxStyle}>
                <ListItemButton
                    sx={styles.listItemButtonStyle}
                    onClick={() =>
                        isSelected
                            ? handleDeselectChannel(seriesId)
                            : handleSelectChannel(seriesId)
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
                            style: {
                                color: theme.palette.custom.sidebar.text,
                            },
                        },
                        secondary: {
                            style: {
                                color: theme.palette.custom.sidebar.text,
                            },
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
                            handleDragStart(e, seriesId)
                        }
                    >
                        <DragIndicatorIcon />
                    </ListItemIcon>
                )}
            </Box>
        </ListItem>
    );
}
