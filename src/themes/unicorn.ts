import { ThemeOptions, createTheme } from "@mui/material";
import baseTheme from "./base";
import unicorn from "../media/unicorn.gif";
import { defaultCurveColors } from "../helpers/defaults";

export const unicornTheme: ThemeOptions = createTheme({
    ...baseTheme,
    palette: {
        mode: "light",
        primary: {
            main: "#f06292",
            dark: "#f8bbd0",
        },
        secondary: {
            main: "#f8bbd0",
        },
        background: {
            default: "#fce4ec",
            paper: "#f8bbd0",
        },
        text: {
            primary: "#880e4f",
            secondary: "#ad1457",
        },
        custom: {
            sidebar: {
                text: "#880e4f",
                background: {
                    primary: "#f8bbd0",
                    secondary: "#f06292",
                    tertiary: "#ffffff",
                },
                results: {
                    primary: "rgba(255, 203, 220, 1)",
                    secondary: "rgba(250, 110, 150, 1)",
                },
            },
            plot: {
                legend: {
                    background: "#f8bbd0",
                    entry: {
                        background: {
                            primary: "rgba(252, 228, 236, 0.4)",
                            hover: "rgba(252, 228, 236, 0.6)",
                        },
                    },
                },
                background: "#fce4ec",
                xAxisGrid: "#f8bbd0",
                yAxisGrid: "#f8bbd0",
                curves: defaultCurveColors,
                watermark: unicorn,
            },
        },
    },
});

export default unicornTheme;
