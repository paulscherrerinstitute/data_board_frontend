import { SxProps, Theme } from "@mui/material";

export const sidebarStyle: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    height: "100%",
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
    zIndex: 100,
    transform: "translateX(100%)",
    display: "flex",
    background: (theme) => theme.palette.custom.sidebar.background.primary,
    paddingLeft: "20px",
    borderRadius: 1,
};

export const toggleButtonStyle: SxProps<Theme> = {
    flex: 1,
    minWidth: "100%",
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
