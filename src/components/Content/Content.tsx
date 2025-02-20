import React, { useState, useCallback, useRef, useEffect } from "react";
import { Box, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import * as styles from "./Content.styles";
import TimeSelector from "./TimeSelector/TimeSelector";
import { Widget, Channel, TimeValues, DashboardDto } from "./Content.types";
import ReactGridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import PlotWidget from "./PlotWidget/PlotWidget";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useApiUrls } from "../ApiContext/ApiContext";
import { TimeSelectorHandle } from "./TimeSelector/TimeSelector.types";

const Content: React.FC = () => {
    const { backendUrl } = useApiUrls();
    const [timeValues, setTimeValues] = useState<TimeValues>({
        startTime: 0,
        endTime: 0,
        queryExpansion: false,
    });
    const [searchParams, setSearchParams] = useSearchParams();
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [draggedOverKey, setDraggedOverKey] = useState("");
    const [hoveredOverKey, setHoveredOverKey] = useState("");
    const [gridWidth, setGridWidth] = useState(
        window.innerWidth - window.innerWidth * 0.05
    );
    const timeSelectorRef = useRef<TimeSelectorHandle | null>(null);
    const prevWidgetsLengthRef = useRef<number | null>(null);
    const isWidgetsInitializedRef = useRef(false);
    const gridContainerRef = useRef<HTMLElement | null>(null);
    const newPlotNumberRef = useRef(1);
    const defaultWidgetWidth = 6;
    const defaultWidgetHeight = 12;

    const handleDrop = (event: React.DragEvent<HTMLElement>, key: string) => {
        event.preventDefault();
        setDraggedOverKey("");
        setHoveredOverKey("");

        const data = event.dataTransfer.getData("text");

        try {
            const channels: Channel[] = JSON.parse(data);

            if (
                channels.every(
                    (channel) =>
                        channel.backend &&
                        channel.channelName &&
                        channel.datatype
                )
            ) {
                if (key === "-1") {
                    handleCreateWidget(channels);
                } else {
                    const newWidgets = widgets.map((widget) =>
                        widget.layout.i === key
                            ? {
                                  ...widget,
                                  channels: [...widget.channels, ...channels],
                              }
                            : widget
                    );
                    setWidgets(newWidgets);
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
        if (!isWidgetsInitializedRef.current) {
            isWidgetsInitializedRef.current = true;
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

        const plotNumber = newPlotNumberRef.current;
        newPlotNumberRef.current++;
        setWidgets((prevWidgets) => [
            ...prevWidgets,
            {
                channels: initialChannels,
                layout: {
                    i: plotNumber.toString(),
                    x: calculatedX,
                    y: Infinity,
                    w: defaultWidgetWidth,
                    h: defaultWidgetHeight,
                },
            },
        ]);
    };

    const interceptMouseDown = (e: MouseEvent) => {
        // Create a new event with modified properties
        Object.defineProperty(e, "ctrlKey", {
            get: () => false,
            configurable: true,
        });
    };

    useEffect(() => {
        document.addEventListener("mousedown", interceptMouseDown, true); // true for capture phase

        return () => {
            document.removeEventListener("mousedown", interceptMouseDown, true);
        };
    }, []);

    useEffect(() => {
        // In case widgets have been added, scroll to the bottom, but wait a bit for animation to finish
        if (
            prevWidgetsLengthRef.current &&
            prevWidgetsLengthRef.current < widgets.length
        ) {
            setTimeout(() => {
                if (gridContainerRef.current) {
                    gridContainerRef.current.scrollTo({
                        top: gridContainerRef.current.scrollHeight,
                        behavior: "smooth",
                    });
                }
            }, 250);
        }
        prevWidgetsLengthRef.current = widgets.length;
    }, [widgets]);

    const handleMouseEnter = (key: string) => {
        setHoveredOverKey(key);
    };

    const handleMouseLeave = () => {
        setHoveredOverKey("");
    };

    const handleTimeChange = useCallback(
        (values: {
            startTime: number;
            endTime: number;
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
        const initializeWidgets = async () => {
            if (!isWidgetsInitializedRef.current) {
                isWidgetsInitializedRef.current = true;
                // Make this not trigger a scroll to bottom
                prevWidgetsLengthRef.current = null;

                const dashboardId = searchParams.get("dashboardId");
                if (dashboardId) {
                    try {
                        const response = await axios.get<DashboardDto>(
                            `${backendUrl}/dashboard/${dashboardId}`
                        );
                        const dashboard = response.data.dashboard;
                        if (dashboard) {
                            const maxPlotNumber = Math.max(
                                ...dashboard.widgets.map(
                                    (widget) =>
                                        parseInt(widget.layout.i, 10) || 0
                                )
                            );
                            newPlotNumberRef.current = maxPlotNumber + 1;
                            setWidgets(dashboard.widgets);
                        }
                        return;
                    } catch (e) {
                        console.error("Error fetching stored dashboard: ", e);
                    }
                }
                // If no dashboard data could be fetched or parsed, create an initial dashboard
                const plotNumber = newPlotNumberRef.current;
                newPlotNumberRef.current++;
                setWidgets([
                    {
                        channels: [],
                        layout: {
                            i: plotNumber.toString(),
                            x: 0,
                            y: 0,
                            w: 12,
                            h: (window.innerHeight * 0.9) / (30 + 10) - 1,
                        },
                    },
                ]);
            }
        };
        initializeWidgets();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [searchParams, backendUrl]);

    const handleCreateDashboard = useCallback(async () => {
        const response = await axios.post<DashboardDto>(
            `${backendUrl}/dashboard`,
            {
                dashboard: { widgets: widgets },
            }
        );
        const dashboardId = response.data.id;
        setSearchParams((searchParams) => {
            const newSearchParams = searchParams;
            newSearchParams.set("dashboardId", dashboardId);
            return newSearchParams;
        });
    }, [backendUrl, setSearchParams, widgets]);

    const handleSaveDashboard = useCallback(async () => {
        const dashboardId = searchParams.get("dashboardId");
        if (dashboardId) {
            try {
                await axios.patch<DashboardDto>(
                    `${backendUrl}/dashboard/${dashboardId}`,
                    {
                        dashboard: { widgets: widgets },
                    }
                );
                return;
            } catch {}
        }
        handleCreateDashboard();
    }, [backendUrl, handleCreateDashboard, searchParams, widgets]);

    const handleDownloadDashboard = useCallback(async () => {
        const dashboardData = { dashboard: { widgets: widgets } };
        const jsonContent = JSON.stringify(dashboardData, null, 4);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const fileName = `dashboard_${new Date().toISOString()}.json`;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [widgets]);

    const handleImportDashboard = useCallback(async () => {
        try {
            // Create an input element dynamically
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json"; // Accept only JSON files

            input.onchange = async (event) => {
                const file = (event.target as HTMLInputElement)?.files?.[0];
                if (!file) {
                    throw new Error("No file selected");
                }

                const content = await file.text();
                const dashboardData = JSON.parse(content) as {
                    dashboard: { widgets: Widget[] };
                };

                setWidgets(dashboardData.dashboard.widgets);
            };

            input.click();
        } catch (e) {
            console.error("Error in handleImportWidgets:", e);
            alert("Something went wrong while importing widgets.");
        }
    }, []);

    return (
        <Box sx={styles.contentContainerStyles}>
            <Box sx={styles.topBarStyles}>
                <TimeSelector
                    ref={timeSelectorRef}
                    onTimeChange={handleTimeChange}
                />
            </Box>

            <Box sx={styles.gridContainerStyles} ref={gridContainerRef}>
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
                                    onChannelsChange={(updatedChannels) => {
                                        setWidgets((prevWidgets) =>
                                            prevWidgets.map((widget) =>
                                                widget.layout.i === layout.i
                                                    ? {
                                                          ...widget,
                                                          channels:
                                                              updatedChannels,
                                                      }
                                                    : widget
                                            )
                                        );
                                    }}
                                    onZoomTimeRangeChange={(
                                        startTime,
                                        endTime
                                    ) => {
                                        timeSelectorRef.current?.setTimeRange(
                                            startTime,
                                            endTime
                                        );
                                    }}
                                />
                            </Box>
                        ))}
                    </ReactGridLayout>
                </div>
                <Box sx={styles.actionButtonBoxStyles}>
                    <Button
                        onDrop={(event) => handleDrop(event, "-1")}
                        onDragOver={(event) => handleDragOver(event, "-1")}
                        onDragLeave={handleDragLeave}
                        sx={{
                            ...styles.CreateWidgetStyles,
                            filter:
                                draggedOverKey === "-1"
                                    ? "brightness(0.5)"
                                    : "",
                        }}
                        aria-label="Add new"
                        onClick={() => handleCreateWidget()}
                    ></Button>
                    <Button
                        variant="contained"
                        onClick={() => handleSaveDashboard()}
                    >
                        Save Layout
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => handleCreateDashboard()}
                    >
                        Save as new Layout
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => handleDownloadDashboard()}
                    >
                        Download Layout as JSON
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => handleImportDashboard()}
                    >
                        Import JSON Layout
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default Content;
