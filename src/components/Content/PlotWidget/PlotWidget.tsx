import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Box, CircularProgress, Tooltip, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {
    PlotWidgetProps,
    CurveData,
    Curve,
    ContainerDimensions,
} from "./PlotWidget.types";
import Plot from "react-plotly.js";
import { useApiUrls } from "../../ApiContext/ApiContext";
import axios, { AxiosError, AxiosResponse } from "axios";
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
        const numBins = 1000;
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

        const getLabelForChannelAttributes = useCallback(
            (name: string, backend: string, type: string) => {
                return `${name.split("|")[0].trim()} | ${backend} | ${type === "" ? "[]" : type}`;
            },
            []
        );

        const getLabelForCurve = useCallback(
            (curve: Curve) => {
                const channelName = Object.keys(curve.curveData.curve)[0]
                    .split("|")[0]
                    .trim();
                return getLabelForChannelAttributes(
                    channelName,
                    curve.backend,
                    curve.type
                );
            },
            [getLabelForChannelAttributes]
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

        const setErrorCurve = useCallback(
            (error: string, channel: Channel) => {
                setCurves((prevCurves) => {
                    const errorCurve = prevCurves.find(
                        (curve) =>
                            curve.backend === channel.backend &&
                            curve.type === channel.type &&
                            getLabelForChannelAttributes(
                                channel.name,
                                channel.backend,
                                channel.type
                            ) in curve.curveData.curve
                    );
                    if (errorCurve) {
                        errorCurve.isLoading = false;
                        errorCurve.error = error;
                    }
                    return prevCurves;
                });
            },
            [setCurves, getLabelForChannelAttributes]
        );

        const handleResponseError = useCallback(
            (error: AxiosError | any, channel: Channel) => {
                console.error(error);
                let errorMsg = error.response?.data?.detail;
                if (!errorMsg) {
                    errorMsg = error.code;
                }
                if (!errorMsg) {
                    errorMsg = error.message;
                }
                if (errorMsg) {
                    setErrorCurve(errorMsg, channel);
                    return;
                }
            },
            [setErrorCurve]
        );

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
                        const existingCurveIndex = prevCurves.findIndex(
                            (curve) =>
                                curve.backend === channel.backend &&
                                channel.type === curve.type &&
                                getLabelForChannelAttributes(
                                    channel.name,
                                    channel.backend,
                                    channel.type
                                ) in curve.curveData.curve
                        );

                        if (existingCurveIndex === -1) {
                            return [
                                ...prevCurves,
                                {
                                    backend: channel.backend,
                                    type: channel.type,
                                    curveData: {
                                        curve: {
                                            [getLabelForChannelAttributes(
                                                channel.name,
                                                channel.backend,
                                                channel.type
                                            )]: {
                                                [beginTimestamp]: NaN,
                                                [endTimeStamp]: NaN,
                                            },
                                            // Empty data initially, only showing range
                                        },
                                    },
                                    isLoading: true,
                                    error: null,
                                },
                            ];
                        } else {
                            prevCurves[existingCurveIndex].isLoading = true;
                            prevCurves[existingCurveIndex].error = null;
                        }
                        return prevCurves;
                    });

                    // Fetch data after adding the new channel
                    // First, get the seriesId by searching for the channel and filtering our values
                    let searchResults: AxiosResponse<{
                        channels: Channel[];
                    }>;

                    try {
                        searchResults = await axios.get<{
                            channels: Channel[];
                        }>(`${backendUrl}/channels/search`, {
                            params: {
                                search_text: `^${channel.name}$`,
                                allow_cached_response: false,
                            },
                        });
                    } catch (error: AxiosError | any) {
                        handleResponseError(error, channel);
                        return;
                    }

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

                    const newNumBins = window.innerWidth ?? numBins;

                    // Now, fetch the actual data
                    let response: AxiosResponse | undefined;
                    try {
                        response = await axios.get<CurveData>(
                            `${backendUrl}/channels/curve`,
                            {
                                params: {
                                    channel_name: seriesId,
                                    begin_time: timeValues.startTime,
                                    end_time: timeValues.endTime,
                                    backend: channel.backend,
                                    num_bins: newNumBins,
                                    useEventsIfBinCountTooLarge:
                                        timeValues.rawWhenSparse,
                                    removeEmptyBins: timeValues.removeEmptyBins,
                                },
                            }
                        );
                    } catch (error: AxiosError | any) {
                        handleResponseError(error, channel);
                        return;
                    }

                    const responseCurveData: CurveData = {
                        curve: {
                            [channel.name]: response?.data.curve[seriesId],
                            [channel.name + "_min"]:
                                response?.data.curve[seriesId + "_min"],
                            [channel.name + "_max"]:
                                response?.data.curve[seriesId + "_max"],
                        },
                    };

                    if (
                        !responseCurveData.curve[channel.name] ||
                        Object.keys(responseCurveData.curve[channel.name])
                            .length === 0
                    ) {
                        setErrorCurve(
                            "No data in the requested time frame",
                            channel
                        );
                        return;
                    }

                    // If min and max are missing or undefined, set them to empty objects to avoid errors
                    if (!responseCurveData.curve[channel.name + "_min"]) {
                        responseCurveData.curve[channel.name + "_min"] = {};
                    }
                    if (!responseCurveData.curve[channel.name + "_max"]) {
                        responseCurveData.curve[channel.name + "_max"] = {};
                    }

                    // Now update the data after it is fetched
                    setCurves((prevCurves) => {
                        const channelName = Object.keys(
                            responseCurveData.curve
                        )[0];
                        const keyName = getLabelForChannelAttributes(
                            channelName,
                            channel.backend,
                            channel.type
                        );
                        const existingCurveIndex = prevCurves.findIndex(
                            (curve) =>
                                curve.backend === channel.backend &&
                                keyName in curve.curveData.curve
                        );

                        const convertAndFilter = (key: string) =>
                            Object.entries(responseCurveData.curve[key])
                                .map(([timestamp, data]) => ({
                                    convertedTimestamp:
                                        convertTimestamp(timestamp),
                                    data,
                                }))
                                .filter(
                                    ({ convertedTimestamp }) =>
                                        convertedTimestamp >= beginTimestamp &&
                                        convertedTimestamp <= endTimeStamp
                                );

                        const reduceToMap = (
                            entries: {
                                convertedTimestamp: string;
                                data: number;
                            }[]
                        ) =>
                            entries.reduce(
                                (acc, { convertedTimestamp, data }) => {
                                    acc[convertedTimestamp] = data;
                                    return acc;
                                },
                                {} as {
                                    [timestamp: string]: number;
                                }
                            );

                        const convertedMeans = convertAndFilter(channelName);
                        const convertedMins = convertAndFilter(
                            channelName + "_min"
                        );
                        const convertedMaxs = convertAndFilter(
                            channelName + "_max"
                        );

                        const newMeans = reduceToMap(convertedMeans);
                        const newMins = reduceToMap(convertedMins);
                        const newMaxs = reduceToMap(convertedMaxs);

                        const updatedCurveData: CurveData = {
                            curve: {
                                [keyName]: {
                                    [beginTimestamp]: NaN,
                                    ...newMeans,
                                    [endTimeStamp]: NaN,
                                },
                                [keyName + "_min"]: {
                                    ...newMins,
                                },
                                [keyName + "_max"]: {
                                    ...newMaxs,
                                },
                            },
                        };

                        const updatedCurves = [...prevCurves];
                        if (existingCurveIndex === -1) {
                            return updatedCurves;
                        }
                        updatedCurves[existingCurveIndex].isLoading = false;
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
            getLabelForChannelAttributes,
            setErrorCurve,
            handleResponseError,
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

            const headers = [
                "Backend",
                "Channel",
                "Timestamp",
                "Mean",
                "Min",
                "Max",
            ];
            const rows: string[] = [];

            curvesData.forEach((curve) => {
                const channelKey = Object.keys(curve.curveData.curve)[0];
                const channelName = channelKey.split("|")[0].trim();
                const baseData =
                    Object.entries(curve.curveData.curve[channelKey]) || {};
                const minData =
                    Object.entries(
                        curve.curveData.curve[`${channelKey}_min`]
                    ) || {};
                const maxData =
                    Object.entries(
                        curve.curveData.curve[`${channelKey}_max`]
                    ) || {};
                // Exclude first and last entries since their our NaN placeholders for the range
                for (let i = 1; i < baseData.length - 1; i++) {
                    rows.push(
                        [
                            curve.backend,
                            channelName,
                            baseData[i] === undefined
                                ? 0
                                : (baseData[i][0] ?? 0),
                            baseData[i] === undefined
                                ? 0
                                : (baseData[i][1] ?? 0),
                            minData[i] === undefined ? 0 : (minData[i][1] ?? 0),
                            maxData[i] === undefined ? 0 : (maxData[i][1] ?? 0),
                        ].join(";")
                    );
                }
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
                                const isMin = channel.endsWith("_min");
                                const isMax = channel.endsWith("_max");

                                if (channel.includes(" | ")) {
                                    channel = channel.split(" | ")[0].trim();

                                    if (isMin) {
                                        channel += "_min";
                                    }
                                    if (isMax) {
                                        channel += "_max";
                                    }
                                }

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

                return {
                    backend: curve.backend,
                    type: curve.type,
                    curveData: trimmedCurveData,
                };
            });
            const jsonContent = JSON.stringify(trimmedCurves, null, 4);
            const blob = new Blob([jsonContent], {
                type: "application/json",
            });

            const fileName = `curves_${new Date().toISOString()}.json`;
            downloadBlob(blob, fileName);
        }, [downloadBlob]);

        const hexToRgba = (hexString: string, alpha: number) => {
            const hexValue = parseInt(hexString.slice(1), 16);
            const r = (hexValue >> 16) & 255;
            const g = (hexValue >> 8) & 255;
            const b = hexValue & 255;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const data = useMemo(() => {
            const values: Plotly.Data[] = [];
            const result: Plotly.Data[] = [];

            // If there are more than 4 curves, put everything on one axis.
            const useMultipleAxes = curves.length <= 4;
            for (let index = 0; index < curves.length; index++) {
                const curve = curves[index];
                const keyName = Object.keys(curve.curveData.curve)[0];

                if (keyName.endsWith("_min") || keyName.endsWith("_max")) {
                    continue; // Skip processing if it's a min/max entry itself
                }

                const yAxis =
                    index === 0 || !useMultipleAxes ? "y" : `y${index + 1}`;
                const color = getColorForCurve(curve);
                const label = getLabelForCurve(curve);

                const baseData = curve.curveData.curve[keyName] || {};
                const minData = curve.curveData.curve[`${keyName}_min`] || {};
                const maxData = curve.curveData.curve[`${keyName}_max`] || {};

                const xValues = Object.keys(baseData);
                const yBase = Object.values(baseData);
                const yMin = Object.values(minData);
                const yMax = Object.values(maxData);

                // Build a polygon to enclose the area between min and max
                // Then, plotly can render the area filled using scattergl. It breaks when filling tonexty while using scattergl
                // Because the x values contain two NaNs (one to mark the begin, and one for the end), slice them away, otherwise the polygon would break.
                const xPolygon = xValues
                    .slice(1, -1)
                    .concat(xValues.slice(1, -1).reverse());
                const yPolygon = yMax.concat(yMin.reverse());

                values.push({
                    name: label,
                    x: xValues,
                    y: yBase,
                    type: "scattergl",
                    mode: "lines+markers",
                    yaxis: yAxis,
                    line: { color: color },
                } as Plotly.Data);
                result.push({
                    x: xPolygon,
                    y: yPolygon,
                    type: "scattergl",
                    mode: "lines",
                    fill: "toself",
                    fillcolor: hexToRgba(color, 0.3),
                    line: { color: "transparent", shape: "vh" },
                    showlegend: false,
                    showscale: false,
                    yaxis: yAxis,
                    hoverinfo: "skip",
                } as Plotly.Data);
            }

            result.push(...values);

            return result;
        }, [curves, getColorForCurve, getLabelForCurve]);

        const layout = useMemo(() => {
            // Define dynamic y-axes using channel names
            // If more than 4 channels are used, put everything on the same axis
            const useMultipleAxes = curves.length <= 4;

            const yAxes = useMultipleAxes
                ? curves.map((curve, curveIndex) => {
                      return {
                          [`yaxis${curveIndex === 0 ? "" : `${curveIndex + 1}`}`]:
                              {
                                  title: {
                                      text: getLabelForCurve(curve),
                                  },
                                  overlaying:
                                      curveIndex === 0 ? undefined : "y", // Overlay all except the first axis, this shows all grids
                                  side: curveIndex % 2 === 0 ? "left" : "right", // Alternate sides for clarity, starting with left
                                  anchor: "free",
                                  // Calculate the position based on the index, as plotly can't do this automatically...
                                  position:
                                      curveIndex % 2 === 0
                                          ? curveIndex /
                                            (40 * (window.innerWidth / 2560))
                                          : 1 -
                                            curveIndex /
                                                (40 *
                                                    (window.innerWidth / 2560)),
                              },
                      };
                  }, [])
                : [];

            return {
                title: {
                    text: `Plot ${index}`,
                },
                width: containerDimensions.width,
                height: containerDimensions.height,
                margin: {
                    l: 70,
                    r: 40,
                    t: 50,
                    b: 70,
                },
                xaxis: {
                    title: {
                        text: "Time",
                    },
                    ...(curves.length <= 4
                        ? {
                              // Specify the width of the X axis to leave enough room for all y axes
                              domain: [
                                  0.01 +
                                      Math.ceil(curves.length / 2) /
                                          (40 * (window.innerWidth / 2560)),
                                  1.01 -
                                      Math.floor(curves.length / 2) /
                                          (40 *
                                              0.5 *
                                              (window.innerWidth / 2560)),
                              ],
                          }
                        : {}),
                },
                yaxis: {
                    title: {
                        text: "Value",
                    }, // Remove the default "Click to add title"
                },
                ...Object.assign({}, ...yAxes), // Merge all y-axis definitions into layout
                showlegend: false,
                uirevision: "time",
            } as Plotly.Layout;
        }, [curves, containerDimensions, index, getLabelForCurve]);

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

        const handleRemoveCurve = (label: string) => {
            setCurves((prevCurves) =>
                prevCurves.filter((curve) => getLabelForCurve(curve) !== label)
            );

            const updatedChannels = channels.filter(
                (channel) =>
                    getLabelForChannelAttributes(
                        channel.name,
                        channel.backend,
                        channel.type
                    ) !== label
            );

            onChannelsChange(updatedChannels);
        };

        return (
            <Box
                sx={styles.containerStyle}
                onClick={handleEventPropagation}
                onMouseDown={handleEventPropagation}
                onMouseUp={handleEventPropagation}
                onMouseMove={handleEventPropagation}
                onTouchStart={handleEventPropagation}
                onTouchMove={handleEventPropagation}
                onTouchEnd={handleEventPropagation}
            >
                <Box ref={containerRef} sx={styles.plotContainerStyle}>
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
                <Box sx={styles.legendStyle}>
                    <Typography variant="h5" sx={styles.legendTitleStyle}>
                        Legend
                    </Typography>
                    {curves.map((curve) => {
                        const color = getColorForCurve(curve);
                        const label = getLabelForCurve(curve);
                        return (
                            <Box
                                key={label}
                                className="legendEntry"
                                sx={styles.legendEntryStyle}
                            >
                                {curve.isLoading ? (
                                    <CircularProgress
                                        size="1rem"
                                        disableShrink={true}
                                        sx={styles.statusSymbolStyle}
                                    />
                                ) : curve.error ? (
                                    <Tooltip title={curve.error} arrow>
                                        <ErrorOutlineIcon color="error" />
                                    </Tooltip>
                                ) : (
                                    <span
                                        style={{
                                            display: "inline-block",
                                            width: "16px",
                                            height: "16px",
                                            backgroundColor: color,
                                            marginRight: "8px",
                                        }}
                                    ></span>
                                )}
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
