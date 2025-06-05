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
import { cloneDeep } from "lodash";
import { convertUnixToLocalISO } from "../../../../helpers/curveDataTransformations";

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

    const [yAxisTimestamps, setYAxisTimestamps] = useState<string[]>([]);
    const [yAxisIndices, setYAxisIndices] = useState<number[]>([]);

    const plotRef = useRef<PlotlyHTMLElement | null>(null);

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
                        text += `<br>   Timestamp: ${convertUnixToLocalISO(Number(metaKeys[0]) / 1e6)}`;
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
                    convertUnixToLocalISO(Number(timestamp) / 1e6)
                );
                const yTimestampIndices = Array.from(
                    { length: convertedTimestamps.length },
                    (_, i) => i
                );
                setYAxisIndices(yTimestampIndices);
                setYAxisTimestamps(convertedTimestamps);

                const waveformsData = timestamps.map((timestamp) => {
                    const entries = Object.entries(baseData).filter(([key]) =>
                        key.startsWith(`${timestamp}_`)
                    );
                    const indexedEntries = entries.map(([key, value]) => {
                        const index = Number(key.split("_").at(-1));
                        return [index, value] as [number, number];
                    });
                    indexedEntries.sort((a, b) => a[0] - b[0]);
                    return {
                        indices: indexedEntries.map(([idx]) => idx),
                        values: indexedEntries.map(([, val]) => val),
                    };
                });
                const xIndices = waveformsData[0].indices;
                const zMatrix = waveformsData.map((wf) => wf.values);

                if (useWebGL) {
                    result = [
                        {
                            name: curve.name,
                            x: xIndices,
                            y: yTimestampIndices,
                            z: zMatrix,
                            type: "surface",
                            hovertemplate:
                                "Timestamp: %{y}<br>Point No.: %{x}<br>Value: %{z}<extra></extra>",
                        },
                    ];
                } else {
                    result = [
                        {
                            name: curve.name,
                            x: xIndices,
                            y: convertedTimestamps,
                            z: zMatrix,
                            type: "heatmap",
                            hovertemplate:
                                "Timestamp: %{y}<br>Point No.: %{x}<br>Value: %{z}<extra></extra>",
                        },
                    ];
                }
            }
            return result;
        } catch (error) {
            showSnackbarAndLog("Failed to parse channel data", "error", error);
        }
        return [];
    }, [waveformPreviewData, useWebGL, curveColor]);

    const layout = useMemo(() => {
        return {
            scene: {
                yaxis: {
                    tickvals: yAxisIndices,
                    ticktext: yAxisTimestamps,
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
            title: {
                text: waveformPreviewData?.name,
            },
            autosize: true,
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
                    text: "Point Index",
                },
            },
            yaxis: {
                gridcolor: yAxisGridColor,
                linecolor: yAxisGridColor,
                zerolinecolor: yAxisGridColor,
                type: "linear",
                title: {
                    text: "Value",
                },
            },
            showlegend: true,
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
        yAxisTimestamps,
        theme,
    ]);

    useEffect(() => {
        const currentPlotDiv = plotRef.current;
        if (currentPlotDiv) {
            Plotly.react(
                currentPlotDiv,
                cloneDeep(data),
                cloneDeep(layout) || {}
            );
        }
    }, [data]);

    useEffect(() => {
        const currentPlotDiv = plotRef.current;
        if (!currentPlotDiv) return;

        const resizeObserver = new ResizeObserver(() => {
            Plotly.Plots.resize(currentPlotDiv);
            Plotly.relayout(currentPlotDiv, cloneDeep(layout));
        });

        resizeObserver.observe(currentPlotDiv);

        return () => resizeObserver.disconnect();
    }, [layout]);

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
                <DialogContent>
                    <div
                        ref={plotRef}
                        style={{ width: "100%", height: "100%" }}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default WaveformPreviewPopup;
