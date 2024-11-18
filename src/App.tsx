import React from "react";
import { CssBaseline } from "@mui/material";
import DashboardLayout from "./layouts/DashboardLayout";
import { ApiProvider } from "./components/ApiContext/ApiContext";

const App: React.FC = () => {
    const apiUrls = {
      backendUrl: (window as any)._env_.DATA_BOARD_PUBLIC_BACKEND_URL,
    }

    return (
        <ApiProvider apiUrls={apiUrls}>
            <CssBaseline />
            <DashboardLayout />
        </ApiProvider>
    );
};

export default App;
