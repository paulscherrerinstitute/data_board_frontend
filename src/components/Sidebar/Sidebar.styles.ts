import { SxProps, Theme } from "@mui/material";

export const sidebarStyles: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "primary.main",
    position: "relative",
    height: "100vh",
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
  display: "flex", // Ensure buttons are aligned horizontally
};

export const toggleButtonStyles: SxProps<Theme> = {
  flex: 1, // Take up all available space for a single button
  minWidth: "100%",
  width: "100%",
  margin: 0,
};

export const halfButtonStyle: SxProps<Theme> = {
  flex: 1, // Share space evenly between the two half buttons
  minWidth: 0,
  width: "100%",
  margin: 0,
};