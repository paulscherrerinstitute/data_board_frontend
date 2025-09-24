import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    useTheme,
    InputLabel,
    Input,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { WaveformPreviewPopupProps } from "./WaveformPreviewPopup.types";
import * as styles from "./WaveformPreviewPopup.styles";
import { CurveMeta, CurvePoints, PlotlyHTMLElement } from "../PlotWidget.types";
import { useLocalStorage } from "../../../../helpers/useLocalStorage";
import {
    defaultCurveColors,
    defaultPlotBackgroundColor,
    defaultUseWebGL,
    defaultWatermarkOpacity,
    defaultXAxisGridColor,
    defaultYAxisGridColor,
} from "../../../../helpers/defaults";
import showSnackbarAndLog from "../../../../helpers/showSnackbar";
import Plotly from "plotly.js";
import { cloneDeep, debounce, isEqual } from "lodash";
import { formatDateWithMs } from "../../../../helpers/curveDataTransformations";

const colorScale = [
    [0.0, "rgb(255,0,0)"],
    [0.025, "rgb(255,165,0)"],
    [0.05, "rgb(255,255,0)"],
    [0.1, "rgb(0,128,0)"],
    [0.2, "rgb(144,238,144)"],
    [0.3, "rgb(173,216,230)"],
    [0.4, "rgb(135,206,235)"],
    [0.5, "rgb(0,191,255)"],
    [0.6, "rgb(70,130,180)"],
    [0.7, "rgb(123,104,238)"],
    [0.8, "rgb(147,112,219)"],
    [0.9, "rgb(75,0,130)"],
    [0.925, "rgb(238,130,238)"],
    [0.95, "rgb(255,20,147)"],
    [0.975, "rgb(199,21,133)"],
    [1.0, "rgb(128,0,128)"],
] as Plotly.ColorScale;

const colorScaleGradient = `linear-gradient(to top, ${(colorScale as [number, string][]).map(([stop, color]) => `${color} ${stop * 100}%`).join(", ")})`;

const WaveformPreviewPopup: React.FC<WaveformPreviewPopupProps> = ({
    waveformPreviewData,
    setWaveformPreviewData,
}) => {
    const theme = useTheme();

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

    const curveColor = JSON.parse(
        localStorage.getItem("curveColors") ||
            JSON.stringify(defaultCurveColors)
    )[0];

    const [yAxisTimestampsShort, setYAxisTimestampsShort] = useState<string[]>(
        []
    );
    const [yAxisIndices, setYAxisIndices] = useState<number[]>([]);
    const [yAxisTimestamps, setYAxisTimestamps] = useState<string[]>([]);
    const [visibleTimestamps, setVisibleTimestamps] = useState<string[]>([]);
    const [colorMin, setColorMin] = useState(0);
    const [colorMax, setColorMax] = useState(1);
    const [manualColorLimits, setManualColorLimits] = useState(false);

    const plotRef = useRef<PlotlyHTMLElement | null>(null);
    const previousLayoutRef = useRef<Plotly.Layout | null>(null);

    const close = useCallback(() => {
        setWaveformPreviewData(undefined);
    }, [setWaveformPreviewData]);

    const data = useMemo(() => {
        try {
            const curve = waveformPreviewData;
            if (!curve) {
                return [];
            }
            const keyName = Object.keys(curve.curveData.curve)[0];

            const baseData = (curve.curveData.curve[keyName] ||
                {}) as CurvePoints;

            const xValuesRaw = Object.keys(baseData);
            const yBase = Object.values(baseData);

            const metaData = (curve.curveData.curve[`${keyName}_meta`] ||
                {}) as CurveMeta;

            const hasPulseIds =
                metaData.pointMeta &&
                Object.values(metaData.pointMeta).some((meta) => meta.pulseId);

            const metaKeys = Object.keys(metaData.pointMeta);

            const isSingleWaveform = metaKeys.length === 1;

            let result: Plotly.Data[];

            if (isSingleWaveform) {
                const hoverText = xValuesRaw.map((timestamp, i) => {
                    let text = `${curve.name}<br>Point No.: ${timestamp.split("_").at(-1)}<br>Value: ${yBase[i]}`;

                    if (hasPulseIds) {
                        const pulseId = metaData.pointMeta[timestamp]?.pulseId;
                        if (pulseId !== undefined) {
                            text += `<br>Pulse ID: ${pulseId}`;
                        }
                    }

                    text += "<br>This curve is a waveform.<br>Waveform info:";

                    if (metaKeys.length === 1) {
                        text += `<br>   Timestamp: ${formatDateWithMs(new Date(Number(metaKeys[0]) / 1e6))}`;
                        if (hasPulseIds) {
                            const pulseId = Object.values(metaData.pointMeta)[0]
                                .pulseId;
                            if (pulseId !== undefined) {
                                text += `<br>   Pulse ID: ${pulseId}`;
                            }
                        }
                    }

                    return text;
                });

                const xValues = xValuesRaw.map((xValue) =>
                    xValue.split("_").at(-1)
                ) as string[];

                result = [
                    {
                        name: curve.name,
                        x: xValues,
                        y: yBase,
                        text: hoverText,
                        hovertemplate: "%{text}<extra></extra>",
                        type: useWebGL ? "scattergl" : "scatter",
                        mode: "lines+markers",
                        yaxis: "y",
                        line: { color: curveColor, shape: "linear" },
                    },
                ];
            } else {
                const timestamps = Object.keys(metaData.pointMeta).sort(
                    (a, b) => Number(a) - Number(b)
                );
                const convertedTimestamps = timestamps.map((timestamp) =>
                    formatDateWithMs(new Date(Number(timestamp) / 1e6))
                );
                const shortTimestamps = convertedTimestamps.map((timestamp) =>
                    timestamp.slice(11, 23)
                );
                const yTimestampIndices = Array.from(
                    { length: shortTimestamps.length },
                    (_, i) => i
                );
                setYAxisIndices(yTimestampIndices);
                setYAxisTimestampsShort(shortTimestamps);
                setYAxisTimestamps(convertedTimestamps);
                setVisibleTimestamps(convertedTimestamps);

                const waveformsMap: Record<string, [number, number][]> = {};

                for (const key in baseData) {
                    const [timestamp, indexStr] = key.split("_");
                    const index = Number(indexStr);
                    if (!waveformsMap[timestamp]) waveformsMap[timestamp] = [];
                    waveformsMap[timestamp].push([index, baseData[key]]);
                }

                const waveformsData = timestamps.map((timestamp) => {
                    const entries = waveformsMap[timestamp] || [];
                    entries.sort((a, b) => a[0] - b[0]);

                    const indices = new Array(entries.length);
                    const values = new Array(entries.length);
                    for (let i = 0; i < entries.length; i++) {
                        indices[i] = entries[i][0];
                        values[i] = entries[i][1];
                    }

                    return { indices, values };
                });

                const xIndices = waveformsData[0].indices;
                const zMatrix = waveformsData.map((wf) => wf.values);

                let zMin = Infinity;
                let zMax = -Infinity;

                for (const row of zMatrix) {
                    for (const z of row) {
                        if (z < zMin) zMin = z;
                        if (z > zMax) zMax = z;
                    }
                }

                if (
                    !manualColorLimits &&
                    (colorMin !== zMin || colorMax !== zMax)
                ) {
                    setColorMin(zMin);
                    setColorMax(zMax);
                    // Return here since the data will be recalculated either way with the new min/max
                    return [];
                }

                if (useWebGL) {
                    const traces: Plotly.Data[] = [];

                    for (let yi = 0; yi < yTimestampIndices.length; yi++) {
                        const x = [];
                        const y = [];
                        const z = [];
                        const customdata = [];

                        for (let xi = 0; xi < xIndices.length; xi++) {
                            x.push(xIndices[xi]);
                            y.push(yTimestampIndices[yi]);
                            z.push(zMatrix[yi][xi]);
                            customdata.push(convertedTimestamps[yi]);
                        }

                        traces.push({
                            type: "scatter3d",
                            mode: "lines+markers",
                            x: x,
                            y: y,
                            z: z,
                            customdata: customdata,
                            name: `Waveform ${yi}`,
                            hovertemplate:
                                "Timestamp: %{customdata}<br>Point No.: %{x}<br>Value: %{z}<extra></extra>",
                            line: {
                                color: "rgba(0, 0, 0, 1)",
                            },
                            marker: {
                                size: 3,
                                color: z,
                                colorscale: colorScale,
                                cmin: manualColorLimits ? colorMin : zMin,
                                cmax: manualColorLimits ? colorMax : zMax,
                            },
                        });
                    }
                    result = traces;
                } else {
                    result = [
                        {
                            name: curve.name,
                            y: xIndices,
                            x: convertedTimestamps,
                            z: zMatrix,
                            type: "heatmap",
                            hovertemplate:
                                "Timestamp: %{x}<br>Point No.: %{y}<br>Value: %{z}<extra></extra>",
                            transpose: true,
                            colorscale: colorScale,
                            zmin: manualColorLimits ? colorMin : zMin,
                            zmax: manualColorLimits ? colorMax : zMax,
                            showscale: false,
                        },
                    ];
                }
            }
            return result;
        } catch (error) {
            showSnackbarAndLog("Failed to parse channel data", "error", error);
        }
        return [];
    }, [
        waveformPreviewData,
        useWebGL,
        curveColor,
        colorMin,
        colorMax,
        manualColorLimits,
    ]);

    const layout = useMemo(() => {
        const maxTicks = 5;
        const totalPoints = yAxisIndices.length;

        const step = Math.max(1, Math.floor(totalPoints / maxTicks));
        const tickvals = [];
        const ticktext = [];

        for (let i = 0; i < totalPoints; i += step) {
            const tickIndex = yAxisIndices[i];
            tickvals.push(tickIndex);
            ticktext.push(yAxisTimestampsShort[tickIndex]);
        }

        // Make sure the last tick is included
        if (tickvals[tickvals.length - 1] !== totalPoints - 1) {
            const lastTickIndex = yAxisIndices.at(-1)!;
            tickvals.push(lastTickIndex);
            ticktext.push(yAxisTimestampsShort[lastTickIndex]);
        }

        return {
            scene: {
                yaxis: {
                    tickmode: "array",
                    tickvals: tickvals,
                    ticktext: ticktext,
                    gridcolor: xAxisGridColor,
                    linecolor: xAxisGridColor,
                    zerolinecolor: xAxisGridColor,
                    title: {
                        text: "Time",
                    },
                },
                xaxis: {
                    gridcolor: xAxisGridColor,
                    linecolor: xAxisGridColor,
                    zerolinecolor: xAxisGridColor,
                    title: {
                        text: "Point Index",
                    },
                },
                zaxis: {
                    gridcolor: yAxisGridColor,
                    linecolor: yAxisGridColor,
                    zerolinecolor: yAxisGridColor,
                    title: {
                        text: "Value",
                    },
                },
            },
            margin: {
                t: 50,
                pad: 0,
                ...(useWebGL &&
                    yAxisTimestampsShort.length > 1 && {
                        l: 0,
                        r: 0,
                        b: 0,
                    }),
            },
            title: {
                text: waveformPreviewData?.name,
            },
            autosize: true,
            xaxis: {
                gridcolor: xAxisGridColor,
                linecolor: xAxisGridColor,
                zerolinecolor: xAxisGridColor,
                title: {
                    text:
                        yAxisTimestampsShort.length === 1
                            ? "Point Index"
                            : "Time",
                },
                ...(yAxisTimestampsShort.length > 1 && {
                    type: "array",
                    tickmode: "date",
                    tickvals: visibleTimestamps,
                    tickformat: "%H:%M:%S.%3f",
                }),
            },
            yaxis: {
                gridcolor: yAxisGridColor,
                linecolor: yAxisGridColor,
                zerolinecolor: yAxisGridColor,
                title: {
                    text:
                        yAxisTimestampsShort.length === 1
                            ? "Value"
                            : "Point Index",
                },
            },
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
                    x: 0.5,
                    y: 1,
                    sizex: 0.2,
                    sizey: 0.2,
                    xanchor: "center",
                    yanchor: "top",
                },
            ],
        } as Plotly.Layout;
    }, [
        waveformPreviewData,
        watermarkOpacity,
        plotBackgroundColor,
        xAxisGridColor,
        yAxisGridColor,
        yAxisIndices,
        yAxisTimestampsShort,
        visibleTimestamps,
        theme,
        useWebGL,
    ]);

    const updateTimeTicks = useCallback(
        (gd: Plotly.PlotlyHTMLElement) => {
            const layoutAxis = gd.layout?.xaxis;
            if (
                !layoutAxis ||
                !layoutAxis.range ||
                !Array.isArray(layoutAxis.range)
            ) {
                return;
            }
            const [rangeStart, rangeEnd] = layoutAxis.range.map((ts) =>
                formatDateWithMs(new Date(ts))
            );

            // Filter timestamps within current range
            const visibleTicks = yAxisTimestamps.filter(
                (ts) => ts >= rangeStart && ts <= rangeEnd
            );
            if (visibleTicks.length === 0) {
                return;
            }

            // Downsample to max 5 ticks
            const maxTicks = 5;
            const step = Math.ceil(visibleTicks.length / maxTicks);
            const newTicks = visibleTicks
                .filter((_, i) => i % step === 0)
                .slice(0, maxTicks);

            // Update if changed
            if (!isEqual(newTicks, visibleTimestamps)) {
                setVisibleTimestamps(newTicks);
            }
        },
        [yAxisTimestamps, visibleTimestamps]
    );

    useEffect(() => {
        const currentPlotDiv = plotRef.current;
        if (currentPlotDiv) {
            Plotly.react(currentPlotDiv, data, layout || {}, {
                displaylogo: false,
            });
        }
    }, [data, layout]);

    useEffect(() => {
        const currentPlotDiv = plotRef.current;
        if (!currentPlotDiv) {
            return;
        }

        currentPlotDiv.on("plotly_relayout", () =>
            updateTimeTicks(currentPlotDiv)
        );
        return () => currentPlotDiv.removeAllListeners();
    }, [updateTimeTicks]);

    useEffect(() => {
        const currentPlotDiv = plotRef.current;
        if (!currentPlotDiv) return;

        const resizeObserver = new ResizeObserver(() => {
            Plotly.Plots.resize(currentPlotDiv);
        });

        resizeObserver.observe(currentPlotDiv);

        return () => resizeObserver.disconnect();
    }, [data]);

    useEffect(() => {
        const currentPlotDiv = plotRef.current;
        if (!currentPlotDiv) return;
        if (!isEqual(previousLayoutRef.current, layout)) {
            previousLayoutRef.current = cloneDeep(layout);
            const newPlotlyLayout = cloneDeep(layout);
            if (currentPlotDiv._fullLayout.xaxis?.range) {
                newPlotlyLayout.xaxis.range =
                    currentPlotDiv._fullLayout.xaxis.range;
            }
            Plotly.relayout(currentPlotDiv, newPlotlyLayout);
        }
    }, [layout]);

    const debouncedSetColorMin = useMemo(
        () =>
            debounce((val: number) => {
                setManualColorLimits(true);
                setColorMin(val);
            }, 1000),
        []
    );

    const debouncedSetColorMax = useMemo(
        () =>
            debounce((val: number) => {
                setManualColorLimits(true);
                setColorMax(val);
            }, 1000),
        []
    );

    return (
        <Box
            // Prevent manipulation of parent container (plot, content)
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onDragStart={(e) => e.stopPropagation()}
            onDragOver={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
            onDrop={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
        >
            <Dialog
                open={waveformPreviewData !== undefined}
                onClose={close}
                fullWidth
                maxWidth={false}
                sx={styles.dialogStyle}
                disablePortal
                hideBackdrop
                disableEnforceFocus
            >
                <DialogTitle>
                    Waveform Preview
                    <IconButton
                        aria-label="close"
                        onClick={close}
                        sx={styles.closeButtonStyle}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ display: "flex", height: 400, gap: 2 }}>
                    <div
                        ref={plotRef}
                        style={{
                            width:
                                yAxisTimestampsShort.length > 1
                                    ? "90%"
                                    : "100%",
                            height: "100%",
                        }}
                    />
                    {yAxisTimestampsShort.length > 1 && (
                        <Box sx={styles.colorBarContainerStyle}>
                            <Box sx={styles.colorBarLimitsContainerStyle}>
                                <InputLabel>Max</InputLabel>
                                <Input
                                    type="number"
                                    defaultValue={colorMax}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (!isNaN(val) && val > colorMin) {
                                            debouncedSetColorMax(val);
                                        }
                                    }}
                                />
                            </Box>
                            <div
                                style={{
                                    flex: 1,
                                    marginTop: 8,
                                    marginBottom: 8,
                                    width: "100%",
                                    background: colorScaleGradient,
                                    border: "1px solid #000",
                                }}
                            ></div>
                            <Box sx={styles.colorBarLimitsContainerStyle}>
                                <Input
                                    type="number"
                                    defaultValue={colorMin}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (!isNaN(val) && val < colorMax) {
                                            debouncedSetColorMin(val);
                                        }
                                    }}
                                />{" "}
                                <InputLabel>Min</InputLabel>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default WaveformPreviewPopup;
