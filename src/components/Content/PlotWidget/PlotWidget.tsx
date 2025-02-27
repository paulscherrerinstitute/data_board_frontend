import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Box, Typography } from "@mui/material";
import {
    PlotWidgetProps,
    CurveData,
    Curve,
    ContainerDimensions,
} from "./PlotWidget.types";
import Plot from "react-plotly.js";
import { useApiUrls } from "../../ApiContext/ApiContext";
import axios from "axios";
import { debounce } from "lodash";
import * as styles from "./PlotWidget.styles";
import { Channel } from "../../Selector/Selector.types";
import Plotly from "plotly.js";

const PlotWidget: React.FC<PlotWidgetProps> = React.memo(
    ({
        channels,
        timeValues,
        index,
        onChannelsChange,
        onZoomTimeRangeChange,
    }) => {
        const { backendUrl } = useApiUrls();
        const [containerDimensions, setContainerDimensions] =
            useState<ContainerDimensions>({
                width: 0,
                height: 0,
            });
        const [curves, setCurves] = useState<Curve[]>([]);
        const isCtrlPressed = useRef(false);
        const containerRef = useRef<HTMLDivElement | null>(null);
        const curvesRef = useRef(curves);
        const numBins = 3200;
        const timezoneOffsetMs = new Date().getTimezoneOffset() * -60000;

        const colorList = useMemo(
            () => [
                "#1f77b4",
                "#ff7f0e",
                "#2ca02c",
                "#d62728",
                "#9467bd",
                "#8c564b",
                "#e377c2",
                "#7f7f7f",
                "#bcbd22",
                "#17becf",
            ],
            []
        );

        const colorMap = useRef<Map<string, string>>(new Map());

        const getColorForCurve = useCallback(
            (curve: Curve) => {
                const curveKey = `${curve.backend}-${Object.keys(curve.curveData.curve)[0]}-${curve.type}`;
                if (!colorMap.current.has(curveKey)) {
                    // Assign a color if not already assigned
                    const color =
                        colorList[colorMap.current.size % colorList.length];
                    colorMap.current.set(curveKey, color);
                }
                return colorMap.current.get(curveKey)!; // Ensure it has a value
            },
            [colorList]
        );

        const convertTimestamp = useCallback(
            (timestamp: string) => {
                return new Date(
                    Number(timestamp) / 1e6 + timezoneOffsetMs
                ).toISOString();
            },
            [timezoneOffsetMs]
        );

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

            if (plotCanvas.closest(".legendEntry")) {
                e.stopPropagation();
            }
        };

        useEffect(() => {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === "Control") {
                    isCtrlPressed.current = true;
                }
            };

            const handleKeyUp = (event: KeyboardEvent) => {
                if (event.key === "Control") {
                    isCtrlPressed.current = false;
                }
            };

            window.addEventListener("keydown", handleKeyDown);
            window.addEventListener("keyup", handleKeyUp);

            return () => {
                window.removeEventListener("keydown", handleKeyDown);
                window.removeEventListener("keyup", handleKeyUp);
            };
        }, []);

        // Because "autosize" is very slow, we manually update the dimensions
        useEffect(() => {
            const containerElement = containerRef.current;

            const resizeHandler = debounce(() => {
                if (containerElement) {
                    const { width, height } =
                        containerElement.getBoundingClientRect();
                    setContainerDimensions({
                        width,
                        height,
                    });
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
                    const beginTimestamp = convertTimestamp(
                        (timeValues.startTime * 1e6).toString()
                    );
                    const endTimeStamp = convertTimestamp(
                        (timeValues.endTime * 1e6).toString()
                    );

                    // Add the new channel with empty data first so it appears in the legend
                    setCurves((prevCurves) => {
                        const channelName = channel.name;
                        const existingCurveIndex = prevCurves.findIndex(
                            (curve) =>
                                curve.backend === channel.backend &&
                                channel.type === curve.type &&
                                channelName in curve.curveData.curve
                        );

                        if (existingCurveIndex === -1) {
                            return [
                                ...prevCurves,
                                {
                                    backend: channel.backend,
                                    type: channel.type,
                                    curveData: {
                                        curve: {
                                            [channelName]: {
                                                [beginTimestamp]: NaN,
                                                [endTimeStamp]: NaN,
                                            },
                                            // Empty data initially, only showing range
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
                        channels: Channel[];
                    }>(`${backendUrl}/channels/search`, {
                        params: {
                            search_text: `^${channel.name}$`,
                            allow_cached_response: false,
                        },
                    });

                    const filteredResults = searchResults.data.channels.filter(
                        (returnedChannel) =>
                            returnedChannel.backend === channel.backend &&
                            returnedChannel.name === channel.name &&
                            returnedChannel.type === channel.type
                    );

                    // Now we have our seriesId, if the channel still exists
                    if (filteredResults.length === 0) {
                        alert(
                            `Channel: ${channel.name} does not exist anymore on backend: ${channel.backend} with datatype: ${channel.type}`
                        );
                        return;
                    }

                    const seriesId = filteredResults[0].seriesId;

                    const newNumBins = (window.innerWidth ?? numBins) * 4;

                    // Now, fetch the actual data
                    const response = await axios.get<CurveData>(
                        `${backendUrl}/channels/curve`,
                        {
                            params: {
                                channel_name: seriesId,
                                begin_time: timeValues.startTime,
                                end_time: timeValues.endTime,
                                backend: channel.backend,
                                num_bins: newNumBins,
                                query_expansion: timeValues.queryExpansion,
                            },
                        }
                    );

                    const responseCurveData: CurveData = {
                        curve: {
                            [channel.name]:
                                response.data.curve[
                                seriesId
                                ],
                            [channel.name + "_min"]:
                                response.data.curve[
                                seriesId + "_min"
                                ],
                            [channel.name + "_max"]:
                                response.data.curve[
                                seriesId + "_max"
                                ],
                        },
                    };

                    // Now update the data after it is fetched
                    setCurves((prevCurves) => {
                        if (!responseCurveData.curve[channel.name]) {
                            console.log("No data for curve: " + channel.name);
                            return prevCurves;
                        }
                        const channelName = Object.keys(
                            responseCurveData.curve
                        )[0];
                        const existingCurveIndex = prevCurves.findIndex(
                            (curve) =>
                                curve.backend === channel.backend &&
                                channelName in curve.curveData.curve
                        );

                        const convertedDataPoints = Object.entries(
                            responseCurveData.curve[channelName]
                        )
                            .map(([timestamp, data]) => {
                                const convertedTimestamp =
                                    convertTimestamp(timestamp);
                                return { convertedTimestamp, data };
                            })
                            .filter(
                                ({ convertedTimestamp }) =>
                                    convertedTimestamp >= beginTimestamp &&
                                    convertedTimestamp <= endTimeStamp
                            );

                        const newDataPoints = convertedDataPoints.reduce(
                            (acc, { convertedTimestamp, data }) => {
                                acc[convertedTimestamp] = data;
                                return acc;
                            },
                            {} as { [timestamp: string]: number }
                        );

                        const updatedCurveData: CurveData = {
                            curve: {
                                [channelName]: {
                                    [beginTimestamp]: NaN,
                                    ...newDataPoints,
                                    [endTimeStamp]: NaN,
                                },
                                [channelName + "_min"]: {
                                    [beginTimestamp]: NaN,
                                    ...Object.entries(
                                        responseCurveData.curve[channelName + "_min"]
                                    )
                                        .map(([timestamp, data]) => [
                                            convertTimestamp(timestamp),
                                            data,
                                        ])
                                        .reduce(
                                            (acc, [convertedTimestamp, data]) => {
                                                acc[convertedTimestamp] = Number(data);
                                                return acc;
                                            },
                                            {} as { [timestamp: string]: number }
                                        ),
                                    [endTimeStamp]: NaN,
                                },
                                [channelName + "_max"]: {
                                    [beginTimestamp]: NaN,
                                    ...Object.entries(
                                        responseCurveData.curve[channelName + "_max"]
                                    )
                                        .map(([timestamp, data]) => [
                                            convertTimestamp(timestamp),
                                            data,
                                        ])
                                        .reduce(
                                            (acc, [convertedTimestamp, data]) => {
                                                acc[convertedTimestamp] = Number(data);
                                                return acc;
                                            },
                                            {} as { [timestamp: string]: number }
                                        ),
                                    [endTimeStamp]: NaN,
                                },
                            },
                        };

                        const updatedCurves = [...prevCurves];
                        updatedCurves[existingCurveIndex].curveData =
                            updatedCurveData;
                        return updatedCurves;
                    });
                } catch (error) {
                    console.log(error);
                }
            };

            for (const channel of channels) {
                fetchData(channel);
            }
        }, [
            channels,
            timeValues,
            timezoneOffsetMs,
            backendUrl,
            convertTimestamp,
        ]);

        const handleRelayout = (e: Readonly<Plotly.PlotRelayoutEvent>) => {
            if (isCtrlPressed.current) {
                // If ctrl is pressed update the time range to the new range
                if (e["xaxis.range[0]"] && e["xaxis.range[1]"]) {
                    timeValues.startTime = e["xaxis.range[0]"];
                    timeValues.endTime = e["xaxis.range[1]"];
                    const startUnix = new Date(timeValues.startTime).getTime();
                    const endUnix = new Date(timeValues.endTime).getTime();
                    onZoomTimeRangeChange(startUnix, endUnix);
                    return;
                }
            }
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
                    const timestampEntries = Object.entries(timestamps);
                    timestampEntries
                        .slice(1, timestampEntries.length - 1) // Exclude first and last entries since their our NaN placeholders for the range
                        .forEach(([timestamp, value]) => {
                            rows.push(
                                [backend, channel, timestamp, value].join(";")
                            );
                        });
                });
            });

            const csvContent = [headers.join(";"), ...rows].join("\n");
            const blob = new Blob([csvContent], {
                type: "text/csv",
            });

            const fileName = `curves_${new Date().toISOString()}.csv`;
            downloadBlob(blob, fileName);
        }, [downloadBlob]);

        const downloadDataJSON = useCallback(() => {
            const curves = curvesRef.current;
            const trimmedCurves = curves.map((curve) => {
                const trimmedCurveData: CurveData = {
                    curve: Object.fromEntries(
                        Object.entries(curve.curveData.curve).map(
                            ([channel, dataPoints]) => {
                                const timestamps =
                                    Object.keys(dataPoints).sort();
                                if (timestamps.length <= 2) {
                                    return [channel, {}]; // If only 1 or 2 points exist, remove all
                                }
                                // Else take all points except for the first and last ones, them being the range placeholders
                                const trimmedDataPoints = Object.fromEntries(
                                    timestamps
                                        .slice(1, -1)
                                        .map((timestamp) => [
                                            timestamp,
                                            dataPoints[timestamp],
                                        ])
                                );
                                return [channel, trimmedDataPoints];
                            }
                        )
                    ),
                };

                return { ...curve, curveData: trimmedCurveData };
            });
            const jsonContent = JSON.stringify(trimmedCurves, null, 4);
            const blob = new Blob([jsonContent], {
                type: "application/json",
            });

            const fileName = `curves_${new Date().toISOString()}.json`;
            downloadBlob(blob, fileName);
        }, [downloadBlob]);

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
                                name: `${channelName} | ${curve.backend}`,
                                yaxis: index === 0 ? "y" : `y${index + 1}`, // Assign y-axis dynamically, such that each curve has its own axis
                                line: { color: getColorForCurve(curve) },
                            })
                        ) as Plotly.Data[]
                ),
            [curves, getColorForCurve]
        );

        const layout = useMemo(() => {
            // Define dynamic y-axes using channel names
            const yAxes = curves.map((curve, curveIndex) => {
                const channelName = Object.keys(curve.curveData.curve)[0];
                return {
                    [`yaxis${curveIndex === 0 ? "" : `${curveIndex + 1}`}`]: {
                        title: {
                            text: `${channelName} | ${curve.backend}`,
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
                showlegend: false,
                uirevision: "time"
            } as Plotly.Layout;
        }, [curves, containerDimensions, index]);

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

        const handleRemoveCurve = (curveName: string) => {
            setCurves((prevCurves) =>
                prevCurves.filter(
                    (curve) =>
                        !Object.keys(curve.curveData.curve).some(
                            (name) => `${name} | ${curve.backend} | ${curve.type === "" ? "[]" : curve.type}` === curveName
                        )
                )
            );

            const updatedChannels = channels.filter(
                (channel) =>
                    `${channel.name} | ${channel.backend} | ${channel.type === "" ? "[]" : channel.type}` !== curveName
            );

            onChannelsChange(updatedChannels);
        };

        return (
            <Box
                sx={styles.containerStyles}
                onClick={handleEventPropagation}
                onMouseDown={handleEventPropagation}
                onMouseUp={handleEventPropagation}
                onMouseMove={handleEventPropagation}
                onTouchStart={handleEventPropagation}
                onTouchMove={handleEventPropagation}
                onTouchEnd={handleEventPropagation}
            >
                <Box ref={containerRef} sx={styles.plotContainerStyles}>
                    <Plot
                        data={data}
                        layout={layout}
                        config={config}
                        style={{
                            width: "100%",
                            height: "100%",
                        }}
                        onRelayout={handleRelayout}
                    />
                </Box>
                <Box sx={styles.legendStyles}>
                    <Typography variant="h5" sx={styles.legendTitleStyles}>
                        Legend
                    </Typography>
                    {curves.map((curve) => {
                        const channelName = Object.keys(
                            curve.curveData.curve
                        )[0];
                        const color = getColorForCurve(curve);
                        const label = `${channelName} | ${curve.backend} | ${curve.type === "" ? "[]" : curve.type}`;
                        return (
                            <Box
                                key={label}
                                className="legendEntry"
                                sx={styles.legendEntryStyles}
                            >
                                <span
                                    style={{
                                        display: "inline-block",
                                        width: "16px",
                                        height: "16px",
                                        backgroundColor: color,
                                        marginRight: "8px",
                                    }}
                                ></span>
                                <span>{label}</span>
                                <button
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "red",
                                        fontWeight: "bold",
                                    }}
                                    onClick={() => handleRemoveCurve(label)}
                                >
                                    ✖
                                </button>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        );
    }
);

export default PlotWidget;
