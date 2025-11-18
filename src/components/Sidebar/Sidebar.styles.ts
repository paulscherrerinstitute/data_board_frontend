import { SxProps, Theme } from "@mui/material";

export const sidebarStyle: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    height: "100vh",
    background: (theme) => theme.palette.custom.sidebar.background.primary,
    zIndex: 10,
    borderColor: (theme) => theme.palette.divider,
    borderRight: (theme) => `5px solid ${theme.palette.divider}`,
    "&:hover": {
        borderRight: (theme) => `5px solid ${theme.palette.secondary.dark}`, // Hover effect
    },
};

export const buttonContainerStyle: SxProps<Theme> = {
    position: "absolute",
    right: 2,
    width: "90px",
    top: "1vh",
    height: "7vh",
    minHeight: "57px",
    zIndex: 100,
    transform: "translateX(100%)",
    display: "flex",
    background: (theme) => theme.palette.custom.sidebar.background.primary,
    paddingLeft: "20px",
    borderRadius: 1,

    "@media (max-width:1000px)": {
        width: "10vw",
    },
};

export const toggleButtonStyle: SxProps<Theme> = {
    flex: 1,
    minWidth: "5%",
    width: "100%",
    margin: 0,
};

export const halfButtonStyle: SxProps<Theme> = {
    flex: 1,
    minWidth: 0,
    width: "100%",
    margin: 0,
};

export const buttonOptionsStyle: SxProps<Theme> = {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "start",
};

export const menuButtonStyle: SxProps<Theme> = {
    color: (theme) =>
        theme.palette.getContrastText(
            theme.palette.custom.sidebar.background.primary
        ),
    maxWidth: "100%",
};

export const selectorStyle = (
    sidebarWidth: number,
    windowWidth: number
): SxProps<Theme> => {
    return {
        display:
            sidebarWidth >= windowWidth * 0.1 && windowWidth >= 200
                ? "block"
                : "none",
        "@media (max-width: 1200px)": {
            height: "80%",
            overflowY: "scroll",
        },
        height: "100%",
    };
};

export const unauthenticatedMessageStyle: SxProps<Theme> = {
    color: "white",
    display: "flex",
    justifyContent: "center",
    marginTop: 50,
};
