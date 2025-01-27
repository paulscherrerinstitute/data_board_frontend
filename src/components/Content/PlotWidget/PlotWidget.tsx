import React, { useEffect, useMemo, useRef, useState } from "react";
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

const PlotWidget: React.FC<PlotWidgetProps> = React.memo(
    ({ channels, timeValues, index }) => {
        const plotContainerRef = useRef<HTMLDivElement | null>(null);
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
        const [xAxisTitle, setXAxisTitle] = useState("Time");

        // Prevent event bubbling if its on a draggable surface
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

                    console.log(curves);

                    // Fetch data after adding the new channel
                    const response = await axios.get<CurveData>(
                        `${backendUrl}/channels/curve`,
                        {
                            params: {
                                channel_name: channel.channelName,
                                begin_time: Math.floor(
                                    new Date(timeValues.startTime).getTime() /
                                        1000
                                ),
                                end_time: Math.floor(
                                    new Date(timeValues.endTime).getTime() /
                                        1000
                                ),
                                backend: channel.backend,
                                query_expansion: timeValues.queryExpansion,
                            },
                        }
                    );

                    // Now update the data after it is fetched
                    setCurves((prevCurves) => {
                        console.log(response.data.curve);
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

                        const convertTimestamp = (timestamp: string) => {
                            return new Date(
                                Number(timestamp) / 1e6 + 3600000
                            ).toISOString(); // Adjusting the timestamp for UTC+1 offset at PSI
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

        useEffect(() => {
            console.log("Render");
        });

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

        const handleUpdate = (eventData: any) => {
            if (eventData?.layout?.xaxis?.title?.text) {
                setXAxisTitle(eventData.layout.xaxis.title.text);
            }
        };

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
            const yAxes = curves.flatMap((curve, curveIndex) =>
                Object.keys(curve.curveData.curve).map(
                    (channelName, channelIndex) => ({
                        [`yaxis${
                            curveIndex === 0 && channelIndex === 0
                                ? ""
                                : `${curveIndex + channelIndex + 1}`
                        }`]: {
                            title: {
                                text: `${channelName} - ${curve.backend}`,
                            },
                            overlaying:
                                curveIndex === 0 && channelIndex === 0
                                    ? undefined
                                    : "y", // Overlay all except the first axis
                            side: curveIndex % 2 === 0 ? "left" : "right", // Alternate sides for clarity, starting with left
                        },
                    })
                )
            );

            return {
                title: { text: `Plot ${index}` },
                width: containerDimensions.width,
                height: containerDimensions.height,
                margin: { l: 70, r: 40, t: 50, b: 70 },
                xaxis: {
                    title: { text: xAxisTitle },
                    range: zoomState.xaxisRange,
                },
                yaxis: {
                    title: { text: "" }, // Remove the default "Click to add title"
                },
                ...Object.assign({}, ...yAxes), // Merge all y-axis definitions into layout
                showlegend: true,
            } as Plotly.Layout;
        }, [curves, containerDimensions, zoomState, xAxisTitle]);

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
                    config={{
                        edits: { titleText: true, axisTitleText: true },
                        displaylogo: false,
                    }}
                    style={{ width: "100%", height: "100%" }}
                    onRelayout={handleRelayout}
                    onDoubleClick={handleDoubleClick}
                    onUpdate={handleUpdate}
                />
            </Box>
        );
    }
);

export default PlotWidget;
