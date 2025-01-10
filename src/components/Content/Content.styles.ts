import { SxProps, Theme } from "@mui/material";

export const contentContainerStyles: SxProps<Theme> = {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "100%",
    overflowY: "auto",
    width: 0,
};

export const topBarStyles: SxProps<Theme> = {
    width: "100%",
    height: "10vh",
    display: "flex",
    justifyContent: "left",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderBottom: "1px solid #ccc",
    overflowX: "auto",
    overflowY: "hidden",
};

export const gridContainerStyles: SxProps<Theme> = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(max(280px, 40vw), 1fr))", // 20% screen width, auto-fill for responsive layout
    gap: "16px",
    width: "100%",
    padding: "16px",
    flexGrow: 1,
    overflowY: "auto",
    justifyItems: "center",
    placeItems: "center",
    height: 0,
};

export const gridItemStyles: SxProps<Theme> = {
    minWidth: "280px",
    width: "40vw",
    height: "40vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease",
    "&:hover": {
        transform: "scale(1.05)",
    },
};

export const CreateWidgetStyles: SxProps<Theme> = {
    ...gridItemStyles,
    position: "relative",
    "&::before": {
        content: '"+"',
        fontSize: "400px",
        color: "white",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
    },
}