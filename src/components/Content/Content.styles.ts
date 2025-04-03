import { SxProps, Theme } from "@mui/material";
import Background from "../../media/plus.svg";

export const contentContainerStyle: SxProps<Theme> = {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "100%",
    overflowY: "auto",
    width: 0,
};

export const topBarStyle: SxProps<Theme> = {
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

export const gridContainerStyle: SxProps<Theme> = {
    width: "100%",
    height: "90vh",
    position: "absolute",
    left: "2.5vw",
    top: "10vh",
    display: "flex",
    flexDirection: "column",
    padding: "16px",
    overflowY: "auto",
};

export const gridItemStyle: SxProps<Theme> = {
    width: "max(40vw, 280px)",
    height: "40vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "8px",
    boxShadow: (theme) => `0 2px 4px ${theme.palette.divider}`,
    transition: "filter 0.3s ease",
    background: (theme) => theme.palette.background.paper,
    "&:hover": {
        backgroundColor: (theme) => theme.palette.action.hover,
    },
};

export const CreateWidgetStyle: SxProps<Theme> = {
    ...gridItemStyle,
    height: "5vh",
    minHeight: "5vh",
    width: "10vw",
    backgroundImage: `url("${Background}")`,
    backgroundSize: "contain",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
};

export const removeWidgetButtonStyle: SxProps<Theme> = {
    position: "absolute",
    top: 0,
    right: 0,
    color: "white",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    zIndex: 99999,
};

export const actionButtonBoxStyle: SxProps<Theme> = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "50px",
};
