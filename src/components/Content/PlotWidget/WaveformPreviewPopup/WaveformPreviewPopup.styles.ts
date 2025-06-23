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

export const colorBarContainerStyle: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
    width: 60,
};

export const colorBarLimitsContainerStyle: SxProps<Theme> = {
    width: "100%",
    textAlign: "center",
};
