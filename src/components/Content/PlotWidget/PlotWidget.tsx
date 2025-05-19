import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Box, Typography, useTheme } from "@mui/material";
import {
    PlotWidgetProps,
    CurveData,
    Curve,
    ContainerDimensions,
    YAxisAssignment,
    CurveAttributes,
    YAxisAttributes,
    AxisLimit,
    UsedYAxis,
    CurveMeta,
    CurvePoints,
} from "./PlotWidget.types";
import { useApiUrls } from "../../ApiContext/ApiContext";
import axios, { AxiosError, AxiosResponse } from "axios";
import { cloneDeep, debounce, isEqual } from "lodash";
import * as styles from "./PlotWidget.styles";
import { Channel } from "../../Selector/Selector.types";
import gearIconWhite from "../../../media/gear_white.svg?raw";
import gearIconBlack from "../../../media/gear_black.svg?raw";
import Plotly from "plotly.js";
import { useLocalStorage } from "../../../helpers/useLocalStorage";
import {
    defaultCurveColors,
    defaultCurveMode,
    defaultCurveShape,
    defaultPlotBackgroundColor,
    defaultUseWebGL,
    defaultWatermarkOpacity,
    defaultXAxisGridColor,
    defaultYAxisGridColor,
    defaultYAxisScaling,
} from "../../../helpers/defaults";
import PlotSettingsPopup from "./PlotSettingsPopup/PlotSettingsPopup";
import { PlotSettings } from "./PlotSettingsPopup/PlotSettingsPopup.types";
import LegendEntry from "./LegendEntry/LegendEntry";
import showSnackbarAndLog, {
    logToConsole,
} from "../../../helpers/showSnackbar";
import { PlotlyHTMLElement } from "./PlotWidget.types";
import html2canvas from "html2canvas";
import {
    pearsonCoefficient,
    spearmanCoefficient,
} from "../../../helpers/correlationCoefficients";
import { TimeValues } from "../TimeSelector/TimeSelector.types";

const PlotWidget: React.FC<PlotWidgetProps> = React.memo(
    ({
        channels,
        timeValues,
        index,
        initialPlotSettings,
        onChannelsChange,
        onZoomTimeRangeChange,
        onUpdatePlotSettings,
    }) => {
        const { backendUrl } = useApiUrls();
        const [containerDimensions, setContainerDimensions] =
            useState<ContainerDimensions>({
                width: 0,
                height: 0,
            });
        const [curves, setCurves] = useState<Curve[]>([]);
        const [manualAxisAssignment, setManualAxisAssignment] = useState(false);
        const [curveAttributes, setCurveAttributes] = useState(
            new Map<string, CurveAttributes>()
        );
        const [yAxisAttributes, setYAxisAttributes] = useState<
            YAxisAttributes[]
        >(() => {
            const savedScaling = JSON.parse(
                localStorage.getItem("yAxisScaling") ||
                    JSON.stringify(defaultYAxisScaling)
            );
            return [
                {
                    label: "y1",
                    scaling: savedScaling,
                    min: null,
                    max: null,
                    displayLabel: "y1",
                    manualDisplayLabel: false,
                },
                {
                    label: "y2",
                    scaling: savedScaling,
                    min: null,
                    max: null,
                    displayLabel: "y2",
                    manualDisplayLabel: false,
                },
                {
                    label: "y3",
                    scaling: savedScaling,
                    min: null,
                    max: null,
                    displayLabel: "y3",
                    manualDisplayLabel: false,
                },
                {
                    label: "y4",
                    scaling: savedScaling,
                    min: null,
                    max: null,
                    displayLabel: "y4",
                    manualDisplayLabel: false,
                },
            ];
        });
        const [plotTitle, setPlotTitle] = useState(`New Plot`);
        const [openPlotSettings, setOpenPlotSettings] = useState(false);

        const [watermarkOpacity] = useLocalStorage(
            "watermarkOpacity",
            defaultWatermarkOpacity,
            true
        );
        const [plotBackgroundColor] = useLocalStorage(
            "plotBackgroundColor",
            defaultPlotBackgroundColor,
            true
        );
        const [xAxisGridColor] = useLocalStorage(
            "xAxisGridColor",
            defaultXAxisGridColor,
            true
        );
        const [yAxisGridColor] = useLocalStorage(
            "yAxisGridColor",
            defaultYAxisGridColor,
            true
        );
        const [useWebGL] = useLocalStorage("useWebGL", defaultUseWebGL, true);

        const theme = useTheme();

        const isCtrlPressed = useRef(false);
        const containerRef = useRef<HTMLDivElement | null>(null);
        const curvesRef = useRef(curves);
        const colorMap = useRef<Map<string, string>>(new Map());
        const previousTimeValues = useRef(timeValues);
        const plotRef = useRef<PlotlyHTMLElement | null>(null);
        const settingsInitialized = useRef(false);
        const channelsLastTimeValues = useRef<Map<string, TimeValues>>(
            new Map()
        );
        const plotlyDataRef = useRef<Plotly.Data[]>(null);
        const plotlyLayoutRef = useRef<Plotly.Layout>(null);
        const plotlyConfigRef = useRef<Plotly.Config>(null);
        const legendRef = useRef<HTMLDivElement>(null);
        const channelIdentifierMap = useRef<Map<string, string>>(new Map());
        const requestAbortControllersRef = useRef(
            new Map<string, AbortController>()
        );

        const numBins = 1000;
        const timezoneOffsetMs = new Date().getTimezoneOffset() * -60000;

        const initialCurveColors = useMemo(() => {
            return JSON.parse(
                localStorage.getItem("curveColors") ||
                    JSON.stringify(defaultCurveColors)
            );
        }, []);

        const initialCurveShape = useMemo(() => {
            return JSON.parse(
                localStorage.getItem("curveShape") ||
                    JSON.stringify(defaultCurveShape)
            );
        }, []);

        const initialCurveMode = useMemo(() => {
            return JSON.parse(
                localStorage.getItem("curveMode") ||
                    JSON.stringify(defaultCurveMode)
            );
        }, []);

        if (!settingsInitialized.current) {
            settingsInitialized.current = true;
            // Initialize the plot settings
            if (initialPlotSettings) {
                setPlotTitle(cloneDeep(initialPlotSettings.plotTitle));
                setCurveAttributes(
                    cloneDeep(initialPlotSettings.curveAttributes)
                );
                setYAxisAttributes(
                    cloneDeep(initialPlotSettings.yAxisAttributes)
                );
                setManualAxisAssignment(
                    cloneDeep(initialPlotSettings.manualAxisAssignment) || false
                );
            }
        }

        const getLabelForChannelAttributes = useCallback(
            (name: string, backend: string, type: string) => {
                return `${name.split("|")[0].trim()} | ${backend} | ${type === "" ? "unknown" : type}`;
            },
            []
        );

        const getColorForChannel = useCallback(
            (channel: Channel) => {
                const channelKey = getLabelForChannelAttributes(
                    channel.name,
                    channel.backend,
                    channel.type
                );
                if (!colorMap.current.has(channelKey)) {
                    // Assign a color if not already assigned
                    const color =
                        initialCurveColors[
                            colorMap.current.size % initialCurveColors.length
                        ];
                    colorMap.current.set(channelKey, color);
                }
                return colorMap.current.get(channelKey)!; // Ensure it has a value
            },
            [getLabelForChannelAttributes, initialCurveColors]
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
        const handleEventPropagation = (
            e: React.SyntheticEvent,
            isMouseDown: boolean = false
        ) => {
            if (isMouseDown) {
                isCtrlPressed.current = (
                    e as React.MouseEvent
                ).getModifierState("Control");
            }

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

            if (plotCanvas.closest(".modebar")) {
                e.stopPropagation();
            }
        };

        useEffect(() => {
            onUpdatePlotSettings(index, {
                plotTitle: plotTitle,
                curveAttributes: curveAttributes,
                yAxisAttributes: yAxisAttributes,
                manualAxisAssignment: manualAxisAssignment,
            });
        }, [plotTitle, curveAttributes, yAxisAttributes, manualAxisAssignment]);

        useEffect(() => {
            const newAxisOptions: YAxisAssignment[] = ["y1", "y2", "y3", "y4"];
            const newCurveAttributes = new Map<string, CurveAttributes>();
            const newYAxisAttributes = new Array(...yAxisAttributes);

            // Add new Channels, update axis assignments and labels if applicable
            channels.forEach((channel, index) => {
                const label = getLabelForChannelAttributes(
                    channel.name,
                    channel.backend,
                    channel.type
                );

                // If not already done, fetch the channel identifier (seriesId or name)
                if (!channelIdentifierMap.current.has(label)) {
                    // To ensure this is only called once, insert the name as a safe placeholder until we maybe have a seriesid
                    channelIdentifierMap.current.set(label, channel.name);

                    getChannelIdentifier(channel).then((identifier) => {
                        channelIdentifierMap.current.set(label, identifier);
                    });
                }

                if (!manualAxisAssignment || !curveAttributes.has(label)) {
                    let assignedAxis: YAxisAssignment;
                    if (channels.length > 4) {
                        assignedAxis = "y1";
                        if (!newYAxisAttributes[0].manualDisplayLabel) {
                            newYAxisAttributes[0].displayLabel =
                                "value (multiple channels)";
                        }
                    } else {
                        assignedAxis = newAxisOptions[index];
                        if (!newYAxisAttributes[index].manualDisplayLabel) {
                            newYAxisAttributes[index].displayLabel = label;
                        }
                    }

                    newCurveAttributes.set(label, {
                        channel: channel,
                        color:
                            curveAttributes.get(label)?.color ||
                            getColorForChannel(channel),
                        curveShape:
                            curveAttributes.get(label)?.curveShape ||
                            initialCurveShape,
                        curveMode:
                            curveAttributes.get(label)?.curveMode ||
                            initialCurveMode,
                        displayLabel:
                            curveAttributes.get(label)?.displayLabel || label,
                        axisAssignment: assignedAxis,
                    });
                } else {
                    // Axis-Assignment is manual, and the curve already has its attributes defined
                    newCurveAttributes.set(
                        label,
                        curveAttributes.get(label) as CurveAttributes
                    );
                }
            });

            // Compare and only update new data, to avoid endless loops
            if (
                newYAxisAttributes.length !== yAxisAttributes.length ||
                newYAxisAttributes.some((value, index) => {
                    return yAxisAttributes[index] !== value;
                })
            ) {
                setYAxisAttributes(newYAxisAttributes);
            }

            if (
                newCurveAttributes.size !== curveAttributes.size ||
                [...newCurveAttributes].some(([key, value]) => {
                    return (
                        !curveAttributes.has(key) ||
                        curveAttributes.get(key) !== value
                    );
                })
            ) {
                setCurveAttributes(newCurveAttributes);
            }
        }, [
            channels,
            getLabelForChannelAttributes,
            getColorForChannel,
            initialCurveShape,
            manualAxisAssignment,
        ]);

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
                const label = getLabelForChannelAttributes(
                    channel.name,
                    channel.backend,
                    channel.type
                );

                const errorCurve = curvesRef.current.find(
                    (curve) =>
                        curve.backend === channel.backend &&
                        curve.type === channel.type &&
                        label in curve.curveData.curve
                );

                if (errorCurve) {
                    errorCurve.isLoading = false;
                    errorCurve.error = error;
                }

                setCurves([...curvesRef.current]);
            },
            [setCurves, getLabelForChannelAttributes]
        );

        const handleResponseError = useCallback(
            (error: AxiosError | unknown, channel: Channel) => {
                if (error) {
                    let errorMsg: string | null = null;

                    if (typeof error === "object" && error !== null) {
                        if (
                            "response" in error &&
                            typeof error.response === "object" &&
                            error.response !== null
                        ) {
                            if (
                                "data" in error.response &&
                                typeof error.response.data === "object" &&
                                error.response.data !== null
                            ) {
                                if ("detail" in error.response.data) {
                                    errorMsg = error.response.data
                                        .detail as string;
                                }
                            }
                        }
                        if (!errorMsg && "code" in error) {
                            errorMsg = error.code as string;
                        }
                        if (!errorMsg && "message" in error) {
                            errorMsg = error.message as string;
                        }
                    }

                    if (errorMsg) {
                        setErrorCurve(errorMsg, channel);
                        logToConsole(errorMsg, "error", error);
                        return;
                    }
                }
            },
            [setErrorCurve]
        );

        const getChannelIdentifier = async (
            channel: Channel
        ): Promise<string> => {
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
            } catch (error: AxiosError | unknown) {
                handleResponseError(error, channel);
                return channel.name;
            }

            const filteredResults = searchResults.data.channels.filter(
                (returnedChannel) =>
                    returnedChannel.backend === channel.backend &&
                    returnedChannel.name === channel.name &&
                    returnedChannel.type === channel.type
            );

            // Now we have our seriesId, if the channel still exists
            if (filteredResults.length === 0) {
                logToConsole(
                    `Channel: ${channel.name} does not exist anymore on backend: ${channel.backend} with datatype: ${channel.type}`,
                    "error"
                );
                return channel.name;
            }
            if (filteredResults.length > 1) {
                // In that case we don't know which seriesid is the correct one
                return channel.name;
            }
            return filteredResults[0].seriesId;
        };

        function filterCurveData(
            curveData: CurveData,
            from: string,
            to: string
        ): CurveData {
            const filteredCurve: CurveData["curve"] = {};

            for (const [channelName, data] of Object.entries(curveData.curve)) {
                if (isCurvePoints(data)) {
                    const filteredPoints: CurvePoints = {};
                    for (const [timestamp, value] of Object.entries(data)) {
                        if (timestamp >= from && timestamp <= to) {
                            filteredPoints[timestamp] = value;
                        }
                    }
                    filteredCurve[channelName] = filteredPoints;
                } else {
                    const filteredPointMeta: CurveMeta["pointMeta"] = {};
                    for (const [timestamp, meta] of Object.entries(
                        data.pointMeta
                    )) {
                        if (timestamp >= from && timestamp <= to) {
                            filteredPointMeta[timestamp] = meta;
                        }
                    }
                    filteredCurve[channelName] = {
                        raw: data.raw,
                        pointMeta: filteredPointMeta,
                    };
                }
            }

            return { curve: filteredCurve };
        }

        function isCurvePoints(
            data: CurvePoints | CurveMeta
        ): data is CurvePoints {
            return typeof data !== "object" || !("raw" in data);
        }

        const fetchData = async (
            channel: Channel,
            beginTimestamp: string,
            endTimeStamp: string,
            requestSignal: AbortSignal
        ): Promise<void> => {
            const channelLabel = getLabelForChannelAttributes(
                channel.name,
                channel.backend,
                channel.type
            );

            try {
                const channelIdentifier =
                    channelIdentifierMap.current.get(channelLabel) ||
                    channel.name;

                const newNumBins = window.innerWidth ?? numBins;

                let response: AxiosResponse | undefined;
                try {
                    response = await axios.get<CurveData>(
                        `${backendUrl}/channels/curve`,
                        {
                            params: {
                                channel_name: channelIdentifier,
                                begin_time: timeValues.startTime,
                                end_time: timeValues.endTime,
                                backend: channel.backend,
                                num_bins: newNumBins,
                                useEventsIfBinCountTooLarge:
                                    timeValues.rawWhenSparse,
                                removeEmptyBins: timeValues.removeEmptyBins,
                            },
                            signal: requestSignal,
                        }
                    );
                } catch (error: AxiosError | unknown) {
                    if (axios.isCancel(error)) {
                        logToConsole("Request cancelled", "warning");
                    } else {
                        handleResponseError(error, channel);
                    }
                    return;
                }

                const responseCurveData: CurveData = {
                    curve: {
                        [channel.name]: response?.data.curve[channelIdentifier],
                        [channel.name + "_min"]:
                            response?.data.curve[channelIdentifier + "_min"],
                        [channel.name + "_max"]:
                            response?.data.curve[channelIdentifier + "_max"],
                        [channel.name + "_meta"]:
                            response?.data.curve[channelIdentifier + "_meta"],
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
                const channelName = Object.keys(responseCurveData.curve)[0];

                const convertAndFilter = (key: string) =>
                    Object.entries(responseCurveData.curve[key])
                        .map(([timestamp, data]) => ({
                            convertedTimestamp: convertTimestamp(timestamp),
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
                const convertedMins = convertAndFilter(channelName + "_min");
                const convertedMaxs = convertAndFilter(channelName + "_max");

                const newMeans = reduceToMap(convertedMeans);
                const newMins = reduceToMap(convertedMins);
                const newMaxs = reduceToMap(convertedMaxs);

                const newMeta = (() => {
                    const metaBlock =
                        responseCurveData.curve[channelName + "_meta"];
                    const raw = (metaBlock as CurveMeta).raw as boolean;

                    const pointMeta = Object.entries(metaBlock)
                        .filter(([timestamp]) => timestamp !== "raw")
                        .map(([timestamp, meta]) => ({
                            convertedTimestamp: convertTimestamp(timestamp),
                            meta: meta as {
                                count?: number;
                                pulseId?: number;
                            },
                        }))
                        .filter(
                            ({ convertedTimestamp }) =>
                                convertedTimestamp >= beginTimestamp &&
                                convertedTimestamp <= endTimeStamp
                        )
                        .reduce(
                            (acc, { convertedTimestamp, meta }) => {
                                acc[convertedTimestamp] = meta;
                                return acc;
                            },
                            {} as {
                                [timestamp: string]: {
                                    count?: number;
                                    pulseId?: number;
                                };
                            }
                        );

                    return { raw, pointMeta };
                })();

                const updatedCurveData: CurveData = {
                    curve: {
                        [channelLabel]: {
                            [beginTimestamp]: NaN,
                            ...newMeans,
                            [endTimeStamp]: NaN,
                        },
                        [channelLabel + "_min"]: {
                            ...newMins,
                        },
                        [channelLabel + "_max"]: {
                            ...newMaxs,
                        },
                        [channelLabel + "_meta"]: {
                            ...newMeta,
                        },
                    },
                };

                const existingCurveIndex = curvesRef.current.findIndex(
                    (curve) =>
                        curve.backend === channel.backend &&
                        channelLabel in curve.curveData.curve
                );
                if (existingCurveIndex === -1) {
                    return;
                }

                curvesRef.current[existingCurveIndex].isLoading = false;
                curvesRef.current[existingCurveIndex].curveData =
                    updatedCurveData;

                return;
            } catch (error) {
                logToConsole(
                    `Failed to fetch channel: ${channel.name} on backend: ${channel.backend} with datatype: ${channel.type}`,
                    "error",
                    error
                );
                channelsLastTimeValues.current.set(
                    channelLabel,
                    {} as TimeValues
                );

                return;
            }
        };

        useEffect(() => {
            const beginTimestamp = convertTimestamp(
                (timeValues.startTime * 1e6).toString()
            );
            const endTimeStamp = convertTimestamp(
                (timeValues.endTime * 1e6).toString()
            );

            for (const channel of channels) {
                const label = getLabelForChannelAttributes(
                    channel.name,
                    channel.backend,
                    channel.type
                );

                // If data has already been fetched / is currently fetching for the current timeframe, dont request again
                const lastTimeValues =
                    channelsLastTimeValues.current.get(label);
                if (isEqual(lastTimeValues, timeValues)) {
                    continue;
                }

                // Set this channel to be fetching the current timeframe
                channelsLastTimeValues.current.set(label, timeValues);

                // Cancel any previous request for this label
                const previousController =
                    requestAbortControllersRef.current.get(label);
                if (previousController) {
                    previousController.abort();
                }

                // Create new controller for this label
                const controller = new AbortController();
                requestAbortControllersRef.current.set(label, controller);

                // Add the new channel with empty data first so it appears in the legend
                const existingCurveIndex = curvesRef.current.findIndex(
                    (curve) =>
                        curve.backend === channel.backend &&
                        channel.type === curve.type &&
                        label in curve.curveData.curve
                );

                const emptyCurveData = {
                    curve: {
                        [label]: {
                            [beginTimestamp]: NaN,
                            [endTimeStamp]: NaN,
                        },
                        // Empty data initially, only showing range
                    },
                };

                if (existingCurveIndex === -1) {
                    curvesRef.current.push({
                        backend: channel.backend,
                        type: channel.type,
                        curveData: emptyCurveData,
                        isLoading: true,
                        error: null,
                    });
                } else {
                    curvesRef.current[existingCurveIndex].isLoading = true;
                    curvesRef.current[existingCurveIndex].error = null;
                    // Remove points not in the current timeframe
                    curvesRef.current[existingCurveIndex].curveData =
                        filterCurveData(
                            curvesRef.current[existingCurveIndex].curveData,
                            beginTimestamp,
                            endTimeStamp
                        );
                }
                setCurves([...curvesRef.current]);

                // Trigger fetch
                (async () => {
                    await fetchData(
                        channel,
                        beginTimestamp,
                        endTimeStamp,
                        controller.signal
                    );
                    if (controller.signal.aborted) {
                        return;
                    } else {
                        setCurves([...curvesRef.current]);
                    }
                })();
            }
        }, [
            channels,
            timeValues,
            curves,
            timezoneOffsetMs,
            backendUrl,
            convertTimestamp,
            getLabelForChannelAttributes,
            getLabelForCurve,
            setErrorCurve,
            setCurves,
            handleResponseError,
        ]);

        // Resets zoom when time values change (and ctrl isn't pressed)
        useEffect(() => {
            const previousTimeValuesRef = previousTimeValues.current;

            if (
                timeValues.startTime !== previousTimeValuesRef?.startTime ||
                timeValues.endTime !== previousTimeValuesRef?.endTime
            ) {
                const currentPlotDiv = plotRef.current;
                const currentPlotLayout = plotlyLayoutRef.current;
                if (
                    currentPlotDiv &&
                    currentPlotLayout &&
                    !isCtrlPressed.current
                ) {
                    // update the existing layout to reset the xaxis zoom
                    const newLayout = currentPlotLayout;
                    if (newLayout) {
                        newLayout.xaxis = {
                            ...newLayout.xaxis,
                            autorange: true,
                        };
                    }
                    Plotly.relayout(currentPlotDiv, newLayout);
                }
            }
            previousTimeValues.current = timeValues;
        }, [timeValues]);

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
                "Count",
                "PulseId",
            ];
            const rows: string[] = [];

            curvesData.forEach((curve) => {
                const channelKey = Object.keys(curve.curveData.curve)[0];
                const channelName = channelKey.split("|")[0].trim();
                const baseData =
                    Object.entries(curve.curveData.curve[channelKey]) || {};
                const minData = (curve.curveData.curve[`${channelKey}_min`] ||
                    {}) as CurvePoints;
                const maxData = (curve.curveData.curve[`${channelKey}_max`] ||
                    {}) as CurvePoints;
                const pointMetaData =
                    (
                        curve.curveData.curve[`${channelKey}_meta`] as
                            | CurveMeta
                            | undefined
                    )?.pointMeta || {};

                // Exclude first and last entries since their our NaN placeholders for the range
                for (let i = 1; i < baseData.length - 1; i++) {
                    const timestamp = baseData[i][0];
                    rows.push(
                        [
                            curve.backend,
                            channelName,
                            baseData[i]?.[0] ?? "",
                            baseData[i]?.[1] ?? "",
                            minData[timestamp] ?? "",
                            maxData[timestamp] ?? "",
                            pointMetaData?.[timestamp].count ?? "",
                            pointMetaData?.[timestamp].pulseId ?? "",
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
                                const isMeta = channel.endsWith("_meta");
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
                                    if (isMeta) {
                                        channel += "_meta";
                                    }
                                }

                                if (isMeta) {
                                    // Handle metadata
                                    const timestamps = Object.keys(
                                        dataPoints.pointMeta
                                    ).sort();
                                    const trimmedMetaData = Object.fromEntries(
                                        timestamps.map((timestamp) => [
                                            timestamp,
                                            (dataPoints as CurveMeta).pointMeta[
                                                timestamp
                                            ],
                                        ])
                                    );

                                    return [channel, trimmedMetaData];
                                } else {
                                    const timestamps =
                                        Object.keys(dataPoints).sort();
                                    if (timestamps.length <= 2) {
                                        return [channel, {}]; // If only 1 or 2 points exist, remove all
                                    }
                                    const trimmedDataPoints =
                                        Object.fromEntries(
                                            timestamps
                                                .slice(1, -1)
                                                .map((timestamp) => [
                                                    timestamp,
                                                    (dataPoints as CurvePoints)[
                                                        timestamp
                                                    ],
                                                ])
                                        );
                                    return [channel, trimmedDataPoints];
                                }
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

        const downloadImage = useCallback(() => {
            const plotElement = plotRef.current;
            const legendElement = legendRef.current;

            if (plotElement && legendElement) {
                try {
                    // Capture plot using Plotly's method, since html2canvas won't get our beautiful watermark (if shown)
                    Plotly.toImage(plotElement, {
                        format: "png",
                        width: null,
                        height: null,
                        scale: 4,
                    }).then((plotImgData) => {
                        // Capture the legend using html2canvas (Our custom legend is outside of Plotly, so we can't make Plotly capture it)
                        html2canvas(legendElement, {
                            scale: 4,
                        }).then((legendCanvas) => {
                            const legendImgData =
                                legendCanvas.toDataURL("image/png");

                            // Create a new canvas to combine the plot and the legend
                            const combinedCanvas =
                                document.createElement("canvas");
                            const context = combinedCanvas.getContext("2d");
                            if (!context) {
                                throw new Error("Failed to create canvas");
                            }
                            const plotImage = new Image();
                            const legendImage = new Image();

                            plotImage.onload = () => {
                                // Set the combined canvas size (plot + legend side by side)
                                combinedCanvas.width =
                                    plotImage.width + legendImage.width + 20; // Add space between the plot and legend
                                combinedCanvas.height = Math.max(
                                    plotImage.height,
                                    legendImage.height
                                ); // Take the taller height

                                // Draw the plot image on the combined canvas on the left
                                context.drawImage(plotImage, 0, 0);

                                // Draw the legend image on the combined canvas on the right
                                context.drawImage(
                                    legendImage,
                                    plotImage.width + 10,
                                    0
                                );

                                // Download the combined image
                                const combinedImgData =
                                    combinedCanvas.toDataURL("image/png");
                                const link = document.createElement("a");
                                link.href = combinedImgData;
                                link.download = `${plotTitle.replace(" ", "_") || "Plot"}.png`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            };

                            // Make sure both images load before our artistic little journey starts
                            legendImage.onload = () => {
                                plotImage.src = plotImgData;
                            };
                            legendImage.src = legendImgData;
                        });
                    });
                } catch (error) {
                    showSnackbarAndLog(
                        "Failed to create plot image, maybe just take a screenshot",
                        "error",
                        error
                    );
                }
            }
        }, [plotTitle]);

        const onPlotSettingsSave = useCallback(
            (newPlotSettings: PlotSettings) => {
                setPlotTitle(cloneDeep(newPlotSettings.plotTitle));

                if (
                    [...newPlotSettings.curveAttributes].some(
                        ([key, value]) =>
                            curveAttributes.get(key)?.axisAssignment !==
                            value.axisAssignment
                    )
                ) {
                    setManualAxisAssignment(true);
                }

                setCurveAttributes(new Map(newPlotSettings.curveAttributes));
                newPlotSettings.yAxisAttributes =
                    newPlotSettings.yAxisAttributes.map((value, index) => ({
                        ...value,
                        manualDisplayLabel:
                            value.displayLabel !==
                            yAxisAttributes[index].displayLabel
                                ? true
                                : value.manualDisplayLabel,
                    }));

                setYAxisAttributes([...newPlotSettings.yAxisAttributes]);
            },
            [curveAttributes, yAxisAttributes]
        );

        const hexToRgba = (hexString: string, alpha: number) => {
            const hexValue = parseInt(hexString.slice(1), 16);
            const r = (hexValue >> 16) & 255;
            const g = (hexValue >> 8) & 255;
            const b = hexValue & 255;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const data = useMemo(() => {
            try {
                const isCorrelationPlot = [...curveAttributes.values()].some(
                    (curveAttributes) => {
                        return curveAttributes.axisAssignment === "x";
                    }
                );

                const values: Plotly.Data[] = [];
                const result: Plotly.Data[] = [];

                if (isCorrelationPlot) {
                    const xCurveIndex = curves.findIndex((curve) => {
                        const label = getLabelForCurve(curve);
                        return (
                            curveAttributes.get(label)?.axisAssignment === "x"
                        );
                    });

                    // Check if data is loaded yet
                    if (xCurveIndex == -1) {
                        return [];
                    }

                    const xCurve = curves[xCurveIndex];
                    const xKeyName = Object.keys(xCurve.curveData.curve).find(
                        (key) =>
                            !key.endsWith("_min") &&
                            !key.endsWith("_max") &&
                            !key.endsWith("_meta")
                    );
                    if (!xKeyName) return [];

                    const xCurveData = xCurve.curveData.curve[xKeyName];
                    const xTimestamps = Object.keys(xCurveData);
                    const xValues = Object.values(xCurveData);

                    const metaData = (xCurve.curveData.curve[
                        `${xKeyName}_meta`
                    ] || {}) as CurveMeta;

                    const hasPulseIds =
                        metaData.pointMeta &&
                        Object.values(metaData.pointMeta).some(
                            (meta) => meta.pulseId
                        );

                    for (let index = 0; index < curves.length; index++) {
                        if (index === xCurveIndex) continue;

                        const curve = curves[index];
                        const keyName = Object.keys(curve.curveData.curve)[0];

                        if (
                            keyName.endsWith("_min") ||
                            keyName.endsWith("_max") ||
                            keyName.endsWith("_meta")
                        ) {
                            continue; // Skip processing if it's a min/max entry itself, or meta information
                        }

                        const baseData = curve.curveData.curve[keyName] || {};
                        const curveTimestamps = Object.keys(baseData);
                        const curveValues = Object.values(baseData);

                        let i = 0,
                            j = 0;
                        const mergedX: number[] = [];
                        const mergedY: number[] = [];

                        // Goes through the timestamps of the curve assigned to x, and the curve currently being processed in O(n)
                        // It results in a merged list, where the points are correlated, so points that have the same timestamp in both the x curve and the current curve
                        // are combined into points that take their x value from the x curve, and the y value from the current curve.
                        while (
                            i < xTimestamps.length &&
                            j < curveTimestamps.length
                        ) {
                            const xTime = xTimestamps[i];
                            const yTime = curveTimestamps[j];

                            if (xTime === yTime) {
                                mergedX.push(xValues[i]);
                                mergedY.push(curveValues[j]);
                                i++;
                                j++;
                            } else if (xTime < yTime) {
                                i++;
                            } else {
                                j++;
                            }
                        }

                        const label = getLabelForCurve(curve);
                        const displayLabel =
                            curveAttributes.get(label)?.displayLabel;
                        const color =
                            curveAttributes.get(label)?.color || "#ffffff";
                        const yAxis =
                            curveAttributes.get(label)?.axisAssignment || "y1";
                        const shape =
                            curveAttributes.get(label)?.curveShape || "label";
                        const mode =
                            curveAttributes.get(label)?.curveMode ||
                            "lines+markers";

                        // Calculate correlation coefficients.
                        const pearson: number = pearsonCoefficient(
                            cloneDeep(mergedX).slice(1, -1),
                            cloneDeep(mergedY).slice(1, -1)
                        );
                        const spearman: number = spearmanCoefficient(
                            cloneDeep(mergedX).slice(1, -1),
                            cloneDeep(mergedY).slice(1, -1)
                        );

                        const hoverText = mergedX.map((xValue, i) => {
                            let text = `${displayLabel}<br>Time: ${xTimestamps[i]}<br>x: ${xValue}<br>y: ${mergedY[i]}<br><br>Pearson: ${pearson.toFixed(3)}<br>Spearman: ${spearman.toFixed(3)}`;

                            if (hasPulseIds) {
                                const pulseId =
                                    metaData.pointMeta[xTimestamps[i]]?.pulseId;
                                if (pulseId !== undefined) {
                                    text += `<br>Pulse ID: ${pulseId}`;
                                }
                            }

                            return text;
                        });

                        values.push({
                            name: displayLabel,
                            x: mergedX,
                            y: mergedY,
                            text: hoverText,
                            hovertemplate: "%{text}<extra></extra>",
                            type: useWebGL ? "scattergl" : "scatter",
                            mode: mode,
                            yaxis: yAxis === "y1" ? "y" : yAxis,
                            line: { color: color, shape: shape },
                        } as Plotly.Data);
                    }
                } else {
                    for (let index = 0; index < curves.length; index++) {
                        const curve = curves[index];
                        const keyName = Object.keys(curve.curveData.curve)[0];

                        if (
                            keyName.endsWith("_min") ||
                            keyName.endsWith("_max") ||
                            keyName.endsWith("_meta")
                        ) {
                            continue; // Skip processing if it's a min/max entry itself, or meta information
                        }

                        const label = getLabelForCurve(curve);
                        const displayLabel =
                            curveAttributes.get(label)?.displayLabel;
                        const color =
                            curveAttributes.get(label)?.color || "#ffffff";
                        const yAxis =
                            curveAttributes.get(label)?.axisAssignment || "y1";
                        const shape =
                            curveAttributes.get(label)?.curveShape || "label";
                        const mode =
                            curveAttributes.get(label)?.curveMode ||
                            "lines+markers";

                        const baseData = curve.curveData.curve[keyName] || {};
                        const minData =
                            curve.curveData.curve[`${keyName}_min`] || {};
                        const maxData =
                            curve.curveData.curve[`${keyName}_max`] || {};

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

                        const metaData = (curve.curveData.curve[
                            `${keyName}_meta`
                        ] || {}) as CurveMeta;

                        const hasPulseIds =
                            metaData.pointMeta &&
                            Object.values(metaData.pointMeta).some(
                                (meta) => meta.pulseId
                            );

                        const hoverText = xValues.map((timestamp, i) => {
                            let text = `${displayLabel}<br>Time: ${timestamp}<br>Value: ${yBase[i]}`;

                            if (hasPulseIds) {
                                const pulseId =
                                    metaData.pointMeta[timestamp]?.pulseId;
                                if (pulseId !== undefined) {
                                    text += `<br>Pulse ID: ${pulseId}`;
                                }
                            }

                            return text;
                        });

                        values.push({
                            name: displayLabel,
                            x: xValues,
                            y: yBase,
                            text: hoverText,
                            hovertemplate: "%{text}<extra></extra>",
                            type: useWebGL ? "scattergl" : "scatter",
                            mode: mode,
                            yaxis: yAxis === "y1" ? "y" : yAxis,
                            line: { color: color, shape: shape },
                        } as Plotly.Data);
                        result.push({
                            x: xPolygon,
                            y: yPolygon,
                            type: useWebGL ? "scattergl" : "scatter",
                            mode: "lines",
                            fill: "toself",
                            fillcolor: hexToRgba(color, 0.3),
                            line: { color: "transparent", shape: "vh" },
                            showlegend: false,
                            showscale: false,
                            yaxis: yAxis === "y1" ? "y" : yAxis,
                            hoverinfo: "skip",
                        } as Plotly.Data);
                    }
                }

                result.push(...values);
                return result;
            } catch (error) {
                showSnackbarAndLog(
                    "Failed to parse channel data",
                    "error",
                    error
                );
            }
            return [];
        }, [curves, curveAttributes, useWebGL, getLabelForCurve]);

        const layout = useMemo(() => {
            const yAxes: { [key: string]: Partial<Plotly.LayoutAxis> }[] = [];

            if (!manualAxisAssignment) {
                if (channels.length > 4) {
                    // More than 4 curves: no new axes are created, they are all in one.
                } else {
                    // Sort assignments by value (alphabetically) and create axes.
                    const sortedAssignments = Array.from(
                        curveAttributes.values()
                    )
                        .map((attributes) => attributes.axisAssignment)
                        .sort((a, b) =>
                            a.localeCompare(b)
                        ) as YAxisAssignment[]; // Since the assignment is not manual, we know the X-Axis isn't assigned.

                    sortedAssignments.forEach((assignment, index) => {
                        const attributes = yAxisAttributes.find(
                            (attributes) => attributes.label === assignment
                        );

                        const scaling = attributes?.scaling || "linear";
                        const displayLabel =
                            attributes?.displayLabel || assignment;

                        const range: { [key: string]: AxisLimit[] } = {};
                        let autorange: "min" | "max" | boolean = true;
                        if (
                            attributes &&
                            (attributes.min !== null || attributes.max !== null)
                        ) {
                            if (
                                attributes.min !== null &&
                                attributes.max !== null
                            ) {
                                autorange = false;
                            } else {
                                autorange =
                                    attributes.min === null ? "min" : "max";
                            }
                            range.range = [attributes.min, attributes.max];
                        }

                        yAxes.push({
                            [`yaxis${index === 0 ? "" : index + 1}`]: {
                                type: scaling,
                                autorange: autorange,
                                gridcolor: yAxisGridColor,
                                linecolor: yAxisGridColor,
                                zerolinecolor: yAxisGridColor,
                                title: { text: displayLabel },
                                overlaying: index === 0 ? undefined : "y", // overlay all except the first axis
                                side: index % 2 === 0 ? "left" : "right", // alternate sides
                                anchor: "free",
                                position:
                                    index % 2 === 0
                                        ? index /
                                          (40 * (window.innerWidth / 2560))
                                        : 1 -
                                          index /
                                              (40 * (window.innerWidth / 2560)),
                                ...range,
                            },
                        });
                    });
                }
            } else {
                // Manual axis assignment:
                // Extract unique assignments and exclude "x"
                const uniqueAssignments = Array.from(
                    new Set(
                        Array.from(curveAttributes.values())
                            .filter(
                                (attributes) =>
                                    attributes.axisAssignment !== "x"
                            ) // Exclude "x"
                            .map(
                                (attributes) =>
                                    attributes.axisAssignment as YAxisAssignment
                            )
                        // Extract the Y-Axis assignments
                    )
                ).sort((a, b) => a.localeCompare(b)); // Sort alphabetically

                uniqueAssignments.forEach((assignment) => {
                    const index = parseInt(assignment.slice(1), 10) - 1;
                    const attributes = yAxisAttributes.find(
                        (attr) => attr.label === assignment
                    );

                    const scaling = attributes?.scaling || "linear";
                    const displayLabel = attributes?.displayLabel || assignment;

                    const range: { [key: string]: AxisLimit[] } = {};
                    let autorange: "min" | "max" | boolean = true;
                    if (
                        attributes &&
                        (attributes.min !== null || attributes.max !== null)
                    ) {
                        if (
                            attributes.min !== null &&
                            attributes.max !== null
                        ) {
                            autorange = false;
                        } else {
                            autorange = attributes.min === null ? "min" : "max";
                        }
                        range.range = [attributes.min, attributes.max];
                    }

                    yAxes.push({
                        [`yaxis${index === 0 ? "" : index + 1}`]: {
                            type: scaling,
                            autorange: autorange,
                            gridcolor: yAxisGridColor,
                            linecolor: yAxisGridColor,
                            zerolinecolor: yAxisGridColor,
                            title: { text: displayLabel },
                            overlaying: index === 0 ? undefined : "y",
                            side: index % 2 === 0 ? "left" : "right",
                            anchor: "free",
                            position:
                                index % 2 === 0
                                    ? index / (40 * (window.innerWidth / 2560))
                                    : 1 -
                                      index / (40 * (window.innerWidth / 2560)),
                            ...range,
                        },
                    });
                });
            }

            const xLabel =
                Array.from(curveAttributes).find(
                    ([, attributes]) => attributes.axisAssignment === "x"
                )?.[1].displayLabel || "Time";

            let leftYAxes = 0;
            let rightYAxes = 0;

            for (let i = 0; i < yAxes.length; i++) {
                // Extract the actual axis number from the key (e.g. "yaxis3" -> 3, "yaxis" -> 1)
                const axisKey = Object.keys(yAxes[i])[0];
                const axisNumber =
                    axisKey === "yaxis"
                        ? 1
                        : parseInt(axisKey.replace("yaxis", ""));
                const axis =
                    yAxes[i][`yaxis${axisNumber === 1 ? "" : axisNumber}`];

                if (axis?.side === "left") {
                    leftYAxes++;
                } else if (axis?.side === "right") {
                    rightYAxes++;
                }
            }

            const layout = {
                title: {
                    text: plotTitle,
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
                    gridcolor: xAxisGridColor,
                    linecolor: xAxisGridColor,
                    zerolinecolor: xAxisGridColor,
                    title: {
                        text: xLabel,
                    },
                    ...{
                        // Specify the width of the X axis to leave enough room for all y axes
                        domain: [
                            0.01 +
                                leftYAxes / (40 * (window.innerWidth / 2560)),
                            1.01 -
                                rightYAxes /
                                    (40 * 0.5 * (window.innerWidth / 2560)),
                        ],
                    },
                },
                yaxis: {
                    gridcolor: yAxisGridColor,
                    linecolor: yAxisGridColor,
                    zerolinecolor: yAxisGridColor,
                    type: yAxisAttributes[0].scaling,
                    title: {
                        text:
                            channels.length === 0
                                ? "Value"
                                : yAxisAttributes[0].displayLabel,
                    }, // Remove the default "Click to add title"
                },
                ...Object.assign({}, ...yAxes), // Merge all y-axis definitions into layout
                showlegend: false,
                uirevision: "time",
                plot_bgcolor: plotBackgroundColor,
                paper_bgcolor: plotBackgroundColor,
                font: {
                    color: theme.palette.text.primary,
                },
                images: [
                    {
                        layer: "below",
                        opacity: watermarkOpacity,
                        source: theme.palette.custom.plot.watermark,
                        xref: "paper",
                        yref: "paper",

                        ...(channels.length === 0
                            ? {
                                  x: 0.5,
                                  y: 0.5,
                                  sizex: 1,
                                  sizey: 1,
                                  xanchor: "center",
                                  yanchor: "middle",
                              }
                            : {
                                  x: 0.5,
                                  y: 1,
                                  sizex: 0.2,
                                  sizey: 0.2,
                                  xanchor: "center",
                                  yanchor: "top",
                              }),
                    },
                ],
            } as Plotly.Layout;
            return layout;
        }, [
            channels,
            containerDimensions,
            watermarkOpacity,
            plotBackgroundColor,
            manualAxisAssignment,
            curveAttributes,
            yAxisAttributes,
            xAxisGridColor,
            yAxisGridColor,
            plotTitle,
            theme,
        ]);

        const config = useMemo(() => {
            return {
                displaylogo: false,
                displayModeBar: true,
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
                                downloadDataJSON();
                            },
                        },
                    ],
                    [
                        {
                            name: "toImage",
                            title: "Download Picture of the current Plot as PNG",
                            icon: Plotly.Icons["camera"],
                            click: () => {
                                downloadImage();
                            },
                        },
                        "zoomIn2d",
                        "zoomOut2d",
                        "autoScale2d",
                        "resetScale2d",
                    ],
                    [
                        {
                            name: "plotSettings",
                            title: "Open Plot Settings",
                            icon: {
                                svg:
                                    theme.palette.mode === "dark"
                                        ? gearIconWhite
                                        : gearIconBlack,
                            },
                            click: () => setOpenPlotSettings(true),
                        },
                    ],
                ],
                doubleClick: false,
            } as Plotly.Config;
        }, [downloadDataCSV, downloadDataJSON, downloadImage, theme]);

        const handleRelayout = useCallback(
            (e: Readonly<Plotly.PlotRelayoutEvent>) => {
                if (isCtrlPressed.current) {
                    // If ctrl is pressed update the time range to the new range
                    if (e["xaxis.range[0]"] && e["xaxis.range[1]"]) {
                        timeValues.startTime = e["xaxis.range[0]"];
                        timeValues.endTime = e["xaxis.range[1]"];
                        const startUnix = new Date(
                            timeValues.startTime
                        ).getTime();
                        const endUnix = new Date(timeValues.endTime).getTime();
                        onZoomTimeRangeChange(startUnix, endUnix);
                        return;
                    }
                }
            },
            [onZoomTimeRangeChange, timeValues]
        );

        const handleDoubleClick = useCallback(() => {
            const currentPlotDiv = plotRef.current;
            if (currentPlotDiv && plotlyLayoutRef.current) {
                // Revert to saved settings
                plotlyLayoutRef.current = cloneDeep(layout);
                Plotly.relayout(currentPlotDiv, plotlyLayoutRef.current);
            }
        }, [layout]);

        useEffect(() => {
            const currentPlotDiv = plotRef.current;
            if (currentPlotDiv) {
                plotlyDataRef.current = cloneDeep(data);
                plotlyConfigRef.current = cloneDeep(config);

                Plotly.react(
                    currentPlotDiv,
                    plotlyDataRef.current,
                    plotlyLayoutRef.current || {},
                    plotlyConfigRef.current
                );

                // Unfortunately, Plotly.react invalidates our layout range, so we have to set it manually based on whatever it was previously
                // If there is no existing layout, simply emulate a double click
                if (plotlyLayoutRef.current) {
                    plotlyLayoutRef.current = cloneDeep(layout);
                    Plotly.relayout(currentPlotDiv, plotlyLayoutRef.current);
                } else {
                    handleDoubleClick();
                }
            }
        }, [data, config]);

        useEffect(() => {
            const currentPlotDiv = plotRef.current;

            if (currentPlotDiv) {
                plotlyLayoutRef.current = cloneDeep(layout);
                Plotly.relayout(currentPlotDiv, plotlyLayoutRef.current);
            }
        }, [layout]);

        useEffect(() => {
            const currentPlotDiv = plotRef.current;
            if (currentPlotDiv) {
                currentPlotDiv.on("plotly_relayout", handleRelayout);
                currentPlotDiv.on("plotly_doubleclick", handleDoubleClick);

                return () => {
                    currentPlotDiv.removeAllListeners();
                };
            }
        }, [handleRelayout, handleDoubleClick]);

        const handleRemoveCurve = (label: string) => {
            curvesRef.current = curvesRef.current.filter(
                (curve) => getLabelForCurve(curve) !== label
            );
            setCurves([...curvesRef.current]);

            // Leave the entry for the colormap and channelidentifier map, delete others
            channelsLastTimeValues.current.delete(label);
            requestAbortControllersRef.current.delete(label);

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

        function onChannelDragStart(e: React.DragEvent, curve: Curve) {
            const channel = channels.find(
                (channel) =>
                    getLabelForChannelAttributes(
                        channel.name,
                        channel.backend,
                        channel.type
                    ) === getLabelForCurve(curve)
            );
            if (!channel) {
                return;
            }
            e.dataTransfer.setData("text", JSON.stringify([channel]));

            const dragPreview = document.createElement("div");
            dragPreview.style.cssText = `
                display: flex; align-items: center; padding: 10px; width: 300px; 
                background: #333; border-radius: 5px; color: white; font-weight: bold;
            `;

            dragPreview.innerText = `${channel.name} (${channel.backend} - ${channel.type})`;

            document.body.appendChild(dragPreview);
            e.dataTransfer.setDragImage(dragPreview, 0, 0);

            // Remove the preview after the drag starts
            setTimeout(() => dragPreview.remove(), 0);
        }

        return (
            <Box
                sx={styles.containerStyle}
                onClick={handleEventPropagation}
                onMouseDown={(e) => handleEventPropagation(e, true)}
                onMouseUp={handleEventPropagation}
                onMouseMove={handleEventPropagation}
                onTouchStart={handleEventPropagation}
                onTouchMove={handleEventPropagation}
                onTouchEnd={handleEventPropagation}
            >
                <Box ref={containerRef} sx={styles.plotContainerStyle}>
                    <div
                        ref={plotRef}
                        style={{ width: "100%", height: "100%" }}
                    />
                </Box>
                <Box ref={legendRef} sx={styles.legendStyle}>
                    <Typography variant="h5" sx={styles.legendTitleStyle}>
                        Legend
                    </Typography>
                    {curves.map((curve) => {
                        const label = getLabelForCurve(curve);
                        const displayLabel =
                            curveAttributes.get(label)?.displayLabel;
                        const color = curveAttributes.get(label)?.color;

                        return (
                            <LegendEntry
                                key={label}
                                curve={curve}
                                label={label}
                                displayLabel={displayLabel}
                                color={color}
                                onChannelDragStart={onChannelDragStart}
                                handleRemoveCurve={handleRemoveCurve}
                            />
                        );
                    })}
                </Box>
                <PlotSettingsPopup
                    open={openPlotSettings}
                    onClose={() => setOpenPlotSettings(false)}
                    plotSettings={{
                        plotTitle: cloneDeep(plotTitle),
                        curveAttributes: cloneDeep(curveAttributes),
                        yAxisAttributes: cloneDeep(yAxisAttributes),
                        manualAxisAssignment: cloneDeep(manualAxisAssignment),
                    }}
                    onSave={onPlotSettingsSave}
                />
            </Box>
        );
    }
);

export default PlotWidget;
