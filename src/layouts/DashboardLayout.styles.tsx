import { Theme } from "@emotion/react";
import { SxProps } from "@mui/system";

export const layoutWrapper: SxProps<Theme> = {
    "@media (orientation: portrait)": {
        display: "none"
    },
    "@media (orientation: landscape)": {
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
    }
}

export const turnPhoneMessageWrapper: SxProps<Theme> = {
    "@media (orientation: portrait)": {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingBlock: "80%",
    },
    "@media (orientation: landscape)": {
        display: "none"
    }
}
export const loginButtonWrapper: SxProps<Theme> = {
    display: "flex",
    marginInline: `auto`,
    alignItems: "center"
}

export const loginButton: SxProps<Theme> = {
    height: "50px"
}