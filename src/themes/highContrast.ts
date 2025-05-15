import { createTheme, ThemeOptions } from "@mui/material";
import baseTheme from "./base";
import psiCasWhite from "../media/psi_cas_white.svg";

export const highContrastTheme: ThemeOptions = createTheme({
    ...baseTheme,
    palette: {
        mode: "dark",
        primary: {
            main: "#ffffff",
            dark: "#f9a825",
        },
        secondary: {
            main: "#ffcc00",
            dark: "#ffcc00",
        },
        background: {
            default: "#000000",
            paper: "#000000",
        },
        text: {
            primary: "#ffffff",
            secondary: "#ffcc00",
        },
        custom: {
            sidebar: {
                text: "#ffffff",
                background: {
                    primary: "#000000",
                    secondary: "#343034",
                    tertiary: "#343034",
                },
                results: {
                    primary: "rgba(0, 0, 0, 0.4)",
                    secondary: "rgba(34, 34, 34, 0.4)",
                },
            },
            plot: {
                legend: {
                    background: "#000000",
                    entry: {
                        background: {
                            primary: "rgba(255, 255, 255, 0.2)",
                            hover: "rgba(255, 255, 255, 0.4)",
                        },
                    },
                },
                background: "#000000",
                xAxisGrid: "#ffff00",
                yAxisGrid: "#ffff00",
                curves: [
                    "#ffffff",
                    "#ff0000",
                    "#00ff91",
                    "#429dff",
                    "#9467bd",
                    "#8c564b",
                    "#e377c2",
                    "#7f7f7f",
                    "#bcbd22",
                    "#17becf",
                ],
                watermark: psiCasWhite,
            },
        },
    },
    typography: {
        fontSize: 14,
        fontFamily: "'Arial', sans-serif",
    },
});
