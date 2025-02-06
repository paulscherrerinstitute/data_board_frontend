import React, { useState, useCallback, useRef, useEffect } from "react";
import { Box, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import * as styles from "./Content.styles";
import TimeSelector from "./TimeSelector/TimeSelector";
import { Widget, Channel, TimeValues, Dashboard } from "./Content.types";
import { uniqueId } from "lodash";
import ReactGridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import PlotWidget from "./PlotWidget/PlotWidget";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useApiUrls } from "../ApiContext/ApiContext";

const Content: React.FC = () => {
    const { backendUrl } = useApiUrls();
    const [timeValues, setTimeValues] = useState<TimeValues>({
        startTime: "",
        endTime: "",
        queryExpansion: false,
    });
    const [searchParams, setSearchParams] = useSearchParams();
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [draggedOverKey, setDraggedOverKey] = useState("");
    const [hoveredOverKey, setHoveredOverKey] = useState("");
    const [gridWidth, setGridWidth] = useState(
        window.innerWidth - window.innerWidth * 0.05
    );
    const prevWidgetsLengthRef = useRef<number | null>(null);
    const isWidgetsInitializedRef = useRef(false);
    const gridContainerRef = useRef<HTMLElement | null>(null);
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
                    const newWidgets = widgets.map((widget) =>
                        widget.layout.i === key
                            ? {
                                  ...widget,
                                  channels: [...widget.channels, channel],
                              }
                            : widget
                    );
                    setWidgets(newWidgets);

                    // Save channels of first plot in Url
                    if (key === "1") {
                        const oldChannelsParam = searchParams.get("channels");
                        if (oldChannelsParam) {
                            try {
                                const oldChannelsParsed =
                                    JSON.parse(oldChannelsParam);
                                // Find and update the channel just added
                                const newChannels = oldChannelsParsed.map(
                                    (selectedChannel: any) => {
                                        if (
                                            selectedChannel.cn ===
                                                channel.channelName &&
                                            selectedChannel.be ===
                                                channel.backend &&
                                            selectedChannel.dt ===
                                                channel.datatype
                                        ) {
                                            return {
                                                ...selectedChannel,
                                                p1: true, // Set p1 to true to say this channel is in plot 1
                                            };
                                        }
                                        return selectedChannel; // Keep other channels unchanged
                                    }
                                );
                                const newChannelsParam =
                                    JSON.stringify(newChannels);
                                setSearchParams((searchParams) => {
                                    const newSearchParams = searchParams;
                                    newSearchParams.set(
                                        "channels",
                                        newChannelsParam
                                    );
                                    return newSearchParams;
                                });
                            } catch (e) {
                                console.error("Error parsing URL channels:", e);
                            }
                        }
                    }
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
    };

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
        // If widgets is not yet initialized, add an initial widget
        if (!isWidgetsInitializedRef.current) {
            isWidgetsInitializedRef.current = true;
            // Make this not trigger a scroll to bottom
            prevWidgetsLengthRef.current = null;

            // Get all channels from the URL that are set to be in the first plot
            const channelsParam = searchParams.get("channels");
            let channelsInFirstPlot: Channel[] = [];
            if (channelsParam) {
                try {
                    const parsedChannels = JSON.parse(channelsParam);
                    channelsInFirstPlot = parsedChannels
                        .filter((channel: any) => channel.p1 === true)
                        .map((channel: any) => ({
                            channelName: channel.cn,
                            backend: channel.be,
                            datatype: channel.dt,
                        }));
                } catch (e) {
                    console.error("Error parsing URL channels:", e);
                }
            }

            setWidgets([
                {
                    channels: channelsInFirstPlot,
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
    }, [searchParams]);

    const handleCreateDashboard = useCallback(async () => {
        const response = await axios.post<Dashboard>(
            `${backendUrl}/dashboard`,
            {
                params: {
                    dashboard: { widgets: widgets },
                },
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
                await axios.patch<Dashboard>(
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

    return (
        <Box sx={styles.contentContainerStyles}>
            <Box sx={styles.topBarStyles}>
                <TimeSelector onTimeChange={handleTimeChange} />
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
                                ></PlotWidget>
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
                        Save Dasbhoard
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => handleCreateDashboard()}
                    >
                        Save as new Dashboard
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default Content;
