import { createTheme, ThemeOptions } from "@mui/material";
import baseTheme from "./base";

export const defaultTheme: ThemeOptions = createTheme({
    ...baseTheme,
});

export default defaultTheme;
