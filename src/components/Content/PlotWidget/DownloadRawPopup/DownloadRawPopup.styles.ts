import { SxProps, Theme } from "@mui/material";

export const overlayStyle: SxProps<Theme> = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
};

export const popupStyle: SxProps<Theme> = {
    backgroundColor: "background.paper",
    padding: 4,
    borderRadius: 2,
    width: 600,
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: 3,
};

export const titleStyle: SxProps<Theme> = {
    marginBottom: 2,
    fontSize: "1.5rem",
    fontWeight: "bold",
};

export const linkListStyle: SxProps<Theme> = {
    listStyle: "none",
    padding: 0,
    marginBottom: 2,
};

export const linkItemStyle: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 2,
    marginBottom: 1.5,
};

export const channelNameStyle: SxProps<Theme> = {
    flex: 1,
    fontWeight: 500,
};

export const buttonStyle: SxProps<Theme> = {
    padding: "6px 12px",
    backgroundColor: "primary.main",
    color: "white",
    borderRadius: 1,
    "&:disabled": {
        backgroundColor: "grey.500",
        cursor: "not-allowed",
    },
};

export const closeButtonStyle: SxProps<Theme> = {
    marginTop: 2,
    padding: "6px 12px",
    backgroundColor: "error.main",
    color: "white",
    borderRadius: 1,
};
