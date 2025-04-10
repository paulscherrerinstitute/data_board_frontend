import { ThemeOptions, createTheme } from "@mui/material";
import baseTheme from "./base";
import unicorn from "../media/unicorn.gif";

export const unicornTheme: ThemeOptions = createTheme({
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
            plot: {
                legend: {
                    background: "#f8bbd0", // Softer pink, matching paper background
                    entry: {
                        background: {
                            primary: "rgba(252, 228, 236, 0.4)", // Very light pink (default background) with opacity
                            hover: "rgba(252, 228, 236, 0.6)", // Very light pink (default background) with higher opacity
                        },
                    },
                },
                background: "#fce4ec", // Very light pink
                xAxisGrid: "#f8bbd0", // Softer pink
                yAxisGrid: "#f8bbd0", // Softer pink
                watermark: unicorn,
            },
        },
    },
});

export default unicornTheme;
