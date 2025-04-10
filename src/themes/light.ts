import { createTheme, ThemeOptions } from "@mui/material";
import baseTheme from "./base";

export const lightTheme: ThemeOptions = createTheme({
    ...baseTheme,
    palette: {
        mode: "light",
        primary: {
            main: "#00bed8",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#f06292",
            dark: "#353839",
        },
        background: {
            default: "#ffffff",
            paper: "#ffffff",
        },
        text: {
            primary: "rgb(84, 90, 105)",
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
            plot: {
                legend: {
                    background: "#f0f0f0",
                    entry: {
                        background: {
                            primary: "rgba(255, 255, 255, 0.3)",
                            hover: "rgba(255, 255, 255, 0.4)",
                        },
                    },
                },
                background: "#ffffff",
                xAxisGrid: "#e3f0ff",
                yAxisGrid: "#e3f0ff",
            },
        },
    },
});

export default lightTheme;
