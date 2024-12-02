import React, { useRef, useState, useEffect, useCallback } from "react";
import { Box, Button } from "@mui/material";
import { SidebarProps } from "./Sidebar.types";
import {
    sidebarStyles,
    resizerStyles,
    toggleButtonStyles,
    buttonContainerStyle,
    halfButtonStyle,
} from "./Sidebar.styles";
import Selector from "../Selector/Selector";

const Sidebar: React.FC<SidebarProps> = ({
    initialWidthPercent = 40,
    maxWidthPercent = 60,
}) => {
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(() => {
        const initialWidth = (window.innerWidth * initialWidthPercent) / 100;
        return initialWidth;
    });
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const maxWidth = (windowWidth * maxWidthPercent) / 100;
    const minWidth = (windowWidth * 2.5) / 100;

    const handleResize = () => {
        setWindowWidth(window.innerWidth);
    };

    const startResizing = useCallback(() => {
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback(
        (event: MouseEvent) => {
            if (isResizing && sidebarRef.current) {
                const newWidth =
                    event.clientX - sidebarRef.current.getBoundingClientRect().left;
                setSidebarWidth(
                    Math.max(minWidth, Math.min(newWidth, maxWidth))
                );
            }
        },
        [isResizing, maxWidth, minWidth]
    );

    const stopResizingOnRightClick = useCallback(
        (event: MouseEvent) => {
            if (event.button === 2) {
                stopResizing(); // Stop resizing if the right mouse button is pressed
            }
        },
        [stopResizing]
    );

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        window.addEventListener("mousedown", stopResizingOnRightClick);
        window.addEventListener("resize", handleResize); // Update windowWidth on resize
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
            window.removeEventListener("mousedown", stopResizingOnRightClick);
            window.removeEventListener("resize", handleResize);
        };
    }, [resize, stopResizing, stopResizingOnRightClick]);

    const renderToggleButton = () => {
        return (
            <Box sx={buttonContainerStyle}>
                {sidebarWidth <= minWidth ? (
                    <Button
                        onClick={() => setSidebarWidth(maxWidth)} // Directly expand the sidebar
                        sx={toggleButtonStyles}
                        variant="contained"
                        size="small"
                        aria-label="Expand Sidebar"
                    >
                        {">"}
                    </Button>
                ) : sidebarWidth >= maxWidth ? (
                    <Button
                        onClick={() => setSidebarWidth(minWidth)} // Directly collapse the sidebar
                        sx={toggleButtonStyles}
                        variant="contained"
                        size="small"
                        aria-label="Collapse Sidebar"
                    >
                        {"<"}
                    </Button>
                ) : (
                    <>
                        <Button
                            onClick={() => setSidebarWidth(minWidth)} // Collapse
                            sx={{
                                ...halfButtonStyle,
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
                            onClick={() => setSidebarWidth(maxWidth)} // Uncollapse
                            sx={{
                                ...halfButtonStyle,
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
        <Box
            ref={sidebarRef}
            sx={{
                ...sidebarStyles,
                width: sidebarWidth,
                minWidth,
                maxWidth,
                transition: "width 0.1s ease",
                userSelect: isResizing ? "none" : "auto", // Prevent text selection while resizing
            }}
            aria-expanded={sidebarWidth > minWidth} // Accessibility improvement: show sidebar state for screen readers
            aria-hidden={sidebarWidth <= minWidth} // If collapsed, hide content from screen readers
        >
            {/* Collapse/Expand Button */}
            {renderToggleButton()}

            {/* Sidebar Content: Visible only if width >= 10% of screen width */}
            {(sidebarWidth >= windowWidth * 0.1 && sidebarWidth >= 200) && (
                <Box sx={{ flexGrow: 1 }}>
                    <Selector/>
                </Box>
            )}

            {/* Resizer Handle */}
            <Box sx={resizerStyles} onMouseDown={startResizing} />
        </Box>
    );
};

export default Sidebar;
