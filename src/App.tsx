import React from "react";
import { CssBaseline } from "@mui/material";
import DashboardLayout from "./layouts/DashboardLayout";
import { ApiProvider } from "./components/ApiContext/ApiContext";

interface EnvWindow extends Window {
    _env_?: {
        DATA_BOARD_PUBLIC_BACKEND_URL: string;
    };
}

const App: React.FC = () => {
    const apiUrls = {
        backendUrl:
            (window as EnvWindow)._env_?.DATA_BOARD_PUBLIC_BACKEND_URL || "",
    };

    return (
        <ApiProvider apiUrls={apiUrls}>
            <CssBaseline />
            <DashboardLayout />
        </ApiProvider>
    );
};

export default App;
