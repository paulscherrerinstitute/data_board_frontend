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
    ".modebar-btn path": {
        fill: (theme) =>
            theme.palette.mode === "dark"
                ? "#fff !important"
                : "#000 !important",
    },
    ".modebar-btn:hover path": {
        opacity: 0.8,
    },
    ".modebar-btn.active path": {
        opacity: 1,
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
