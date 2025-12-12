import React from "react";
import { Box } from "@mui/material";
import Sidebar from "../components/Sidebar/Sidebar";
import Content from "../components/Content/Content";
import { defaultInitialSidebarState } from "../helpers/defaults";
import { InitialSidebarState } from "../components/Sidebar/Sidebar.types";
import { useSearchParams } from "react-router-dom";

const DashboardLayout: React.FC = () => {
    const [searchParams] = useSearchParams();

    const initialSidebarState = JSON.parse(
        localStorage.getItem("initialSidebarState") ||
        JSON.stringify(defaultInitialSidebarState)
    ) as InitialSidebarState;

    const isSidebarOpen =
        !searchParams.get("closeSidebar") &&
        (initialSidebarState === "alwaysOpen" ||
            (initialSidebarState !== "alwaysClosed" &&
                !searchParams.get("dashboardId")));

    return (
        <>
            <Box
                sx={{
                    "@media (orientation: portrait)": {
                        display: "none"
                    },
                    "@media (orientation: landscape)": {
                        display: "flex",
                        height: "100vh",
                        width: "100vw",
                        overflow: "hidden",
                    }
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
            <Box sx={{
                "@media (orientation: portrait)": {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingBlock: "80%",
                },
                "@media (orientation: landscape)": {
                    display: "none"
                }
            }}>Turn your phone sideways to view the page!</Box>
        </>
    );
};

export default DashboardLayout;
