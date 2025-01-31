import { SxProps, Theme } from "@mui/material";
import Background from "../../media/plus.svg";

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
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "16px",
    flexGrow: 1,
    overflowY: "auto",
};

export const gridItemStyles: SxProps<Theme> = {
    width: "max(40vw, 280px)",
    height: "40vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    transition: "filter 0.3s ease",
    background: "#e0e0e0",
    "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.1)",
    },
};

export const CreateWidgetStyles: SxProps<Theme> = {
    ...gridItemStyles,
    height: "5vh",
    minHeight: "5vh",
    width: "10vw",
    margin: "0 auto 0 auto",
    backgroundImage: `url(${Background})`,
    backgroundSize: "contain",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
};

export const removeWidgetButtonStyles: SxProps<Theme> = {
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
