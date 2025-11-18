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
        const timeoutMs = 60000;
        let controller = new AbortController();

        const ping = () => {
            controller.abort();
            controller = new AbortController();
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
                        timeoutMs
                    )
                )
                .finally(() => clearTimeout(timeout));
        };

        ping();
        const interval = setInterval(ping, timeoutMs);

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
