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
    justifyContent: "center",
    border: "solid 1px #B8B8B8",
    borderRadius: "4px",
    padding: "4px",
};

export const refreshButtonStyle: SxProps<Theme> = {
    flex: 1,
    maxHeight: "95%",
};

export const autoApplyProgressStyle: SxProps<Theme> = {
    marginTop: "8px",
    width: "100%",
};

export const autoApplyContainerStyle: SxProps<Theme> = {
    flexDirection: "column",
    display: "flex",
    gap: 1,
};
