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
    Typography,
    Box,
    Input,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tooltip,
    Button,
    ThemeProvider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { GeneralSettingsPopupProps } from "./GeneralSettingsPopup.types";
import * as styles from "./GeneralSettingsPopup.styles";
import { useLocalStorage } from "../../helpers/useLocalStorage";
import {
    defaultCurveColors,
    defaultCurveMode,
    defaultCurveShape,
    defaultInitialSidebarState,
    defaultPlotBackgroundColor,
    defaultTheme,
    defaultUseWebGL,
    defaultWatermarkOpacity,
    defaultWidgetHeight,
    defaultWidgetWidth,
    defaultXAxisGridColor,
    defaultYAxisGridColor,
    defaultYAxisScaling,
} from "../../helpers/defaults";
import { InitialSidebarState } from "../Sidebar/Sidebar.types";
import { debounce } from "lodash";
import showSnackbarAndLog from "../../helpers/showSnackbar";
import { PlotlyHTMLElement } from "../Content/PlotWidget/PlotWidget.types";
import Plotly from "plotly.js";
import { themes, useThemeSettings } from "../../themes/themes";
import { AvailableTheme } from "../../themes/themes.types";

const GeneralSettingsPopup: React.FC<GeneralSettingsPopupProps> = ({
    open,
    onClose,
}) => {
    const [isPlotDivRendered, setIsPlotDivRendered] = useState(false);

    const isWebGLSupported = useMemo(() => {
        try {
            const canvas = document.createElement("canvas");
            if (
                !window.WebGLRenderingContext ||
                (!canvas.getContext("webgl") &&
                    !canvas.getContext("experimental-webgl"))
            ) {
                return false;
            }
            return true;
        } catch {
            return false;
        }
    }, []);

    const [
        initialSidebarState,
        setInitialSidebarStateStorage,
        setInitialSidebarState,
    ] = useLocalStorage("initialSidebarState", defaultInitialSidebarState);
    const [watermarkOpacity, setWatermarkOpacityStorage, setWatermarkOpacity] =
        useLocalStorage("watermarkOpacity", defaultWatermarkOpacity);
    const [
        plotBackgroundColor,
        setPlotBackgroundColorStorage,
        setPlotBackgroundColor,
    ] = useLocalStorage("plotBackgroundColor", defaultPlotBackgroundColor);
    const debouncedSetPlotBackgroundColor = useMemo(
        () => debounce((color: string) => setPlotBackgroundColor(color), 100),
        [setPlotBackgroundColor]
    );
    const [xAxisGridColor, setXAxisGridColorStorage, setXAxisGridColor] =
        useLocalStorage("xAxisGridColor", defaultXAxisGridColor);
    const debouncedSetXAxisGridColor = useMemo(
        () => debounce((color: string) => setXAxisGridColor(color), 100),
        [setXAxisGridColor]
    );
    const [yAxisGridColor, setYAxisGridColorStorage, setYAxisGridColor] =
        useLocalStorage("yAxisGridColor", defaultYAxisGridColor);
    const debouncedSetYAxisGridColor = useMemo(
        () => debounce((color: string) => setYAxisGridColor(color), 100),
        [setYAxisGridColor]
    );
    const [useWebGL, setUseWebGLStorage, setUseWebGL] = useLocalStorage(
        "useWebGL",
        isWebGLSupported ? defaultUseWebGL : false
    );
    const [
        initialWidgetHeight,
        setInitialWidgetHeightStorage,
        setInitialWidgetHeight,
    ] = useLocalStorage("initialWidgetHeight", defaultWidgetHeight);
    const [
        initialWidgetWidth,
        setInitialWidgetWidthStorage,
        setInitialWidgetWidth,
    ] = useLocalStorage("initialWidgetWidth", defaultWidgetWidth);
    const [curveColors, setCurveColorsStorage, setCurveColors] =
        useLocalStorage("curveColors", defaultCurveColors);
    const debouncedSetCurveColors = useMemo(
        () => debounce((colors: string[]) => setCurveColors(colors), 100),
        [setCurveColors]
    );
    const [yAxisScaling, setYAxisScalingStorage, setYAxisScaling] =
        useLocalStorage("yAxisScaling", defaultYAxisScaling);
    const [curveShape, setCurveShapeStorage, setCurveShape] = useLocalStorage(
        "curveShape",
        defaultCurveShape
    );
    const [curveMode, setCurveModeStorage, setCurveMode] = useLocalStorage(
        "curveMode",
        defaultCurveMode
    );

    const fileInputRef = useRef<HTMLInputElement>(null);
    const plotRef = useRef<PlotlyHTMLElement | null>(null);

    const isManualThemeChange = useRef(false);

    const { setTheme, currentTheme } = useThemeSettings();
    const [previewTheme, setPreviewTheme] = useState<AvailableTheme>(
        currentTheme ?? defaultTheme
    );

    const saveAndClose = useCallback(() => {
        setInitialSidebarStateStorage(initialSidebarState);
        setWatermarkOpacityStorage(watermarkOpacity);
        setPlotBackgroundColorStorage(plotBackgroundColor);
        setXAxisGridColorStorage(xAxisGridColor);
        setYAxisGridColorStorage(yAxisGridColor);
        setUseWebGLStorage(useWebGL);
        setInitialWidgetHeightStorage(initialWidgetHeight);
        setInitialWidgetWidthStorage(initialWidgetWidth);
        setCurveColorsStorage(curveColors);
        setYAxisScalingStorage(yAxisScaling);
        setCurveShapeStorage(curveShape);
        setCurveModeStorage(curveMode);

        setTheme(previewTheme);
        onClose();
    }, [
        initialSidebarState,
        watermarkOpacity,
        plotBackgroundColor,
        xAxisGridColor,
        yAxisGridColor,
        useWebGL,
        initialWidgetHeight,
        initialWidgetWidth,
        curveColors,
        yAxisScaling,
        curveShape,
        curveMode,
        previewTheme,
        setTheme,
        onClose,
        setInitialSidebarStateStorage,
        setWatermarkOpacityStorage,
        setPlotBackgroundColorStorage,
        setXAxisGridColorStorage,
        setYAxisGridColorStorage,
        setUseWebGLStorage,
        setInitialWidgetHeightStorage,
        setInitialWidgetWidthStorage,
        setCurveColorsStorage,
        setYAxisScalingStorage,
        setCurveShapeStorage,
        setCurveModeStorage,
    ]);

    const resetToDefaults = () => {
        setInitialSidebarState(defaultInitialSidebarState);
        setPlotBackgroundColor(defaultPlotBackgroundColor);
        setXAxisGridColor(defaultXAxisGridColor);
        setYAxisGridColor(defaultYAxisGridColor);
        setUseWebGL(isWebGLSupported ? defaultUseWebGL : false);
        setInitialWidgetHeight(defaultWidgetHeight);
        setInitialWidgetWidth(defaultWidgetWidth);
        setCurveColors(defaultCurveColors);
        setYAxisScaling(defaultYAxisScaling);
        setCurveShape(defaultCurveShape);
        setCurveMode(defaultCurveMode);
        setPreviewTheme(defaultTheme);
        setWatermarkOpacity(defaultWatermarkOpacity);
    };

    const exportSettings = () => {
        const settings = {
            initialSidebarState,
            plotBackgroundColor,
            xAxisGridColor,
            yAxisGridColor,
            useWebGL,
            initialWidgetHeight,
            initialWidgetWidth,
            curveColors,
            yAxisScaling,
            curveShape,
            curveMode,
            previewTheme,
            watermarkOpacity,
        };
        const blob = new Blob([JSON.stringify(settings, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "settings.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target?.result as string);
                if (imported.initialSidebarState !== undefined)
                    setInitialSidebarState(imported.initialSidebarState);
                if (imported.plotBackgroundColor !== undefined)
                    setPlotBackgroundColor(imported.plotBackgroundColor);
                if (imported.xAxisGridColor !== undefined)
                    setXAxisGridColor(imported.xAxisGridColor);
                if (imported.yAxisGridColor !== undefined)
                    setYAxisGridColor(imported.yAxisGridColor);
                if (imported.useWebGL !== undefined)
                    setUseWebGL(imported.useWebGL);
                if (imported.initialWidgetHeight !== undefined)
                    setInitialWidgetHeight(imported.initialWidgetHeight);
                if (imported.initialWidgetWidth !== undefined)
                    setInitialWidgetWidth(imported.initialWidgetWidth);
                if (imported.curveColors !== undefined)
                    setCurveColors(imported.curveColors);
                if (imported.yAxisScaling !== undefined)
                    setYAxisScaling(imported.yAxisScaling);
                if (imported.curveShape !== undefined)
                    setCurveShape(imported.curveShape);
                if (imported.curveMode !== undefined)
                    setCurveMode(imported.curveMode);
                if (imported.previewTheme !== undefined) {
                    setPreviewTheme(imported.previewTheme);
                }
                if (imported.watermarkOpacity !== undefined) {
                    setWatermarkOpacity(imported.watermarkOpacity);
                }
            } catch (error) {
                showSnackbarAndLog("Failed to import settings", "error", error);
            }
        };
        reader.readAsText(file);
        // Allow re-importing the same file later if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const updateTheme = (selectedTheme: AvailableTheme) => {
        isManualThemeChange.current = true;
        setPreviewTheme(selectedTheme);
    };

    useEffect(() => {
        if (isManualThemeChange.current) {
            setPlotBackgroundColor(
                themes[previewTheme].palette!.custom.plot.background
            );
            setXAxisGridColor(
                themes[previewTheme].palette!.custom.plot.xAxisGrid
            );
            setYAxisGridColor(
                themes[previewTheme].palette!.custom.plot.yAxisGrid
            );
            isManualThemeChange.current = false;
        }
    }, [
        previewTheme,
        setPlotBackgroundColor,
        setXAxisGridColor,
        setYAxisGridColor,
    ]);

    useEffect(() => {
        const data = Array.from({ length: 8 }, (_, idx) => {
            const curveIndex = idx + 3;
            const xOffset = curveIndex * 5;
            const yOffset = curveIndex * 100;

            const baseX = [
                1, 45, 110, 220, 300, 430, 500, 610, 720, 810, 900,
            ].map((v) => v + xOffset);
            const baseY = [
                1, 95, 240, 380, 310, 490, 570, 680, 770, 860, 920,
            ].map((v) => v + yOffset);

            return {
                x: baseX,
                y: baseY,
                type: useWebGL ? "scattergl" : "scatter",
                mode: curveMode as Plotly.PlotData["mode"],
                line: {
                    color: curveColors[curveIndex % curveColors.length],
                    shape: curveShape as Plotly.ScatterLine["shape"],
                },
                name: `Curve ${curveIndex}`,
            };
        }) as Plotly.Data[];

        const layout = {
            paper_bgcolor: plotBackgroundColor,
            plot_bgcolor: plotBackgroundColor,
            xaxis: {
                gridcolor: xAxisGridColor,
            },
            yaxis: {
                gridcolor: yAxisGridColor,
                type: yAxisScaling as Plotly.AxisType,
            },
            images:
                watermarkOpacity > 0
                    ? [
                          {
                              layer: "below",
                              opacity: watermarkOpacity,
                              source: themes[previewTheme].palette!.custom.plot
                                  .watermark,
                              xref: "paper",
                              yref: "paper",
                              x: 0.5,
                              y: 0.5,
                              sizex: 1,
                              sizey: 1,
                              xanchor: "center",
                              yanchor: "middle",
                          },
                      ]
                    : undefined,
        } as Plotly.Layout;

        const config = {
            responsive: true,
            displaylogo: false,
        } as Plotly.Config;

        if (plotRef.current) {
            Plotly.newPlot(plotRef.current, data, layout, config);

            const currentPlotDiv = plotRef.current;
            return () => {
                Plotly.purge(currentPlotDiv);
            };
        }
    }, [
        useWebGL,
        curveMode,
        curveColors,
        curveShape,
        previewTheme,
        watermarkOpacity,
        plotBackgroundColor,
        xAxisGridColor,
        yAxisGridColor,
        yAxisScaling,
        isPlotDivRendered,
    ]);

    const plotRefCallback = useCallback(
        (node: PlotlyHTMLElement | null) => {
            if (node !== null) {
                plotRef.current = node;

                new IntersectionObserver(
                    ([entry]) => {
                        if (open && !isPlotDivRendered) {
                            setIsPlotDivRendered(() => {
                                if (plotRef.current) {
                                    return true;
                                } else {
                                    return entry.isIntersecting;
                                }
                            });
                        } else if (!open) {
                            setIsPlotDivRendered(false);
                        }
                    },
                    { threshold: 0 }
                ).observe(node);
            }
        },
        [open, isPlotDivRendered, setIsPlotDivRendered]
    );

    return (
        <ThemeProvider theme={themes[previewTheme]}>
            <Dialog
                open={open}
                onClose={saveAndClose}
                fullWidth
                maxWidth={false}
                sx={styles.dialogStyle}
            >
                <DialogTitle>
                    Settings
                    <Tooltip
                        title="These settings are only stored locally in your browser, so they will not be saved to the url, or the dashboards you export/save. You can, however, export these settings separately using the buttons at the bottom."
                        arrow
                    >
                        <IconButton size="small">
                            <HelpOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <IconButton
                        aria-label="close"
                        onClick={saveAndClose}
                        sx={styles.closeButtonStyle}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="h4" sx={{ marginBottom: "8px" }}>
                        General
                    </Typography>

                    <Box sx={styles.settingBoxStyle}>
                        <FormControl fullWidth>
                            <InputLabel>Initial Sidebar State</InputLabel>
                            <Select
                                value={initialSidebarState}
                                onChange={(e) =>
                                    setInitialSidebarState(
                                        e.target.value as InitialSidebarState
                                    )
                                }
                                label="Initial Sidebar State"
                            >
                                <MenuItem value="closedIfDashboard">
                                    Closed if Dashboard is Provided
                                </MenuItem>
                                <MenuItem value="alwaysOpen">
                                    Always Open
                                </MenuItem>
                                <MenuItem value="alwaysClosed">
                                    Always Closed
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={styles.settingBoxStyle}>
                        <FormControl fullWidth>
                            <InputLabel>Theme</InputLabel>
                            <Select
                                value={previewTheme ?? defaultTheme}
                                onChange={(e) => {
                                    updateTheme(
                                        e.target.value as AvailableTheme
                                    );
                                }}
                                label="Theme"
                            >
                                <MenuItem value="default">Classic</MenuItem>
                                <MenuItem value="dark">Dark</MenuItem>
                                <MenuItem value="light">Light</MenuItem>
                                <MenuItem value="highContrast">
                                    High Contrast
                                </MenuItem>
                                <MenuItem value="unicorn">Unicorn</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={styles.settingBoxStyle}>
                        <Tooltip
                            title="0 means no watermark will be visible"
                            arrow
                            placement="top"
                        >
                            <Typography variant="h6">
                                Watermark Opacity
                            </Typography>
                        </Tooltip>
                        <Input
                            type="number"
                            inputProps={{
                                min: 0,
                                max: 1,
                                step: 0.1,
                            }}
                            value={watermarkOpacity}
                            onChange={(e) => {
                                const newValue = Math.min(
                                    1,
                                    Math.max(0, Number(e.target.value))
                                );
                                setWatermarkOpacity(newValue);
                            }}
                        />
                    </Box>

                    <Box sx={styles.settingBoxStyle}>
                        <Typography variant="h6">
                            Plot Background Color
                        </Typography>
                        <Input
                            type="color"
                            value={plotBackgroundColor}
                            onChange={(e) =>
                                debouncedSetPlotBackgroundColor(e.target.value)
                            }
                            sx={styles.colorPickerStyle}
                        />
                    </Box>

                    <Box sx={styles.settingBoxStyle}>
                        <Typography variant="h6">X-Axis Grid Color</Typography>
                        <Input
                            type="color"
                            value={xAxisGridColor}
                            onChange={(e) =>
                                debouncedSetXAxisGridColor(e.target.value)
                            }
                            sx={styles.colorPickerStyle}
                        ></Input>
                    </Box>

                    <Box sx={styles.settingBoxStyle}>
                        <Typography variant="h6">Y-Axis Grid Color</Typography>
                        <Input
                            type="color"
                            value={yAxisGridColor}
                            onChange={(e) =>
                                debouncedSetYAxisGridColor(e.target.value)
                            }
                            sx={styles.colorPickerStyle}
                        ></Input>
                    </Box>

                    <Box sx={styles.settingBoxStyle}>
                        <FormControl fullWidth>
                            <InputLabel>Use WebGL</InputLabel>
                            <Tooltip
                                title="If enabled, plots will be rendered using WebGL. This is much more performant, and highly recommended. However, not all browsers support this."
                                arrow
                                placement="top"
                            >
                                <Select
                                    label="UseWebGL"
                                    value={useWebGL ? "enabled" : "disabled"}
                                    onChange={(e) =>
                                        setUseWebGL(
                                            e.target.value === "enabled"
                                        )
                                    }
                                >
                                    <MenuItem value="enabled">Enabled</MenuItem>
                                    <MenuItem value="disabled">
                                        Disabled
                                    </MenuItem>
                                </Select>
                            </Tooltip>
                        </FormControl>
                        {!isWebGLSupported && useWebGL && (
                            <Typography variant="body2" sx={styles.errorStyle}>
                                ⚠ Your browser does not meet WebGL
                                requirements. The plots will probably break.
                            </Typography>
                        )}

                        {isWebGLSupported && !useWebGL && (
                            <Typography
                                variant="body2"
                                sx={styles.warningStyle}
                            >
                                ⚠ WebGL is disabled. Enabling it can
                                drastically improve performance.
                            </Typography>
                        )}
                    </Box>

                    <Box sx={styles.settingBoxStyle}>
                        <Tooltip
                            title="Does not apply to the initial widget, but to new widgets being created"
                            arrow
                        >
                            <Typography variant="h6">
                                Initial Widget Height
                            </Typography>
                        </Tooltip>
                        <Input
                            type="number"
                            inputProps={{
                                min: 1,
                                max: 250,
                            }}
                            value={initialWidgetHeight}
                            onChange={(e) => {
                                const newValue = Math.min(
                                    250,
                                    Math.max(
                                        1,
                                        Math.floor(Number(e.target.value))
                                    )
                                );
                                setInitialWidgetHeight(newValue);
                            }}
                        />
                    </Box>

                    <Box sx={styles.settingBoxStyle}>
                        <Tooltip
                            title="Does not apply to the initial widget, but to new widgets being created"
                            arrow
                        >
                            <Typography variant="h6">
                                Initial Widget Width
                            </Typography>
                        </Tooltip>
                        <Input
                            type="number"
                            inputProps={{
                                min: 1,
                                max: 12,
                            }}
                            value={initialWidgetWidth}
                            onChange={(e) => {
                                const newValue = Math.min(
                                    12,
                                    Math.max(
                                        1,
                                        Math.floor(Number(e.target.value))
                                    )
                                );
                                setInitialWidgetWidth(newValue);
                            }}
                        />
                    </Box>

                    <Typography variant="h4" sx={{ marginBottom: "8px" }}>
                        Plot Defaults
                        <Tooltip
                            title="These settings are applied and saved for new Plots. If a Plot already exists, these defaults won't affect it."
                            arrow
                        >
                            <IconButton size="small">
                                <HelpOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Typography>

                    <Box sx={styles.settingBoxStyle}>
                        <Typography variant="h6">Curve Color Scheme</Typography>
                        <Box sx={styles.curveColorsBoxStyle}>
                            {curveColors.map((color, index) => (
                                <Box key={index} sx={{ marginBottom: "8px" }}>
                                    <Input
                                        type="color"
                                        value={color}
                                        onChange={(e) => {
                                            const updatedColors = [
                                                ...curveColors,
                                            ];
                                            updatedColors[index] =
                                                e.target.value;
                                            debouncedSetCurveColors(
                                                updatedColors
                                            );
                                        }}
                                        sx={styles.colorPickerStyle}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Box sx={styles.settingBoxStyle}>
                        <FormControl fullWidth>
                            <InputLabel>Y-Axis Scaling</InputLabel>
                            <Select
                                value={yAxisScaling}
                                onChange={(e) =>
                                    setYAxisScaling(
                                        e.target.value as Plotly.AxisType
                                    )
                                }
                                label="Y-Axis Scaling"
                            >
                                <MenuItem value="linear">Linear</MenuItem>
                                <MenuItem value="log">Log10</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={styles.settingBoxStyle}>
                        <FormControl fullWidth>
                            <InputLabel>Curve Shape</InputLabel>
                            <Tooltip
                                title="Defines the connection between data points."
                                arrow
                                placement="top"
                            >
                                <Select
                                    value={curveShape}
                                    onChange={(e) =>
                                        setCurveShape(
                                            e.target
                                                .value as Plotly.ScatterLine["shape"]
                                        )
                                    }
                                    label="Curve Shape"
                                >
                                    <MenuItem value="linear">
                                        Direct (linear)
                                    </MenuItem>
                                    <MenuItem value="hv">Digital (hv)</MenuItem>
                                    <MenuItem value="vh">vh</MenuItem>
                                    <MenuItem value="hvh">hvh</MenuItem>
                                    <MenuItem value="vhv">vhv</MenuItem>
                                </Select>
                            </Tooltip>
                        </FormControl>
                    </Box>
                    <Box sx={styles.settingBoxStyle}>
                        <FormControl fullWidth>
                            <InputLabel>Curve Mode</InputLabel>
                            <Tooltip
                                title="Defines the mode in which the data points are drawn."
                                arrow
                                placement="top"
                            >
                                <Select
                                    value={curveMode}
                                    onChange={(e) =>
                                        setCurveMode(
                                            e.target
                                                .value as Plotly.PlotData["mode"]
                                        )
                                    }
                                    label="Curve Mode"
                                >
                                    <MenuItem value="lines+markers">
                                        Lines and Markers
                                    </MenuItem>
                                    <MenuItem value="markers">
                                        Only Markers (points)
                                    </MenuItem>
                                    <MenuItem value="lines">
                                        Only Lines
                                    </MenuItem>
                                </Select>
                            </Tooltip>
                        </FormControl>
                    </Box>
                    <Typography variant="h4" sx={{ marginBottom: "8px" }}>
                        Example Plot
                    </Typography>
                    <div
                        ref={plotRefCallback}
                        style={{ width: "100%", height: "100%" }}
                    />
                    <Box sx={styles.resetButtonStyle}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={resetToDefaults}
                        >
                            Reset to Defaults
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={exportSettings}
                            sx={{ ml: 2 }}
                        >
                            Export Settings
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                if (fileInputRef.current) {
                                    fileInputRef.current.click();
                                }
                            }}
                            sx={{ ml: 2 }}
                        >
                            Import Settings
                            <input
                                type="file"
                                accept="application/json"
                                ref={fileInputRef}
                                hidden
                                onChange={importSettings}
                            />
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </ThemeProvider>
    );
};

export default GeneralSettingsPopup;
