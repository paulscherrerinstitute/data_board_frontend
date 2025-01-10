import React, { useState, useCallback, useRef, useEffect } from "react";
import { Box, Button, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import * as styles from "./Content.styles";
import TimeSelector from "./TimeSelector/TimeSelector";
import { Widget, Channel } from "./Content.types";
import { initial, uniqueId } from "lodash";
import ReactGridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const Content: React.FC = () => {
    const [timeValues, setTimeValues] = useState({
        startTime: "",
        endTime: "",
        queryExpansion: false,
    });
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [draggedOverKey, setDraggedOverKey] = useState("");
    const [hoveredOverKey, setHoveredOverKey] = useState("");
    const createWidgetButtonRef = useRef<HTMLButtonElement | null>(null);
    const defaultWidgetWidth = 6;
    const defaultWidgetHeight = 12;

    const handleDrop = (event: React.DragEvent<HTMLElement>, key: string) => {
        event.preventDefault();
        setDraggedOverKey("");
        setHoveredOverKey("");
        const data = event.dataTransfer.getData("text");
        console.log("Dropped data:", data);
        try {
            const channel: Channel = JSON.parse(data);
            if (channel && channel.channelName && channel.backend) {
                if (key === "-1") {
                    handleCreateWidget([channel]);
                } else {
                    setWidgets((prevWidgets) =>
                        prevWidgets.map((widget) =>
                            widget.layout.i === key
                                ? {
                                      ...widget,
                                      channels: [...widget.channels, channel],
                                  }
                                : widget
                        )
                    );
                }
            } else {
                console.error("Invalid channel structure.");
                alert("Invalid channel structure.");
            }
        } catch (error) {
            console.error("Error parsing dropped data as JSON:", error);
            alert(`Error parsing dropped data as JSON: ${error}`);
        }
    };

    const handleDragOver = (
        event: React.DragEvent<HTMLElement>,
        key: string
    ) => {
        event.preventDefault();
        setDraggedOverKey(key);
    };

    const handleDragLeave = () => {
        setDraggedOverKey("");
    };

    const handleRemoveWidget = (key: string) => {
        setWidgets((prevWidgets) =>
            prevWidgets.filter((widget) => widget.layout.i !== key)
        );
    };

    const handleCreateWidget = (initialChannels: Channel[] = []) => {
        const maxEndY = Math.max(
            ...widgets.map((widget) => widget.layout.y + widget.layout.h)
        );

        const occupiedXPositions = new Set<number>();

        // Check all widgets and find which ones end at maxEndY
        widgets.forEach((widget) => {
            const widgetEndY = widget.layout.y + widget.layout.h;
            if (widgetEndY === maxEndY) {
                // Mark the x positions occupied by this widget at maxEndY
                for (
                    let x = widget.layout.x;
                    x < widget.layout.x + widget.layout.w;
                    x++
                ) {
                    occupiedXPositions.add(x);
                }
            }
        });

        // Now, try to find the first available space with width = default width
        let calculatedX = 0;
        for (let x = 0; x <= 12 - defaultWidgetWidth; x++) {
            // Check if this space (x, x+1, ..., x + defaultWidgetWidth - 1) is available
            const isSpaceAvailable = Array.from(
                { length: defaultWidgetWidth },
                (_, i) => x + i
            ).every((occupiedX) => !occupiedXPositions.has(occupiedX));

            if (isSpaceAvailable) {
                calculatedX = x;
                break;
            }
        }
        setWidgets((prevWidgets) => [
            ...prevWidgets,
            {
                channels: initialChannels,
                layout: {
                    i: uniqueId(),
                    x: calculatedX,
                    y: Infinity,
                    w: defaultWidgetWidth,
                    h: defaultWidgetHeight,
                },
            },
        ]);

        setTimeout(() => {
            const observer = new IntersectionObserver(
                (entries, observer) => {
                    entries.forEach((entry) => {
                        if (entry.intersectionRatio < 0.999) {
                            console.log(entry.intersectionRatio);
                            if (createWidgetButtonRef.current) {
                                createWidgetButtonRef.current.focus();
                                createWidgetButtonRef.current.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                });
                            }
                        }
                        observer.disconnect();
                    });
                },
                { threshold: 0 }
            );

            if (createWidgetButtonRef.current) {
                observer.observe(createWidgetButtonRef.current);
            }
        }, 200);
    };

    const handleMouseEnter = (key: string) => {
        setHoveredOverKey(key);
    };

    const handleMouseLeave = () => {
        setHoveredOverKey("");
    };

    const handleTimeChange = useCallback(
        (values: {
            startTime: string;
            endTime: string;
            queryExpansion: boolean;
        }) => {
            setTimeValues(values);
        },
        []
    );

    const handleRefresh = () => {
        console.log("Current Time Values:", timeValues);
    };

    const handleLayoutChange = (newLayout: ReactGridLayout.Layout[]) => {
        setWidgets((prevWidgets) =>
            prevWidgets.map((widget) => {
                const updatedLayout = newLayout.find(
                    (layout) => layout.i === widget.layout.i
                );
                if (updatedLayout) {
                    return {
                        ...widget,
                        layout: updatedLayout,
                    };
                }
                return widget;
            })
        );
    };

    return (
        <Box sx={styles.contentContainerStyles}>
            <Box sx={styles.topBarStyles}>
                <TimeSelector
                    onTimeChange={handleTimeChange}
                    onRefresh={handleRefresh}
                />
            </Box>

            <Box sx={styles.gridContainerStyles}>
                <div>
                    <ReactGridLayout
                        cols={12}
                        rowHeight={30}
                        width={window.innerWidth - window.innerWidth * 0.05}
                        autoSize={true}
                        resizeHandles={["sw", "nw", "se", "ne"]}
                        onLayoutChange={handleLayoutChange}
                    >
                        {widgets.map(({ channels, layout }) => (
                            <Box
                                sx={{
                                    ...styles.gridItemStyles,
                                    position: "relative",
                                    backgroundColor:
                                        draggedOverKey === layout.i
                                            ? "rgba(0, 0, 0, 0.2)"
                                            : "#e0e0e0",
                                }}
                                onDrop={(event) => handleDrop(event, layout.i)}
                                onDragOver={(event) =>
                                    handleDragOver(event, layout.i)
                                }
                                onDragLeave={handleDragLeave}
                                onMouseEnter={() => handleMouseEnter(layout.i)}
                                onMouseLeave={handleMouseLeave}
                                key={layout.i}
                                data-grid={layout}
                            >
                                {hoveredOverKey === layout.i && (
                                    <IconButton
                                        onMouseDown={(event) => {
                                            event.stopPropagation();
                                        }}
                                        onClick={() =>
                                            handleRemoveWidget(layout.i)
                                        }
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            color: "white",
                                            backgroundColor:
                                                "rgba(0, 0, 0, 0.5)",
                                            "&:hover": {
                                                backgroundColor:
                                                    "rgba(0, 0, 0, 0.7)",
                                            },
                                            zIndex: 99999,
                                        }}
                                        size="small"
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                )}
                                <Typography
                                    variant="h6"
                                    color="textPrimary"
                                    sx={{ marginBottom: 2 }}
                                >
                                    Drag and Drop Channels to Plot:
                                    {channels.map((channel, index) => (
                                        <Typography
                                            variant="body1"
                                            color="textSecondary"
                                            key={index}
                                        >
                                            {channel.channelName} (
                                            {channel.backend})
                                        </Typography>
                                    ))}
                                </Typography>
                            </Box>
                        ))}
                    </ReactGridLayout>
                </div>
                <Button
                    onDrop={(event) => handleDrop(event, "-1")}
                    onDragOver={(event) => handleDragOver(event, "-1")}
                    onDragLeave={handleDragLeave}
                    sx={{
                        ...styles.CreateWidgetStyles,
                        backgroundColor:
                            draggedOverKey === "-1"
                                ? "rgba(0, 0, 0, 0.2)"
                                : "#e0e0e0",
                    }}
                    aria-label="Add new"
                    onClick={() => handleCreateWidget()}
                    ref={createWidgetButtonRef}
                ></Button>
            </Box>
        </Box>
    );
};

export default Content;
