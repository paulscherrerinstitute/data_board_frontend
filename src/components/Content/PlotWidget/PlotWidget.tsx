import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Box } from "@mui/material";
import {
    PlotWidgetProps,
    CurveData,
    Curve,
    ContainerDimensions,
    ZoomState,
} from "./PlotWidget.types";
import Plot from "react-plotly.js";
import { useApiUrls } from "../../ApiContext/ApiContext";
import axios from "axios";
import { Channel } from "../Content.types";
import { debounce } from "lodash";
import * as styles from "./PlotWidget.styles";
import { BackendChannel } from "../../Selector/Selector.types";
import Plotly, { LegendClickEvent } from "plotly.js";

const PlotWidget: React.FC<PlotWidgetProps> = React.memo(
    ({ channels, timeValues, index, onChannelsChange }) => {
        const { backendUrl } = useApiUrls();
        const [containerDimensions, setContainerDimensions] =
            useState<ContainerDimensions>({
                width: 0,
                height: 0,
            });
        const [curves, setCurves] = useState<Curve[]>([]);
        const [zoomState, setZoomState] = useState<ZoomState>({
            xaxisRange: undefined,
            yaxisRange: undefined,
        });
        const plotContainerRef = useRef<HTMLDivElement | null>(null);
        const curvesRef = useRef(curves);
        const numBins = 64000;

        // Prevent event bubbling if its on a draggable surface so an event to drag the plot will not be handled by the grid layout to move the whole widget.
        const handleEventPropagation = (e: React.SyntheticEvent) => {
            const plotCanvas = e.target as HTMLElement;
            if (
                plotCanvas &&
                plotCanvas.classList.contains("drag") &&
                plotCanvas.closest(".plotly")
            ) {
                e.stopPropagation();
            }
        };

        // Because "autosize" is very slow, we manually update the dimensions
        useEffect(() => {
            const containerElement = plotContainerRef.current;

            const resizeHandler = debounce(() => {
                if (containerElement) {
                    const { width, height } =
                        containerElement.getBoundingClientRect();
                    setContainerDimensions({ width, height });
                }
            }, 100);

            const resizeObserver = new ResizeObserver(resizeHandler);

            if (containerElement) {
                resizeObserver.observe(containerElement);
            }

            return () => {
                if (containerElement) {
                    resizeObserver.unobserve(containerElement);
                }
            };
        }, []);

        useEffect(() => {
            const fetchData = async (channel: Channel) => {
                try {
                    // Add the new channel with empty data first so it appears in the legend
                    setCurves((prevCurves) => {
                        const channelName = channel.channelName;
                        const existingCurveIndex = prevCurves.findIndex(
                            (curve) =>
                                curve.backend === channel.backend &&
                                channelName in curve.curveData.curve
                        );

                        if (existingCurveIndex === -1) {
                            return [
                                ...prevCurves,
                                {
                                    backend: channel.backend,
                                    curveData: {
                                        curve: {
                                            [channelName]: { undefined: NaN }, // Empty data initially
                                        },
                                    },
                                },
                            ];
                        }
                        return prevCurves;
                    });

                    // Fetch data after adding the new channel
                    // First, get the seriesId by searching for the channel and filtering our values
                    const searchResults = await axios.get<{
                        channels: BackendChannel[];
                    }>(`${backendUrl}/channels/search`, {
                        params: {
                            search_text: `^${channel.channelName}$`,
                        },
                    });

                    const filteredResults = searchResults.data.channels.filter(
                        (returnedChannel) =>
                            returnedChannel.backend === channel.backend &&
                            returnedChannel.name === channel.channelName &&
                            channel.datatype === "[]"
                                ? returnedChannel.type === ""
                                : returnedChannel.type === channel.datatype
                    );

                    // Now we have our seriesId, if the channel still exists
                    if (filteredResults.length === 0) {
                        alert(
                            `Channel: ${channel.channelName} does not exist anymore on backend: ${channel.backend} with datatype: ${channel.datatype}`
                        );
                        return;
                    }
                    const seriesId = filteredResults[0].seriesId;
                    // Use seriesId as soon as datahub supports it

                    // Now, fetch the actual data
                    const response = await axios.get<CurveData>(
                        `${backendUrl}/channels/curve`,
                        {
                            params: {
                                channel_name: channel.channelName, // REPLACE WITH SERIESID AS SOON AS SUPPORTED BY DATAHUB
                                begin_time: timeValues.startTime,
                                end_time: timeValues.endTime,
                                backend: channel.backend,
                                num_bins: numBins,
                                query_expansion: timeValues.queryExpansion,
                            },
                        }
                    );

                    // Now update the data after it is fetched
                    setCurves((prevCurves) => {
                        if (!response.data.curve) {
                            alert("No data for curve: " + channel.channelName);
                            return prevCurves;
                        }
                        const channelName = Object.keys(response.data.curve)[0];
                        const existingCurveIndex = prevCurves.findIndex(
                            (curve) =>
                                curve.backend === channel.backend &&
                                channelName in curve.curveData.curve
                        );

                        const timezoneOffsetMs =
                            new Date().getTimezoneOffset() * -60000;
                        const convertTimestamp = (timestamp: string) => {
                            return new Date(
                                Number(timestamp) / 1e6 + timezoneOffsetMs
                            ).toISOString();
                        };

                        const updatedCurveData = Object.fromEntries(
                            Object.entries(
                                response.data.curve[channelName]
                            ).map(([timestamp, value]) => [
                                convertTimestamp(timestamp),
                                value,
                            ])
                        );

                        if (existingCurveIndex !== -1) {
                            const updatedCurves = [...prevCurves];
                            updatedCurves[existingCurveIndex].curveData = {
                                ...updatedCurves[existingCurveIndex].curveData,
                                curve: {
                                    [channelName]: updatedCurveData,
                                },
                            };
                            return updatedCurves;
                        } else {
                            return [
                                ...prevCurves,
                                {
                                    backend: channel.backend,
                                    curveData: {
                                        ...response.data,
                                        curve: {
                                            [channelName]: updatedCurveData,
                                        },
                                    },
                                },
                            ];
                        }
                    });
                } catch (error) {
                    console.log(error);
                }
            };

            for (const channel of channels) {
                fetchData(channel);
            }
        }, [channels, timeValues, backendUrl]);

        const handleRelayout = (e: any) => {
            // Save the zoom state when the user zooms or pans the plot
            const updatedZoomState = zoomState;

            if (e["xaxis.range[0]"] && e["xaxis.range[1]"]) {
                updatedZoomState.xaxisRange = [
                    e["xaxis.range[0]"],
                    e["xaxis.range[1]"],
                ];
            }

            if (e["yaxis.range[0]"] && e["yaxis.range[1]"]) {
                updatedZoomState.yaxisRange = [
                    e["yaxis.range[0]"],
                    e["yaxis.range[1]"],
                ];
            }

            // If neither key is present, unset both ranges
            if (!e["xaxis.range[0]"] && !e["yaxis.range[0]"]) {
                setZoomState({
                    xaxisRange: undefined,
                    yaxisRange: undefined,
                });
            } else {
                setZoomState(updatedZoomState);
            }
        };

        const handleDoubleClick = () => {
            // Zoom is reset, so unset zoomState
            setZoomState({
                xaxisRange: undefined,
                yaxisRange: undefined,
            });
        };

        useEffect(() => {
            curvesRef.current = curves;
        }, [curves]);

        const downloadBlob = useCallback((blob: Blob, fileName: string) => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, []);

        const downloadDataCSV = useCallback(() => {
            const curvesData = curvesRef.current;

            const headers = ["Backend", "Channel", "Timestamp", "Value"];
            const rows: string[] = [];

            curvesData.forEach((curve) => {
                const backend = curve.backend;
                const curveEntries = Object.entries(curve.curveData.curve);

                curveEntries.forEach(([channel, timestamps]) => {
                    Object.entries(timestamps).forEach(([timestamp, value]) => {
                        rows.push(
                            [backend, channel, timestamp, value].join(";")
                        );
                    });
                });
            });

            const csvContent = [headers.join(";"), ...rows].join("\n");
            const blob = new Blob([csvContent], { type: "text/csv" });

            const fileName = `curves_${new Date().toISOString()}.csv`;
            downloadBlob(blob, fileName);
        }, [downloadBlob]);

        const downloadDataJSON = useCallback(() => {
            const curvesData = curvesRef.current;
            const jsonContent = JSON.stringify(curvesData, null, 4);
            const blob = new Blob([jsonContent], { type: "application/json" });

            const fileName = `curves_${new Date().toISOString()}.json`;
            downloadBlob(blob, fileName);
        }, [downloadBlob]);

        const handleLegendClick = useCallback(
            (eventData: Readonly<LegendClickEvent>) => {
                const curveName = eventData.data[eventData.curveNumber].name;
                setCurves((prevCurves) => {
                    const updatedCurves = prevCurves.filter(
                        (curve) =>
                            !Object.keys(curve.curveData.curve).some(
                                (name) =>
                                    `${name} - ${curve.backend}` === curveName
                            )
                    );

                    const updatedChannels = channels.filter(
                        (channel) =>
                            `${channel.channelName} - ${channel.backend}` !==
                            curveName
                    );

                    onChannelsChange(updatedChannels);
                    return updatedCurves;
                });

                return false;
            },
            [channels, onChannelsChange]
        );

        const data = useMemo(
            () =>
                curves.flatMap(
                    (curve, index) =>
                        Object.entries(curve.curveData.curve).map(
                            ([channelName, data]) => ({
                                x: data ? Object.keys(data) : {},
                                y: data ? Object.values(data) : {},
                                type: "scattergl",
                                mode: "lines+markers",
                                name: `${channelName} - ${curve.backend}`,
                                yaxis: index === 0 ? "y" : `y${index + 1}`, // Assign y-axis dynamically, such that each curve has its own axis
                            })
                        ) as Plotly.Data[]
                ),
            [curves]
        );

        const layout = useMemo(() => {
            // Define dynamic y-axes using channel names
            const yAxes = curves.map((curve, curveIndex) => {
                const channelName = Object.keys(curve.curveData.curve)[0];
                return {
                    [`yaxis${curveIndex === 0 ? "" : `${curveIndex + 1}`}`]: {
                        title: {
                            text: `${channelName} - ${curve.backend}`,
                        },
                        overlaying: curveIndex === 0 ? undefined : "y", // Overlay all except the first axis, this shows all grids
                        side: curveIndex % 2 === 0 ? "left" : "right", // Alternate sides for clarity, starting with left
                        anchor: "free",
                        // Calculate the position based on the index, as plotly can't do this automatically...
                        position:
                            curveIndex % 2 === 0
                                ? curveIndex / (40 * (window.innerWidth / 2560))
                                : 1 -
                                  curveIndex /
                                      (40 * (window.innerWidth / 2560)),
                    },
                };
            }, []);

            return {
                title: { text: `Plot ${index}` },
                width: containerDimensions.width,
                height: containerDimensions.height,
                margin: { l: 70, r: 40, t: 50, b: 70 },
                xaxis: {
                    title: { text: "Time" },
                    range: zoomState.xaxisRange,
                    domain: [
                        // Specify the width of the X axis to leave enough room for all y axes
                        0.01 +
                            Math.ceil(curves.length / 2) /
                                (40 * (window.innerWidth / 2560)),
                        1.01 -
                            Math.floor(curves.length / 2) /
                                (40 * 0.5 * (window.innerWidth / 2560)),
                    ],
                },
                yaxis: {
                    title: { text: "Value" }, // Remove the default "Click to add title"
                },
                ...Object.assign({}, ...yAxes), // Merge all y-axis definitions into layout
                showlegend: true,
            } as Plotly.Layout;
        }, [curves, containerDimensions, zoomState, index]);

        const config = useMemo(() => {
            return {
                displaylogo: false,
                modeBarButtons: [
                    [
                        {
                            name: "downloadCSV",
                            title: "Download data as csv",
                            icon: Plotly.Icons.disk,
                            click: () => {
                                downloadDataCSV();
                            },
                        },
                        {
                            name: "downloadJSON",
                            title: "Download data as json",
                            icon: Plotly.Icons.disk,
                            click: () => {
                                return downloadDataJSON();
                            },
                        },
                    ],
                    [
                        "toImage",
                        "zoomIn2d",
                        "zoomOut2d",
                        "autoScale2d",
                        "resetScale2d",
                    ],
                ],
            } as Plotly.Config;
        }, [downloadDataCSV, downloadDataJSON]);

        return (
            <Box
                ref={plotContainerRef}
                sx={styles.containerStyles}
                onClick={handleEventPropagation}
                onMouseDown={handleEventPropagation}
                onMouseUp={handleEventPropagation}
                onMouseMove={handleEventPropagation}
                onTouchStart={handleEventPropagation}
                onTouchMove={handleEventPropagation}
                onTouchEnd={handleEventPropagation}
            >
                <Plot
                    data={data}
                    layout={layout}
                    config={config}
                    style={{ width: "100%", height: "100%" }}
                    onRelayout={handleRelayout}
                    onDoubleClick={handleDoubleClick}
                    onLegendClick={handleLegendClick}
                />
            </Box>
        );
    }
);

export default PlotWidget;
