import React, { useState, useCallback, useRef, useEffect } from "react";
import { Box, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import * as styles from "./Content.styles";
import TimeSelector from "./TimeSelector/TimeSelector";
import { Widget, Channel, TimeValues } from "./Content.types";
import { uniqueId } from "lodash";
import ReactGridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import PlotWidget from "./PlotWidget/PlotWidget";

const Content: React.FC = () => {
    const [timeValues, setTimeValues] = useState<TimeValues>({
        startTime: "",
        endTime: "",
        queryExpansion: false,
    });
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const isWidgetsInitialized  = useRef(false);
    const [draggedOverKey, setDraggedOverKey] = useState("");
    const [hoveredOverKey, setHoveredOverKey] = useState("");
    const [gridWidth, setGridWidth] = useState(
        window.innerWidth - window.innerWidth * 0.05
    );
    const createWidgetButtonRef = useRef<HTMLButtonElement | null>(null);
    const defaultWidgetWidth = 6;
    const defaultWidgetHeight = 12;

    const handleDrop = (event: React.DragEvent<HTMLElement>, key: string) => {
        event.preventDefault();
        setDraggedOverKey("");
        setHoveredOverKey("");
        const data = event.dataTransfer.getData("text");
        try {
            const channel: Channel = JSON.parse(data);
            if (
                channel &&
                channel.channelName &&
                channel.backend &&
                channel.datatype
            ) {
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
        if (!isWidgetsInitialized.current) {
            isWidgetsInitialized.current = true;
        }

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

        // Wait a bit until the new widget is rendered and then scroll such that the create widget button is in view.
        setTimeout(() => {
            const observer = new IntersectionObserver(
                (entries, observer) => {
                    entries.forEach((entry) => {
                        if (entry.intersectionRatio < 0.999) {
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

    useEffect(() => {
        const handleResize = () => {
            setGridWidth(window.innerWidth - window.innerWidth * 0.05);
        };

        window.addEventListener("resize", handleResize);
        if (!isWidgetsInitialized.current) {
            isWidgetsInitialized.current = true;
            setWidgets([
                {
                    channels: [],
                    layout: {
                        i: uniqueId(),
                        x: 0,
                        y: 0,
                        w: 12,
                        h: (window.innerHeight * 0.9) / (30 + 10) - 1,
                    },
                },
            ]);
        }

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <Box sx={styles.contentContainerStyles}>
            <Box sx={styles.topBarStyles}>
                <TimeSelector onTimeChange={handleTimeChange} />
            </Box>

            <Box sx={styles.gridContainerStyles}>
                <div>
                    <ReactGridLayout
                        cols={12}
                        rowHeight={30}
                        width={gridWidth}
                        autoSize={true}
                        resizeHandles={["sw", "nw", "se", "ne"]}
                        onLayoutChange={handleLayoutChange}
                    >
                        {widgets.map(({ channels, layout }) => (
                            <Box
                                sx={{
                                    ...styles.gridItemStyles,
                                    position: "relative",
                                    filter:
                                        draggedOverKey === layout.i
                                            ? "brightness(0.5)"
                                            : "brightness(1)",
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
                                        sx={styles.removeWidgetButtonStyles}
                                        size="small"
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                )}
                                <PlotWidget
                                    channels={channels}
                                    timeValues={timeValues}
                                    index={layout.i}
                                ></PlotWidget>
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
                        filter:
                            draggedOverKey === "-1" ? "brightness(0.5)" : "",
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
