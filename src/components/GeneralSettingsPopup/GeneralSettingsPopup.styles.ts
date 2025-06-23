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

export const colorPickerStyle: SxProps<Theme> = {
    width: "50px",
};

export const curveColorsBoxStyle: SxProps<Theme> = {
    width: "auto",
    display: "flex",
    gap: "10px",
    overflow: "auto",
};

export const ButtonBoxStyle: SxProps<Theme> = {
    display: "flex",
    justifyContent: "center",
    marginTop: "15px",
};

export const warningStyle: SxProps<Theme> = {
    color: "orange",
    marginTop: "8px",
    fontWeight: "bold",
};

export const errorStyle: SxProps<Theme> = {
    color: "red",
    marginTop: "8px",
    fontWeight: "bold",
};
