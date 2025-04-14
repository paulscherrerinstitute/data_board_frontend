import { ThemeOptions } from "@mui/material";
import darkTheme from "./dark";
import defaultTheme from "./default";
import { highContrastTheme } from "./highContrast";
import lightTheme from "./light";
import unicornTheme from "./unicorn";
import { AvailableTheme, ThemeContextType } from "./themes.types";
import { createContext, useContext } from "react";

export const ThemeContext = createContext<ThemeContextType>(
    {} as ThemeContextType
);

export const useThemeSettings = () => useContext(ThemeContext);

export const themes: Record<
    AvailableTheme,
    { theme: ThemeOptions; displayName: string }
> = {
    default: {
        theme: defaultTheme,
        displayName: "Classic",
    },
    dark: {
        theme: darkTheme,
        displayName: "Dark",
    },
    light: {
        theme: lightTheme,
        displayName: "Light",
    },
    highContrast: {
        theme: highContrastTheme,
        displayName: "High Contrast",
    },
    unicorn: {
        theme: unicornTheme,
        displayName: "Unicorn",
    },
};
