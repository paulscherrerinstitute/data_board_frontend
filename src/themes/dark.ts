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
            dark: "rgba(85, 85, 85, 0.8)",
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
                    tertiary: "#00000",
                },
                results: {
                    primary: "rgba(80, 83, 85, 1)",
                    secondary: "rgba(62, 65, 66, 1)",
                },
            },
            plot: {
                legend: {
                    background: "#19191b",
                    entry: {
                        background: {
                            primary: "rgba(255, 255, 255, 0.1)",
                            hover: "rgba(255, 255, 255, 0.2)",
                        },
                    },
                },
                background: "#121212",
                xAxisGrid: "#1e1e1e",
                yAxisGrid: "#1e1e1e",
            },
        },
    },
});

export default darkTheme;
