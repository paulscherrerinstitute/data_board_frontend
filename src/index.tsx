import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { CssBaseline } from "@mui/material";
import { CustomThemeProvider } from "./components/CustomThemeProvider/CustomThemeProvider";

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    <CustomThemeProvider>
        <CssBaseline />
        <BrowserRouter>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <App />
            </LocalizationProvider>
        </BrowserRouter>
    </CustomThemeProvider>
);
