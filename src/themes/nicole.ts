import { ThemeOptions, createTheme } from "@mui/material";
import baseTheme from "./base";

export const nicoleTheme: ThemeOptions = createTheme({
    ...baseTheme,
    palette: {
        mode: "light",
        primary: {
            main: "#f06292", // Light pink
            dark: "#f8bbd0", // Softer pink
        },
        secondary: {
            main: "#f8bbd0", // Softer pink
        },
        background: {
            default: "#fce4ec", // Very light pink
            paper: "#f8bbd0", // Softer pink
        },
        text: {
            primary: "#880e4f", // Dark pink
            secondary: "#ad1457", // Medium pink
        },
        custom: {
            sidebar: {
                text: "#880e4f", // Dark pink
                background: {
                    primary: "#f8bbd0", // Softer pink
                    secondary: "#f06292", // Light pink
                    tertiary: "#ffffff", // White for sidebar elements
                },
                results: {
                    primary: "rgba(255, 203, 220, 1)",
                    secondary: "rgba(250, 110, 150, 1)",
                },
            },
        },
    },
});

export default nicoleTheme;
