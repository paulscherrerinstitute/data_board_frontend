export type AvailableTheme =
    | "default"
    | "dark"
    | "light"
    | "unicorn"
    | "highContrast";

export type ThemeContextType = {
    currentTheme: AvailableTheme;
    setTheme: (theme: AvailableTheme) => void;
};

type CustomPalette = {
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
        curves: string[];
        watermark: string | undefined;
    };
};

declare module "@mui/material/styles" {
    interface Palette {
        custom: CustomPalette;
    }

    interface PaletteOptions {
        custom: CustomPalette;
    }
}
