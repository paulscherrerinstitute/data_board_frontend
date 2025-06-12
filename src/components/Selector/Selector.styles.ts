import { SxProps, Theme } from "@mui/system";

export const containerStyle: SxProps<Theme> = {
    padding: 2,
    paddingTop: 0,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: (theme) => theme.palette.custom.sidebar.background.primary,
};

export const textFieldStyle: SxProps<Theme> = {
    marginBottom: 2,
    "& label, & input, & p": {
        color: (theme) => theme.palette.custom.sidebar.text,
    },
};

export const searchBoxStyle: SxProps<Theme> = {
    marginTop: 1,
    marginBottom: 2,
    "& .MuiInputBase-root": {
        backgroundColor: (theme) =>
            theme.palette.custom.sidebar.background.tertiary,
    },
    "& .MuiInputLabel-root": {
        color: (theme) => theme.palette.text.primary,
    },
    "& .MuiFormHelperText-root": {
        color: (theme) => theme.palette.custom.sidebar.text,
    },
};

export const buttonStyle: SxProps<Theme> = {
    marginBottom: 2,
};

export const listBoxStyle: SxProps<Theme> = {
    width: "100%",
    flexGrow: 1,
    marginBottom: 2,
    display: "flex",
    flexDirection: "column",
    height: "100%",
};

export const typographyHeaderStyle: SxProps<Theme> = {
    variant: "h6",
    color: (theme) => theme.palette.custom.sidebar.text,
};

export const typographyTitleStyle: SxProps<Theme> = {
    variant: "h4",
    color: (theme) => theme.palette.custom.sidebar.text,
};

export const filterBoxStyle: SxProps<Theme> = {
    width: "100%",
    flexGrow: 1,
    marginBottom: 2,
};

export const dropwDownBoxStyle: SxProps<Theme> = {
    width: "100%",
    flexGrow: 1,
    overflow: "auto",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: 0,
    margin: 0,
};

export const filterDropdownStyle: SxProps<Theme> = {
    width: "100%",
    backgroundColor: (theme) => theme.palette.background.default,
    color: (theme) => theme.palette.text.primary,
    div: {
        padding: 0.7,
    },
};

export const menuItemStyle: SxProps<Theme> = {
    width: "100%",
    backgroundColor: (theme) => theme.palette.background.default,
    color: (theme) => theme.palette.text.primary,
};

export const statusSymbolStyle: SxProps<Theme> = {
    display: "flex",
    justifySelf: "center",
    alignSelf: "center",
};

export const selectAllStyle: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    color: (theme) => theme.palette.custom.sidebar.text,
    padding: 1,
};

export const selectedOptionsStyle: SxProps<Theme> = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 1,
    color: (theme) => theme.palette.custom.sidebar.text,
    padding: 1,
};

export const checkboxStyle: SxProps<Theme> = {
    "&.MuiCheckbox-root": {
        color: (theme) => theme.palette.text.primary,
        background: (theme) => theme.palette.background.paper,
        borderRadius: 0,
        padding: 0,
    },
    ".MuiSvgIcon-root": {
        padding: 0,
        margin: -0.3 - 0.3,
    },
};

export const autoSizerBoxStyle: SxProps<Theme> = {
    flex: 1,
    minHeight: 0,
    width: "100%",
};
