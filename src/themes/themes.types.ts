export type AvailableTheme =
    | "default"
    | "dark"
    | "light"
    | "nicole"
    | "highContrast";

export type ThemeContextType = {
    currentTheme: AvailableTheme;
    setTheme: (theme: AvailableTheme) => void;
};

declare module "@mui/material/styles" {
    interface Palette {
        custom: {
            sidebar: {
                text: string;
                background: {
                    primary: string;
                    secondary: string;
                    tertiary: string;
                };
                results: {
                    primary: string;
                    secondary: string;
                };
            };
            plot: {
                legend: {
                    background: string;
                    entry: {
                        background: {
                            primary: string;
                            hover: string;
                        };
                    };
                };
                background: string;
                xAxisGrid: string;
                yAxisGrid: string;
            };
        };
    }

    interface PaletteOptions {
        custom: {
            sidebar: {
                text: string;
                background: {
                    primary: string;
                    secondary: string;
                    tertiary: string;
                };
                results: {
                    primary: string;
                    secondary: string;
                };
            };
            plot: {
                legend: {
                    background: string;
                    entry: {
                        background: {
                            primary: string;
                            hover: string;
                        };
                    };
                };
                background: string;
                xAxisGrid: string;
                yAxisGrid: string;
            };
        };
    }
}
