import { createTheme, ThemeOptions } from "@mui/material";
import baseTheme from "./base";

export const darkTheme: ThemeOptions = createTheme({
    ...baseTheme,
    palette: {
        mode: "dark",
        primary: {
            main: "#1976d2",
        },
        secondary: {
            main: "#dc004e",
        },
        background: {
            default: "#121212",
            paper: "#1e1e1e",
        },
        text: {
            primary: "#ffffff",
            secondary: "#b0bec5",
        },
        custom: {
            sidebar: {
                text: "#ffffff",
                background: {
                    primary: "#000000",
                    secondary: "#353839",
                    tertiary: "#ffffff", // White for sidebar elements
                },
                results: {
                    primary: "rgba(80, 83, 85, 1)",
                    secondary: "rgba(62, 65, 66, 1)",
                },
            },
        },
    },
});

export default darkTheme;
