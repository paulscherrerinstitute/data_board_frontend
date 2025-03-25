import { SxProps, Theme } from "@mui/system";

export const dialogStyle: SxProps<Theme> = {
    "& .MuiDialog-paper": {
        width: "95vw",
        height: "95vh",
        borderRadius: "10px",
        padding: "10px",
    },
};

export const closeButtonStyle: SxProps<Theme> = {
    position: "absolute",
    right: 8,
    top: 8,
};

export const settingBoxStyle: SxProps<Theme> = {
    width: "100%",
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
};

export const textFieldStyle: SxProps<Theme> = {
    flexGrow: 1,
};

export const tableContainerStyle: SxProps<Theme> = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
};

export const colorPickerStyle: SxProps<Theme> = {
    width: "50px",
};
