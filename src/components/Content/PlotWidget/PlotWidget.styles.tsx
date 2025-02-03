import { SxProps, Theme } from "@mui/material";

export const containerStyles: SxProps<Theme> = {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    ".modebar-container": {
        right: "30px !important",
    },
    ".gtitle-subtitle": {
        display: "none",
    },
};
