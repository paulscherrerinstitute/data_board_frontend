import { SxProps, Theme } from "@mui/material";

export const containerStyles: SxProps<Theme> = {
    display: "flex",
    flexDirection: "row",
    height: "100%",
    width: "100%",
};

export const plotContainerStyles: SxProps<Theme> = {
    height: "100%",
    width: "80%",
    ".modebar-container": {
        right: "30px !important",
    },
    ".gtitle-subtitle": {
        display: "none",
    },
};

export const legendStyles: SxProps<Theme> = {
    background: "#f4f4f4",
    paddingTop: "30px",
    width: "20%",
    height: "100%",
    overflowY: "auto",
};

export const legendTitleStyles: SxProps<Theme> = {
    width: "100%",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: "10px",
};

export const legendEntryStyles: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    background: "#eaeaea",
    borderRadius: "6px",
    padding: "8px 12px",
    margin: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    transition: "background 0.3s, box-shadow 0.3s",
    "&:hover": {
        background: "#d3d3d3",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
    },
};

export const statusSymbolStyle: SxProps<Theme> = {
    display: "flex",
    justifySelf: "center",
    alignSelf: "center",
};
