import { describe, it, expect } from "vitest";
import { themes } from "./themes";
import { createTheme, ThemeProvider, Typography } from "@mui/material";
import { render } from "@testing-library/react";

describe("themes", () => {
    it("all themes can be compiled by createTheme", () => {
        for (const [, value] of Object.entries(themes)) {
            expect(() => createTheme(value.theme)).not.toThrowError();
        }
    });

    it("all themes can be used in ThemeProvider without crashing", () => {
        for (const [, value] of Object.entries(themes)) {
            const muiTheme = createTheme(value.theme);
            expect(() => {
                render(
                    <ThemeProvider theme={muiTheme}>
                        <Typography>Hello from {value.displayName}</Typography>
                    </ThemeProvider>
                );
            }).not.toThrowError();
        }
    });
});
