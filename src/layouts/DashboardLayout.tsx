import React from "react";
import { Box } from "@mui/material";
import Sidebar from "../components/Sidebar/Sidebar";
import Content from "../components/Content/Content";
import { defaultInitialSidebarState } from "../helpers/defaults";
import { InitialSidebarState } from "../components/Sidebar/Sidebar.types";

const DashboardLayout: React.FC = () => {
    const initialSidebarState = JSON.parse(
        localStorage.getItem("initialSidebarState") ||
            JSON.stringify(defaultInitialSidebarState)
    ) as InitialSidebarState;

    const isSidebarOpen =
        initialSidebarState === "alwaysOpen" ||
        (initialSidebarState !== "alwaysClosed" &&
            !new URLSearchParams(window.location.search).get("dashboardId"));

    return (
        <Box
            sx={{
                display: "flex",
                height: "100vh",
                width: "100vw",
                overflow: "hidden",
            }}
        >
            <Sidebar
                initialWidthPercent={
                    isSidebarOpen
                        ? Math.min(30, (100 * 800) / window.innerWidth)
                        : 0
                }
                maxWidthPercent={Math.min(80, (100 * 800) / window.innerWidth)}
            />
            <Content />
        </Box>
    );
};

export default DashboardLayout;
