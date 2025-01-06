import React from "react";
import {
    ListItem,
    ListItemButton,
    ListItemIcon,
    Checkbox,
    ListItemText,
    Box
} from "@mui/material";
import * as styles from "./ListItemRow.styles";
import { ListItemRowProps } from "./ListItemRow.types";

const ListItemRow: React.FC<ListItemRowProps> = ({ index, style, data }) => {
    const { items, onSelect, onDeselect, selectedChannels } = data;
    const key = items[index];
    const isSelected = selectedChannels.includes(key);
    const [backend, name, , type] = key.split("|");

    return (
        <ListItem style={style} key={key} disablePadding>
            <Box sx={styles.boxStyle}>
            <ListItemButton sx={styles.listItemButtonStyle}
                onClick={() => (isSelected ? onDeselect(key) : onSelect(key))}
            >
                <ListItemIcon>
                    <Checkbox checked={isSelected} sx={styles.checkboxStyle} />
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
