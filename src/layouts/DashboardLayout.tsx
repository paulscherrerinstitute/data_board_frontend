import React from "react";
import { Box } from "@mui/material";
import Sidebar from "../components/Sidebar/Sidebar";
import Content from "../components/Content/Content";

const DashboardLayout: React.FC = () => {
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
                initialWidthPercent={Math.min(
                    30,
                    (100 * 800) / window.innerWidth
                )}
                maxWidthPercent={Math.min(80, (100 * 800) / window.innerWidth)}
            />
            <Content />
        </Box>
    );
};

export default DashboardLayout;
