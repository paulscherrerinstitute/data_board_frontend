import { SxProps, Theme } from "@mui/material";

export const sidebarStyles: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    height: "100%",
    background: "#353839",
};

export const resizerStyles: SxProps<Theme> = {
    width: "5px",
    cursor: "ew-resize",
    position: "absolute",
    top: 0,
    right: 0,
    height: "100%",
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
};

export const buttonContainerStyle: SxProps<Theme> = {
    position: "absolute",
    right: 2,
    width: "90px",
    top: "1vh",
    height: "7vh",
    zIndex: 100,
    transform: "translateX(100%)",
    display: "flex",
    background: "#353839",
    paddingLeft: "20px",
    borderRadius: 1,
};

export const toggleButtonStyles: SxProps<Theme> = {
    flex: 1,
    minWidth: "100%",
    width: "100%",
    margin: 0,
};

export const halfButtonStyle: SxProps<Theme> = {
    flex: 1,
    minWidth: 0,
    width: "100%",
    margin: 0,
};
