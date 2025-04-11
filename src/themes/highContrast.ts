import { createTheme, ThemeOptions } from "@mui/material";
import baseTheme from "./base";
import psiCasWhite from "../media/psi_cas_white.svg";

export const highContrastTheme: ThemeOptions = createTheme({
    ...baseTheme,
    palette: {
        mode: "dark",
        primary: {
            main: "#ffffff", // White for primary elements
            dark: "#f9a825", // Bright yellow for dark elements
        },
        secondary: {
            main: "#ffcc00", // Yellow for secondary elements
            dark: "#ffcc00", // Yellow for dark elements
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
            plot: {
                legend: {
                    background: "#000000", // Black for plot legend
                    entry: {
                        background: {
                            primary: "rgba(255, 255, 255, 0.2)", // White for plot legend entry
                            hover: "rgba(255, 255, 255, 0.4)", // Softer white for hover
                        },
                    },
                },
                background: "#000000", // Black for plot background
                xAxisGrid: "#ffffff", // White for x-axis grid
                yAxisGrid: "#ffffff", // White for y-axis grid
                watermark: psiCasWhite,
            },
        },
    },
    typography: {
        fontSize: 14, // Slightly larger font for readability
        fontFamily: "'Arial', sans-serif", // High readability font
    },
});
