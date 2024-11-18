import React from "react";
import { Box } from "@mui/material";
import Sidebar from "../components/Sidebar/Sidebar";
import Content from "../components/Content/Content";

const DashboardLayout: React.FC = () => {
    return (
        <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
            <Sidebar initialWidthPercent={30} maxWidthPercent={60} />
            <Content />
        </Box>
    );
};

export default DashboardLayout;
