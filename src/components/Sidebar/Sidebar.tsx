import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Resizable } from "re-resizable";
import { SidebarProps } from "./Sidebar.types";
import * as styles from "./Sidebar.styles";
import Selector from "../Selector/Selector";
import GeneralSettingsPopup from "../GeneralSettingsPopup/GeneralSettingsPopup";
import { useLocalStorage } from "../../helpers/useLocalStorage";
import { defaultCloseSidebarOnOutsideClick } from "../../helpers/defaults";

const Sidebar: React.FC<SidebarProps> = ({
    initialWidthPercent = 10,
    maxWidthPercent = 100,
}) => {
    const [closeSidebarOnOutsideClick] = useLocalStorage(
        "closeSidebarOnOutsideClick",
        defaultCloseSidebarOnOutsideClick
    );

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [sidebarWidth, setSidebarWidth] = useState(
        (window.innerWidth * initialWidthPercent) / 100
    );
    const [openSettings, setOpenSettings] = useState(false);

    const storedSidebarWidth = useRef(0);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const maxWidth = (windowWidth * maxWidthPercent) / 100;
    const minWidth = Math.max(30, (windowWidth * 2.5) / 100);

    const setSidebarFocus = useCallback(
        (focus: boolean) => {
            if (focus) {
                setSidebarWidth(storedSidebarWidth.current);
            } else {
                storedSidebarWidth.current = sidebarWidth;
                setSidebarWidth(minWidth);
            }
        },
        [sidebarWidth, minWidth]
    );

    useEffect(() => {
        if (closeSidebarOnOutsideClick) {
            const handleClickOutside = (event: MouseEvent) => {
                if (
                    sidebarRef.current &&
                    !(
                        sidebarRef.current.contains(event.target as Node) ||
                        (event.target as HTMLElement).closest(
                            ".sidebar-ignore-click-outside"
                        )
                    )
                ) {
                    setSidebarFocus(false);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [closeSidebarOnOutsideClick, setSidebarFocus]);

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
        <Box sx={styles.sidebarStyle} ref={sidebarRef}>
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

                {/* Option buttons */}
                <Box sx={styles.buttonOptionsStyle}>
                    <IconButton
                        sx={styles.menuButtonStyle}
                        onClick={() => setOpenSettings(true)}
                    >
                        <Tooltip
                            title="Open General Settings"
                            arrow
                            placement="right"
                        >
                            <SettingsIcon />
                        </Tooltip>
                    </IconButton>
                    <IconButton
                        sx={styles.menuButtonStyle}
                        href="https://github.com/paulscherrerinstitute/data_board_frontend/blob/main/README.md"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Tooltip
                            title="Open Documentation"
                            arrow
                            placement="right"
                        >
                            <HelpOutlineIcon />
                        </Tooltip>
                    </IconButton>

                    <GeneralSettingsPopup
                        open={openSettings}
                        onClose={() => setOpenSettings(false)}
                    />
                </Box>

                {/* Selector */}
                <Box
                    sx={{
                        display:
                            sidebarWidth >= windowWidth * 0.1 &&
                            windowWidth >= 200
                                ? "block"
                                : "none",
                        height: "100%",
                    }}
                >
                    <Selector setSidebarIsFocused={setSidebarFocus} />
                </Box>
            </Resizable>
        </Box>
    );
};

export default Sidebar;
