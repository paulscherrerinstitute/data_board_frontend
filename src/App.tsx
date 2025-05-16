import React, { useEffect } from "react";
import { CssBaseline } from "@mui/material";
import DashboardLayout from "./layouts/DashboardLayout";
import { ApiProvider } from "./components/ApiContext/ApiContext";
import axios from "axios";
import showSnackbarAndLog, { logToConsole } from "./helpers/showSnackbar";

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

    useEffect(() => {
        const controller = new AbortController();

        const ping = () => {
            const timeout = setTimeout(() => controller.abort(), 5000);

            axios
                .get(`${apiUrls.backendUrl}/health`, {
                    signal: controller.signal,
                })
                .then(() =>
                    logToConsole("Backend seems alive and well", "success")
                )
                .catch((err) =>
                    showSnackbarAndLog(
                        "Couldn't reach backend",
                        "error",
                        err,
                        -1
                    )
                )
                .finally(() => clearTimeout(timeout));
        };

        ping();
        const interval = setInterval(ping, 60000);

        return () => {
            clearInterval(interval);
            controller.abort();
        };
    }, [apiUrls.backendUrl]);

    return (
        <ApiProvider apiUrls={apiUrls}>
            <CssBaseline />
            <DashboardLayout />
        </ApiProvider>
    );
};

export default App;
