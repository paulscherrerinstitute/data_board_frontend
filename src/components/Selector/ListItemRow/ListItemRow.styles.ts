import { SxProps, Theme } from "@mui/system";

export const checkboxStyle: SxProps<Theme> = {
    "&.MuiCheckbox-root": {
        color: "black",
        background: "white",
        borderRadius: 0,
        padding: 0,
    },
    ".MuiSvgIcon-root": {
        border: 0,
        padding: 0,
        margin: -0.3 - 0.3,
    },
};

export const listItemTextStyle: SxProps<Theme> = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    userSelect: "text",
    alignSelf: "left",
    justifySelf: "left",
};

export const boxStyle: SxProps<Theme> = {
    display: "flex",
    width: "100%",
};

export const listItemButtonStyle: SxProps<Theme> = {
    width: "10px",
    paddingRight: 5,
    flexShrink: 1,
    maxWidth: 10,
};
