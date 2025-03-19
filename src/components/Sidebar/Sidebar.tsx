import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import { Resizable } from "re-resizable";
import { SidebarProps } from "./Sidebar.types";
import * as styles from "./Sidebar.styles";
import Selector from "../Selector/Selector";

const Sidebar: React.FC<SidebarProps> = ({
    initialWidthPercent = 10,
    maxWidthPercent = 100,
}) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [sidebarWidth, setSidebarWidth] = useState(
        (window.innerWidth * initialWidthPercent) / 100
    );

    const maxWidth = (windowWidth * maxWidthPercent) / 100;
    const minWidth = (windowWidth * 2.5) / 100;

    const renderToggleButton = () => {
        return (
            <Box sx={styles.buttonContainerStyle}>
                {sidebarWidth <= minWidth ? (
                    <Button
                        onClick={() => setSidebarWidth(maxWidth)}
                        sx={styles.toggleButtonStyle}
                        variant="contained"
                        size="small"
                        aria-label="Expand Sidebar"
                    >
                        {">"}
                    </Button>
                ) : sidebarWidth >= maxWidth ? (
                    <Button
                        onClick={() => setSidebarWidth(minWidth)}
                        sx={styles.toggleButtonStyle}
                        variant="contained"
                        size="small"
                        aria-label="Collapse Sidebar"
                    >
                        {"<"}
                    </Button>
                ) : (
                    <>
                        <Button
                            onClick={() => setSidebarWidth(minWidth)}
                            sx={{
                                ...styles.halfButtonStyle,
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                            }}
                            variant="contained"
                            size="small"
                            aria-label="Collapse Sidebar"
                        >
                            {"<"}
                        </Button>
                        <Button
                            onClick={() => setSidebarWidth(maxWidth)}
                            sx={{
                                ...styles.halfButtonStyle,
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0,
                            }}
                            variant="contained"
                            size="small"
                            aria-label="Expand Sidebar"
                        >
                            {">"}
                        </Button>
                    </>
                )}
            </Box>
        );
    };

    return (
        <Box sx={styles.sidebarStyle}>
            <Resizable
                size={{ width: sidebarWidth, height: "100%" }}
                minWidth={minWidth}
                maxWidth={maxWidth}
                enable={{ right: true }}
                onResizeStop={(_e, _direction, _ref, d) => {
                    setSidebarWidth(sidebarWidth + d.width);
                    setWindowWidth(window.innerWidth);
                }}
            >
                {/* Collapse/Expand Button */}
                {renderToggleButton()}

                {/* Sidebar Content */}
                <Box
                    sx={{
                        display:
                            sidebarWidth >= windowWidth * 0.1 &&
                            windowWidth >= 200
                                ? "block"
                                : "none",
                    }}
                >
                    <Selector />
                </Box>
            </Resizable>
        </Box>
    );
};

export default Sidebar;
