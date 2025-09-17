import { SxProps, Theme } from "@mui/material";
import plusWhite from "../../media/plus_white.svg";
import plusBlack from "../../media/plus_black.svg";
import { InitialAdjustSidebarState } from "../Sidebar/Sidebar.types";
import { defaultAdjustSidebarState } from "../../helpers/defaults";

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
    minHeight: "80px",
    display: "flex",
    justifyContent: "left",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderBottom: "1px solid #ccc",
    overflowX: "auto",
    overflowY: "hidden",
};

export const getGridContainerStyle = (): SxProps<Theme> => {
    const initialSidebarAdjustState = JSON.parse(
        localStorage.getItem("initialSidebarAdjustState") ||
            JSON.stringify(defaultAdjustSidebarState)
    ) as InitialAdjustSidebarState;

    return {
        width: "100%",
        height: "calc(min(90vh, 100vh - 80px))",
        position:
            initialSidebarAdjustState == "overlap" ? "absolute" : "sticky",
        left: "2.5vw",
        top: "calc(max(10vh, 80px))",
        display: "flex",
        flexDirection: "column",
        padding: "16px",
        paddingTop: 0,
        paddingBottom: 0,
        overflowY: "auto",
    };
};

export const gridItemStyle: SxProps<Theme> = {
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

export const createWidgetStyle: SxProps<Theme> = {
    ...gridItemStyle,
    height: "100%",
    width: "10vw",
    backgroundImage: (theme) =>
        theme.palette.mode === "dark"
            ? `url("${plusWhite}")`
            : `url("${plusBlack}")`,
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

export const actionButtonBoxPlaceholderStyle: SxProps<Theme> = {
    height: "5vh",
    minHeight: "60px",
    width: "100%",
    alignSelf: "flex-end",
};

export const actionButtonBoxStyle: SxProps<Theme> = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    position: "fixed",
    bottom: 0,
    paddingBottom: "10px",
    left: "calc(max(30px, 2.5vw) + 20px)",
    right: 10,
    pointerEvents: "none",
    height: "5vh",
    minHeight: "60px",
};

export const actionButtonStyle: SxProps<Theme> = {
    height: "100%",
    pointerEvents: "all",
};
