import { useMemo, useState } from "react";
import { AvailableTheme } from "../../themes/themes.types";
import { themes, ThemeContext } from "../../themes/themes";
import { ThemeProvider } from "@mui/material";
import { CustomThemeProviderProps } from "./CustomThemeProvider.types";

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({
    children,
}) => {
    const [currentTheme, setCurrentTheme] = useState<AvailableTheme>(
        (localStorage.getItem("theme") as AvailableTheme) || "default"
    );

    const setTheme = (theme: AvailableTheme) => {
        setCurrentTheme(theme);
        localStorage.setItem("theme", theme);
    };

    const getTheme = useMemo(() => themes[currentTheme], [currentTheme]);

    return (
        <ThemeContext.Provider value={{ currentTheme, setTheme }}>
            <ThemeProvider theme={getTheme}>{children}</ThemeProvider>
        </ThemeContext.Provider>
    );
};
