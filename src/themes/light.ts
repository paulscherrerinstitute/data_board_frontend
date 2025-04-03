import { createTheme, ThemeOptions } from "@mui/material";
import baseTheme from "./base";

export const lightTheme: ThemeOptions = createTheme({
    ...baseTheme,
    palette: {
        mode: "light",
        primary: {
            main: "#00bed8",
        },
        secondary: {
            main: "#f06292",
            dark: "#353839",
        },
        background: {
            default: "#ffffff",
            paper: "#e3f0ff",
        },
        text: {
            primary: "#414756",
            secondary: "#a5abbd",
        },
        custom: {
            sidebar: {
                text: "#000000",
                background: {
                    primary: "#f0f0f0",
                    secondary: "rgb(196, 198, 199)",
                    tertiary: "#ffffff",
                },
                results: {
                    primary: "rgba(255, 255, 255, 0.94)",
                    secondary: "rgb(196, 196, 196)",
                },
            },
        },
    },
});

export default lightTheme;
