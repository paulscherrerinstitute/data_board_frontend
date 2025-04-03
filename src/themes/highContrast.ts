import { createTheme, ThemeOptions } from "@mui/material";
import baseTheme from "./base";

export const highContrastTheme: ThemeOptions = createTheme({
    ...baseTheme,
    palette: {
        mode: "dark",
        primary: {
            main: "#ffffff", // White for primary elements
        },
        secondary: {
            main: "#ffcc00", // Yellow for secondary elements
        },
        background: {
            default: "#000000", // Black background
            paper: "#000000",
        },
        text: {
            primary: "#ffffff", // White text
            secondary: "#ffcc00", // Yellow text for secondary elements
        },
        custom: {
            sidebar: {
                text: "#ffffff",
                background: {
                    primary: "#000000",
                    secondary: "#343034", // Dark gray for sidebar
                    tertiary: "#343034", // Dark gray for sidebar elements
                },
                results: {
                    primary: "rgba(0, 0, 0, 0.4)", // Black for primary results
                    secondary: "rgba(34, 34, 34, 0.4)", // Dark gray for secondary results
                },
            },
        },
    },
    typography: {
        fontSize: 14, // Slightly larger font for readability
        fontFamily: "'Arial', sans-serif", // High readability font
    },
});
