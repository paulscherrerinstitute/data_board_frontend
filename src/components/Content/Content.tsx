import React, {
    useState,
    useCallback,
    useRef,
    useEffect,
    useMemo,
} from "react";
import { Box, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import * as styles from "./Content.styles";
import TimeSelector from "./TimeSelector/TimeSelector";
import * as uuid from "uuid";
import {
    Widget,
    TimeValues,
    DashboardDto,
    Dashboard,
    StoredPlotSettings,
} from "./Content.types";
import ReactGridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import PlotWidget from "./PlotWidget/PlotWidget";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useApiUrls } from "../ApiContext/ApiContext";
import { TimeSelectorHandle } from "./TimeSelector/TimeSelector.types";
import { Channel } from "../Selector/Selector.types";
import { useLocalStorage } from "../../helpers/useLocalStorage";
import {
    defaultWidgetHeight,
    defaultWidgetWidth,
} from "../../helpers/defaults";
import showSnackbar from "../../helpers/showSnackbar";

const Content: React.FC = () => {
    const { backendUrl } = useApiUrls();
    const [timeValues, setTimeValues] = useState<TimeValues>({
        startTime: 0,
        endTime: 0,
        rawWhenSparse: true,
        removeEmptyBins: true,
    });
    const [searchParams, setSearchParams] = useSearchParams();
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [draggedOverKey, setDraggedOverKey] = useState("");
    const [hoveredOverKey, setHoveredOverKey] = useState("");
    const [gridWidth, setGridWidth] = useState(
        window.innerWidth - window.innerWidth * 0.05
    );

    const [initialWidgetHeight] = useLocalStorage(
        "initialWidgetHeight",
        defaultWidgetHeight
    );
    const [initialWidgetWidth] = useLocalStorage(
        "initialWidgetWidth",
        defaultWidgetWidth
    );

    const timeSelectorRef = useRef<TimeSelectorHandle | null>(null);
    const prevWidgetsLengthRef = useRef<number | null>(null);
    const isWidgetsInitializedRef = useRef(false);
    const gridContainerRef = useRef<HTMLElement | null>(null);

    const handleDrop = (event: React.DragEvent<HTMLElement>, key: string) => {
        event.preventDefault();
        setDraggedOverKey("");
        setHoveredOverKey("");

        const data = event.dataTransfer.getData("text");

        try {
            const channels: Channel[] = JSON.parse(data);

            if (
                channels.every((channel) =>
                    [channel.backend, channel.name, channel.type].every(
                        (attribute) => attribute !== undefined
                    )
                )
            ) {
                if (key === "-1") {
                    handleCreateWidget(channels);
                } else {
                    // check if target widget contains the same channel
                    const existingChannel = widgets
                        .find((widget) => widget.layout.i === key)
                        ?.channels.find((channel) =>
                            channels.find(
                                (newChannel) =>
                                    newChannel.backend === channel.backend &&
                                    newChannel.name === channel.name &&
                                    newChannel.type === channel.type
                            )
                        );

                    if (existingChannel) {
                        console.warn(
                            "Widget already contains the channel:",
                            existingChannel
                        );
                        showSnackbar(
                            `Widget already contains the channel: ${existingChannel.name}`,
                            "warning"
                        );
                        return;
                    }

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
                console.error("Invalid channel structure");
                showSnackbar("Invalid channel structure", "error");
            }
        } catch (error) {
            console.error("Error parsing dropped data as JSON:", error);
            showSnackbar("Error parsing dropped data as JSON", "error");
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

        // Now, try to find the first available space with width = initialWidgetWidth
        let calculatedX = 0;
        for (let x = 0; x <= 12 - initialWidgetWidth; x++) {
            // Check if this space (x, x+1, ..., x + defaultWidgetWidth - 1) is available
            const isSpaceAvailable = Array.from(
                { length: initialWidgetWidth },
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
                    i: uuid.v4(),
                    x: calculatedX,
                    y: Infinity,
                    w: initialWidgetWidth,
                    h: initialWidgetHeight,
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
            rawWhenSparse: boolean;
            removeEmptyBins: boolean;
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
                            setWidgets(dashboard.widgets);
                        }
                        return;
                    } catch (e) {
                        console.error("Error fetching stored dashboard: ", e);
                        showSnackbar(
                            "Failed to fetch the dashboard provided in the url",
                            "error"
                        );
                    }
                }
                // If no dashboard data could be fetched or parsed, create an initial dashboard
                setWidgets([
                    {
                        channels: [],
                        layout: {
                            i: uuid.v4(),
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

    const dashboardData = useMemo(() => {
        return {
            dashboard: {
                widgets: widgets,
            } as Dashboard,
        };
    }, [widgets]);

    const handleCreateDashboard = useCallback(async () => {
        try {
            const response = await axios.post<DashboardDto>(
                `${backendUrl}/dashboard`,
                dashboardData
            );
            const dashboardId = response.data.id;
            setSearchParams((searchParams) => {
                const newSearchParams = searchParams;
                newSearchParams.set("dashboardId", dashboardId);
                return newSearchParams;
            });
            showSnackbar(
                "Successfully saved dashboard to server! We don't guarantee persistent storage, export to JSON if needed.",
                "success"
            );
        } catch {
            showSnackbar(
                "Failed to save dashboard to server. Maybe try again, or export to JSON.",
                "error"
            );
        }
    }, [backendUrl, dashboardData, setSearchParams]);

    const handleSaveDashboard = useCallback(async () => {
        const dashboardId = searchParams.get("dashboardId");
        if (dashboardId) {
            try {
                await axios.patch<DashboardDto>(
                    `${backendUrl}/dashboard/${dashboardId}`,
                    dashboardData
                );
                showSnackbar(
                    "Successfully saved dashboard to server! We don't guarantee persistent storage, export to JSON if needed.",
                    "success"
                );
                return;
            } catch {
                // ignored
            }
        }
        handleCreateDashboard();
    }, [backendUrl, searchParams, dashboardData, handleCreateDashboard]);

    const handleDownloadDashboard = useCallback(async () => {
        // We need to create  the data like this, otherwise the curveAttributes Map couldn't be parsed.
        const jsonContent = JSON.stringify(dashboardData, null, 4);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const fileName = `dashboard_${new Date().toISOString()}.json`;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [dashboardData]);

    const handleImportDashboard = useCallback(async () => {
        try {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json"; // Accept only JSON files

            input.onchange = async (event) => {
                const file = (event.target as HTMLInputElement)?.files?.[0];
                if (!file) {
                    throw new Error("No file selected");
                }

                const content = await file.text();
                const parsedDashboard = JSON.parse(
                    content
                ) as typeof dashboardData;
                // To avoid rerendering issues caused by using i as a key, update all keys.
                const uniqueKeyWidgets = parsedDashboard.dashboard.widgets.map(
                    (widget) => ({
                        ...widget,
                        layout: {
                            ...widget.layout,
                            i: uuid.v4(),
                        },
                    })
                );
                setWidgets(uniqueKeyWidgets);
                showSnackbar("Successfully imported dashboard!", "success");
            };

            input.click();
        } catch (e) {
            console.error("Error in handleImportDashboard:", e);
            showSnackbar("Failed to import dashboard", "error");
        }
    }, [setWidgets]);

    return (
        <Box sx={styles.contentContainerStyle}>
            <Box sx={styles.topBarStyle}>
                <TimeSelector
                    ref={timeSelectorRef}
                    onTimeChange={handleTimeChange}
                />
            </Box>

            <Box sx={styles.gridContainerStyle} ref={gridContainerRef}>
                <div>
                    <ReactGridLayout
                        cols={12}
                        rowHeight={30}
                        width={gridWidth}
                        autoSize={true}
                        resizeHandles={["sw", "nw", "se", "ne"]}
                        onLayoutChange={handleLayoutChange}
                    >
                        {widgets.map(({ channels, layout, plotSettings }) => (
                            <Box
                                sx={{
                                    ...styles.gridItemStyle,
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
                                        sx={styles.removeWidgetButtonStyle}
                                        size="small"
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                )}
                                <PlotWidget
                                    channels={channels}
                                    timeValues={timeValues}
                                    index={layout.i}
                                    initialPlotSettings={
                                        plotSettings
                                            ? {
                                                  ...plotSettings,
                                                  curveAttributes: new Map(
                                                      Object.entries(
                                                          plotSettings.curveAttributes ||
                                                              []
                                                      )
                                                  ),
                                              }
                                            : undefined
                                    }
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
                                    onUpdatePlotSettings={(
                                        index,
                                        newPlotSettings
                                    ) => {
                                        setWidgets((prev) => [
                                            ...prev.map((widget) =>
                                                widget.layout.i === index
                                                    ? {
                                                          ...widget,
                                                          plotSettings: {
                                                              ...newPlotSettings,
                                                              curveAttributes:
                                                                  Object.fromEntries(
                                                                      newPlotSettings.curveAttributes
                                                                  ),
                                                          } as StoredPlotSettings,
                                                      }
                                                    : widget
                                            ),
                                        ]);
                                    }}
                                />
                            </Box>
                        ))}
                    </ReactGridLayout>
                </div>
                <Box sx={styles.actionButtonBoxStyle}>
                    <Button
                        onDrop={(event) => handleDrop(event, "-1")}
                        onDragOver={(event) => handleDragOver(event, "-1")}
                        onDragLeave={handleDragLeave}
                        sx={{
                            ...styles.CreateWidgetStyle,
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
