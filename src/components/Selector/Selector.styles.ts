import { SxProps, Theme } from "@mui/system";

export const containerStyle: SxProps<Theme> = {
    padding: 2,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#353839",
};

export const textFieldStyle: SxProps<Theme> = {
    marginBottom: 2,
    '& label, & input, & p': {
        color: "#fff"
    },
};

export const buttonStyle: SxProps<Theme> = {
    marginBottom: 2,
    color: "white",
};

export const listBoxStyle: SxProps<Theme> = {
    width: "100%",
    flexGrow: 1,
    marginBottom: 2,
};

export const typographyHeaderStyle: SxProps<Theme> = {
    variant: "h6",
    color: "white",
};

export const typographyTitleStyle: SxProps<Theme> = {
    variant: "h4",
    color: "white",
};

export const filterBoxStyle: SxProps<Theme> = {
    width: "100%",
    flexGrow: 1,
    overflow: "auto",
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
    margin: 0
};

export const filterDropdownStyle: SxProps<Theme> = {
    width: "100%",
    backgroundColor: "#f4f4f4",
    color: "#000",
    div: {
        padding: 0.7
    }

};

export const menuItemStyle: SxProps<Theme> = {
    width: "100%",
    backgroundColor: "#f4f4f4",
    color: "#000"
};

export const statusSymbolStyle: SxProps<Theme> = {
    display: "flex",
    justifySelf: "center",
    alignSelf: "center"
};
