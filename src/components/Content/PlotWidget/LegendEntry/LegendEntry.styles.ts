import { SxProps, Theme } from "@mui/material";

export const legendEntryStyle: SxProps<Theme> = {
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

export const dragIconStyle: SxProps<Theme> = {
    cursor: "grab",
    display: "flex",
    justifySelf: "center",
    alignSelf: "center",
};

export const interactiveLegendElementsStyle: SxProps<Theme> = {
    display: "flex",
};
