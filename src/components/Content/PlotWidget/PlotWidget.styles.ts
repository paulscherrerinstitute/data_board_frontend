import { SxProps, Theme } from "@mui/material";

export const containerStyle: SxProps<Theme> = {
    display: "flex",
    flexDirection: "row",
    height: "100%",
    width: "100%",
};

export const plotContainerStyle: SxProps<Theme> = {
    height: "100%",
    width: "80%",
    ".modebar-container": {
        right: "30px !important",
    },
    ".gtitle-subtitle": {
        display: "none",
    },
};

export const legendStyle: SxProps<Theme> = {
    background: (theme) => theme.palette.custom.plot.legend.background,
    paddingTop: "30px",
    width: "20%",
    height: "100%",
    overflowY: "auto",
};

export const legendTitleStyle: SxProps<Theme> = {
    width: "100%",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: "10px",
    fontSize: "clamp(14px, 2vw, 24px)",
};
