import { createTheme, ThemeOptions } from "@mui/material";

export const baseTheme: ThemeOptions = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#1976d2",
        },
        secondary: {
            main: "#dc004e",
            dark: "rgba(0, 0, 0, 0.6)",
        },
        background: {
            default: "#f0f0f0",
            paper: "#ffffff",
        },
        text: {
            primary: "#000000",
            secondary: "#757575",
        },
        divider: "rgba(0, 0, 0, 0.4)",
        custom: {
            sidebar: {
                text: "#ffffff",
                background: {
                    primary: "#353839",
                    secondary: "rgb(70, 73, 74)",
                    tertiary: "#ffffff",
                },
                results: {
                    primary: "rgba(80, 83, 85, 1)",
                    secondary: "rgba(62, 65, 66, 1)",
                },
            },
            plot: {
                legend: {
                    background: "#f4f4f4",
                    entry: {
                        background: {
                            primary: "#eaeaea",
                            hover: "#d3d3d3",
                        },
                    },
                },
                background: "#fcfcfc",
                xAxisGrid: "#ebebeb",
                yAxisGrid: "#ebebeb",
            },
        },
    },
});

export default baseTheme;
