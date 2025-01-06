import { SxProps, Theme } from "@mui/material";

export const sidebarStyles: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "primary.main",
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
    top: "10px",
    right: "-20px",
    width: "60px",
    zIndex: 1,
    transform: "translateX(100%)",
    display: "flex",
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

export const selectorStyle = (
    parentObjectWidth: number,
    windowWidth: number
): SxProps<Theme> => ({
    display:
        parentObjectWidth >= windowWidth * 0.1 && parentObjectWidth >= 200
            ? "block"
            : "none",
});
