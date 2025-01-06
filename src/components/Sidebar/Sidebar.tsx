import React, {
    useRef,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import { Box, Button } from "@mui/material";
import { throttle } from "lodash";
import { SidebarProps } from "./Sidebar.types";
import * as styles from "./Sidebar.styles";
import Selector from "../Selector/Selector";

const Sidebar: React.FC<SidebarProps> = ({
    initialWidthPercent = 10,
    maxWidthPercent = 100,
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
        console.log(sidebarWidth);
    }, []);

    const resize = useMemo(
        () =>
            throttle((event: MouseEvent) => {
                if (isResizing && sidebarRef.current) {
                    const newWidth =
                        event.clientX -
                        sidebarRef.current.getBoundingClientRect().left;
                    //console.log(newWidth);
                    setSidebarWidth(
                        //870
                        Math.max(minWidth, Math.min(newWidth, maxWidth))
                    );
                }
            }, 42), // Update frequency (42ms ~= 24fps)
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
            <Box sx={styles.buttonContainerStyle}>
                {sidebarWidth <= minWidth ? ( // Either only show expand button (if sidebar is fully collapsed)
                    <Button
                        onClick={() => setSidebarWidth(maxWidth)}
                        sx={styles.toggleButtonStyles}
                        variant="contained"
                        size="small"
                        aria-label="Expand Sidebar"
                    >
                        {">"}
                    </Button>
                ) : sidebarWidth >= maxWidth ? ( // Or only show collapse button (if sidebar is fully expanded)
                    <Button
                        onClick={() => setSidebarWidth(minWidth)}
                        sx={styles.toggleButtonStyles}
                        variant="contained"
                        size="small"
                        aria-label="Collapse Sidebar"
                    >
                        {"<"}
                    </Button>
                ) : (
                    // If the sidebar width is somewhere in between fully collapsed and fully expanded, show both
                    <>
                        <Button
                            onClick={() => setSidebarWidth(minWidth)} // Collapse
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
                            onClick={() => setSidebarWidth(maxWidth)} // Expand
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
        <Box
            ref={sidebarRef}
            sx={{
                ...styles.sidebarStyles,
                width: sidebarWidth,
                transition: "width 0.1s ease",
                userSelect: isResizing ? "none" : "auto", // Prevent text selection while resizing
            }}
            aria-expanded={sidebarWidth > minWidth} // Accessibility: show sidebar state for screen readers
            aria-hidden={sidebarWidth <= minWidth} // If collapsed, hide content from screen readers
        >
            {/* Collapse/Expand Button */}
            {renderToggleButton()}

            {/* Sidebar Content: Visible only if width >= 10% of screen width and that is >= 200px */}
            <Box sx={{ ...styles.selectorStyle(sidebarWidth, windowWidth) }}>
                <Selector />
            </Box>

            {/* Resizer Handle */}
            <Box sx={styles.resizerStyles} onMouseDown={startResizing} />
        </Box>
    );
};

export default Sidebar;
