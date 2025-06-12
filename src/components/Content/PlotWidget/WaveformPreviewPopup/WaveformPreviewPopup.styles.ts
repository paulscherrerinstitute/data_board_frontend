import { SxProps, Theme } from "@mui/system";

export const dialogStyle: SxProps<Theme> = {
    "& .MuiDialog-paper": {
        width: "95vw",
        height: "95vh",
        borderRadius: "10px",
        padding: "10px",
    },
};

export const closeButtonStyle: SxProps<Theme> = {
    position: "absolute",
    right: 8,
    top: 8,
};
