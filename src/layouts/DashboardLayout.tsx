import React from "react";
import { Box, Button } from "@mui/material";
import Sidebar from "../components/Sidebar/Sidebar";
import Content from "../components/Content/Content";
import { defaultInitialSidebarState } from "../helpers/defaults";
import { InitialSidebarState } from "../components/Sidebar/Sidebar.types";
import { useSearchParams } from "react-router-dom";
import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { loginRequest, msalInstance } from "../helpers/auth-config";
import * as styles from "./DashboardLayout.styles";

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

    const handleLogin = async () => {
        const activeAccount = msalInstance.getActiveAccount();

        if (activeAccount) {
            msalInstance.acquireTokenSilent({
                ...loginRequest,
                account: activeAccount,
            });
        } else {
            msalInstance.loginRedirect({
                ...loginRequest
            })
        }
    }

    return (
        <>
            <Box
                sx={styles.layoutWrapper}
            >
                <Sidebar
                    initialWidthPercent={
                        isSidebarOpen
                            ? Math.min(30, (100 * 800) / window.innerWidth)
                            : 0
                    }
                    maxWidthPercent={Math.min(80, (100 * 800) / window.innerWidth)}
                />
                <Box sx={styles.loginButtonWrapper}>
                    <UnauthenticatedTemplate>
                        <Button sx={styles.loginButton} variant="contained" onClick={handleLogin}>Log in</Button>
                    </UnauthenticatedTemplate>
                </Box>
                <AuthenticatedTemplate>
                    <Content />
                </AuthenticatedTemplate>
            </Box >
            <Box sx={styles.turnPhoneMessageWrapper}>Turn your phone sideways to view the page!</Box>
        </>
    );
};

export default DashboardLayout;
