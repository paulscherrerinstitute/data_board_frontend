import { SxProps, Theme } from "@mui/material";

export const timeSelectorContainerStyle: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 2,
    width: "100%",
    height: "100%",
    padding: "0px 16px 0px 100px",
    backgroundColor: "#f0f0f0",
    borderBottom: "1px solid #ccc",
    minWidth: "1035px",
};

export const timeFieldStyle: SxProps<Theme> = {
    flex: 3,
    display: "flex",
    flexDirection: "column",
    gap: 1,
};

export const quickSelectStyle: SxProps<Theme> = {
    flex: 2,
};

export const toggleContainerStyle: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
};

export const refreshButtonStyle: SxProps<Theme> = {
    flex: 1,
    maxHeight: "95%",
};
