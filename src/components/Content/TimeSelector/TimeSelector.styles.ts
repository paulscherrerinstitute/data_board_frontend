import { SxProps, Theme } from "@mui/material";

export const timeSelectorContainerStyle: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 2,
    width: "100%",
    height: "100%",
    padding: "0px 16px 0px 100px",
    backgroundColor: (theme) => theme.palette.background.default,
    borderBottom: "1px solid #ccc",
    minWidth: "1035px",
};

export const timeFieldStyle: SxProps<Theme> = {
    flex: 3,
    display: "flex",
    flexDirection: "column",
    gap: 1,
};

export const quickSelectStyle: SxProps<Theme> = {
    flex: 2,
};

export const toggleContainerStyle: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    border: (theme) => `solid 1px ${theme.palette.divider}`,
    borderRadius: "4px",
    padding: "4px",
};

export const refreshButtonStyle: SxProps<Theme> = {
    flex: 1,
    height: "80%",
    maxHeight: "95%",
};

export const autoApplyProgressStyle: SxProps<Theme> = {
    marginTop: "8px",
    width: "100%",
};

export const autoApplyContainerStyle: SxProps<Theme> = {
    flexDirection: "column",
    display: "flex",
    gap: 1,
};

export const optionsButtonStyle: SxProps<Theme> = {
    border: "1px solid",
    borderColor: "divider",
};

export const overlayStyle: SxProps<Theme> = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    bgcolor: "rgba(0,0,0,0.5)",
    zIndex: 1300,
};

export const optionsContainerStyle: SxProps<Theme> = {
    position: "absolute",
    top: "10%",
    left: "50%",
    transform: "translateX(-50%)",
    bgcolor: "background.paper",
    p: 2,
    borderRadius: 2,
    boxShadow: 3,
    display: "flex",
    justifyContent: "space-between",
    maxWidth: 600,
    width: "90%",
    mx: "auto",
};

export const historyButtonBoxStyle: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1,
};
