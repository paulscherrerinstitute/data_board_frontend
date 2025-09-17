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
    defaultCloseSidebarOnOutsideClick,
    defaultCurveColors,
    defaultCurveMode,
    defaultCurveShape,
    defaultInitialSidebarState,
    defaultAdjustSidebarState,
    defaultKeepSidebarClosedAfterDrag,
    defaultPlotBackgroundColor,
    defaultTheme,
    defaultUseVirtualWebGL,
    defaultUseWebGL,
    defaultWatermarkOpacity,
    defaultWidgetHeight,
    defaultWidgetWidth,
    defaultXAxisGridColor,
    defaultYAxisGridColor,
    defaultYAxisScaling,
} from "../../helpers/defaults";
import {
    InitialSidebarState,
    InitialAdjustSidebarState,
} from "../Sidebar/Sidebar.types";
import { debounce } from "lodash";
import showSnackbarAndLog from "../../helpers/showSnackbar";
import { PlotlyHTMLElement } from "../Content/PlotWidget/PlotWidget.types";
import Plotly from "plotly.js";
import { themes, useThemeSettings } from "../../themes/themes";
import { AvailableTheme } from "../../themes/themes.types";
import {
    loadVirtualWebGLScript,
    unloadVirtualWebGLScript,
} from "../../helpers/loadVirtualWebGLScript";
import { SidebarIgnoredMenuProps } from "../../helpers/misc";

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
    const [
        initialSidebarAdjustState,
        setInitialSidebarAdjustStateStorage,
        setInitialSidebarAdjustState,
    ] = useLocalStorage("initialSidebarAdjustState", defaultAdjustSidebarState);
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
    const [useVirtualWebGL, setUseVirtualWebGLStorage, setUseVirtualWebGL] =
        useLocalStorage("useVirtualWebGL", defaultUseVirtualWebGL);
    const [
        keepSidebarClosedAfterDrag,
        setKeepSidebarClosedAfterDragStorage,
        setKeepSidebarClosedAfterDrag,
    ] = useLocalStorage(
        "keepSidebarClosedAfterDrag",
        defaultKeepSidebarClosedAfterDrag
    );

    const [
        closeSidebarOnOutsideClick,
        setCloseSidebarOnOutsideClickStorage,
        setCloseSidebarOnOutsideClick,
    ] = useLocalStorage(
        "closeSidebarOnOutsideClick",
        defaultCloseSidebarOnOutsideClick
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

    // Initially set up virtual webGL context, if applicable
    useEffect(() => {
        const localStorageEntry = localStorage.getItem("useVirtualWebGL");
        if (localStorageEntry !== null && JSON.parse(localStorageEntry)) {
            loadVirtualWebGLScript();
        } else if (defaultUseVirtualWebGL) {
            loadVirtualWebGLScript();
        }
    }, []);

    const saveAndClose = useCallback(() => {
        setInitialSidebarStateStorage(initialSidebarState);
        setInitialSidebarAdjustStateStorage(initialSidebarAdjustState);
        setWatermarkOpacityStorage(watermarkOpacity);
        setPlotBackgroundColorStorage(plotBackgroundColor);
        setXAxisGridColorStorage(xAxisGridColor);
        setYAxisGridColorStorage(yAxisGridColor);
        setUseWebGLStorage(useWebGL);
        setKeepSidebarClosedAfterDragStorage(keepSidebarClosedAfterDrag);
        setCloseSidebarOnOutsideClickStorage(closeSidebarOnOutsideClick);
        setInitialWidgetHeightStorage(initialWidgetHeight);
        setInitialWidgetWidthStorage(initialWidgetWidth);
        setCurveColorsStorage(curveColors);
        setYAxisScalingStorage(yAxisScaling);
        setCurveShapeStorage(curveShape);
        setCurveModeStorage(curveMode);

        // Apply the virtual webGL contexts, if applicable
        setUseVirtualWebGLStorage(useVirtualWebGL);
        if (useVirtualWebGL) {
            loadVirtualWebGLScript();
        } else {
            unloadVirtualWebGLScript();
        }

        setTheme(previewTheme);
        onClose();
    }, [
        initialSidebarState,
        initialSidebarAdjustState,
        watermarkOpacity,
        plotBackgroundColor,
        xAxisGridColor,
        yAxisGridColor,
        useWebGL,
        useVirtualWebGL,
        keepSidebarClosedAfterDrag,
        closeSidebarOnOutsideClick,
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
        setInitialSidebarAdjustState,
        setWatermarkOpacityStorage,
        setPlotBackgroundColorStorage,
        setXAxisGridColorStorage,
        setYAxisGridColorStorage,
        setUseWebGLStorage,
        setUseVirtualWebGLStorage,
        setKeepSidebarClosedAfterDragStorage,
        setCloseSidebarOnOutsideClickStorage,
        setInitialWidgetHeightStorage,
        setInitialWidgetWidthStorage,
        setCurveColorsStorage,
        setYAxisScalingStorage,
        setCurveShapeStorage,
        setCurveModeStorage,
    ]);

    const resetToDefaults = () => {
        setInitialSidebarState(defaultInitialSidebarState);
        setInitialSidebarAdjustState(defaultAdjustSidebarState);
        setPlotBackgroundColor(defaultPlotBackgroundColor);
        setXAxisGridColor(defaultXAxisGridColor);
        setYAxisGridColor(defaultYAxisGridColor);
        setUseWebGL(isWebGLSupported ? defaultUseWebGL : false);
        setUseVirtualWebGL(defaultUseVirtualWebGL);
        setKeepSidebarClosedAfterDrag(defaultKeepSidebarClosedAfterDrag);
        setCloseSidebarOnOutsideClick(defaultCloseSidebarOnOutsideClick);
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
            initialSidebarAdjustState,
            plotBackgroundColor,
            xAxisGridColor,
            yAxisGridColor,
            useWebGL,
            useVirtualWebGL,
            keepSidebarClosedAfterDrag,
            closeSidebarOnOutsideClick,
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
                if (imported.inisitalSidebarAdjustState !== undefined)
                    setInitialSidebarAdjustState(
                        imported.initialSidebarAdjustState
                    );
                if (imported.plotBackgroundColor !== undefined)
                    setPlotBackgroundColor(imported.plotBackgroundColor);
                if (imported.xAxisGridColor !== undefined)
                    setXAxisGridColor(imported.xAxisGridColor);
                if (imported.yAxisGridColor !== undefined)
                    setYAxisGridColor(imported.yAxisGridColor);
                if (imported.useWebGL !== undefined)
                    setUseWebGL(imported.useWebGL);
                if (imported.useVirtualWebGL !== undefined)
                    setUseVirtualWebGL(imported.useVirtualWebGL);
                if (imported.keepSidebarClosedAfterDrag !== undefined)
                    setKeepSidebarClosedAfterDrag(
                        imported.keepSidebarClosedAfterDrag
                    );
                if (imported.closeSidebarOnOutsideClick !== undefined)
                    setCloseSidebarOnOutsideClick(
                        imported.closeSidebarOnOutsideClick
                    );
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
        if (selectedTheme === "unicorn") {
            setWatermarkOpacity(1);
        }
    };

    useEffect(() => {
        if (isManualThemeChange.current) {
            setPlotBackgroundColor(
                themes[previewTheme].theme.palette!.custom.plot.background
            );
            setXAxisGridColor(
                themes[previewTheme].theme.palette!.custom.plot.xAxisGrid
            );
            setYAxisGridColor(
                themes[previewTheme].theme.palette!.custom.plot.yAxisGrid
            );
            setCurveColors(
                themes[previewTheme].theme.palette!.custom.plot.curves
            );
            isManualThemeChange.current = false;
        }
    }, [
        previewTheme,
        setPlotBackgroundColor,
        setXAxisGridColor,
        setYAxisGridColor,
        setCurveColors,
    ]);

    useEffect(() => {
        const data = Array.from({ length: 10 }, (_, idx) => {
            const offset = 10 - idx;
            const xOffset = offset * 5;
            const yOffset = offset * 100;

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
                    color: curveColors[idx % curveColors.length],
                    shape: curveShape as Plotly.ScatterLine["shape"],
                },
                name: `Curve ${idx + 1}`,
            };
        }) as Plotly.Data[];

        const layout = {
            paper_bgcolor: plotBackgroundColor,
            plot_bgcolor: plotBackgroundColor,
            xaxis: {
                gridcolor: xAxisGridColor,
                linecolor: xAxisGridColor,
                zerolinecolor: xAxisGridColor,
            },
            yaxis: {
                gridcolor: yAxisGridColor,
                linecolor: yAxisGridColor,
                zerolinecolor: yAxisGridColor,
                type: yAxisScaling as Plotly.AxisType,
            },
            images:
                watermarkOpacity > 0
                    ? [
                          {
                              layer: "below",
                              opacity: watermarkOpacity,
                              source: themes[previewTheme].theme.palette!.custom
                                  .plot.watermark,
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
            Plotly.react(plotRef.current, data, layout, config);
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

                setTimeout(() => {
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
                                if (plotRef.current) {
                                    Plotly.purge(plotRef.current);
                                }
                            }
                        },
                        { threshold: 0 }
                    ).observe(node);
                }, 100);
            }
        },
        [open, isPlotDivRendered, setIsPlotDivRendered]
    );

    return (
        <ThemeProvider theme={themes[previewTheme].theme}>
            <Dialog
                open={open}
                onClose={saveAndClose}
                fullWidth
                maxWidth={false}
                sx={styles.dialogStyle}
                className="sidebar-ignore-click-outside"
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
                                MenuProps={SidebarIgnoredMenuProps}
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
                            <Tooltip
                                title="After closing this dialog, refresh the page to make sure the new theme is applied fully."
                                arrow
                                placement="top-start"
                            >
                                <Select
                                    value={previewTheme ?? defaultTheme}
                                    onChange={(e) => {
                                        updateTheme(
                                            e.target.value as AvailableTheme
                                        );
                                    }}
                                    label="Theme"
                                    MenuProps={SidebarIgnoredMenuProps}
                                >
                                    {Object.entries(themes).map(
                                        ([key, { displayName }]) => (
                                            <MenuItem key={key} value={key}>
                                                {displayName}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </Tooltip>
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
                            <InputLabel>Adjust Sidebar</InputLabel>
                            <Tooltip title="Directs behaviour of sidebar in relation to y-axis">
                                <Select
                                    value={initialSidebarAdjustState}
                                    onChange={(e) =>
                                        setInitialSidebarAdjustState(
                                            e.target
                                                .value as InitialAdjustSidebarState
                                        )
                                    }
                                    label="Adjust Sidebar"
                                    MenuProps={SidebarIgnoredMenuProps}
                                >
                                    <MenuItem value="overlap">Overlap</MenuItem>
                                    <MenuItem value="move">
                                        Move Sidebar
                                    </MenuItem>
                                </Select>
                            </Tooltip>
                        </FormControl>
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
                                    label="Use WebGL"
                                    value={useWebGL ? "enabled" : "disabled"}
                                    onChange={(e) =>
                                        setUseWebGL(
                                            e.target.value === "enabled"
                                        )
                                    }
                                    MenuProps={SidebarIgnoredMenuProps}
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
                        <FormControl fullWidth>
                            <InputLabel>Use Virtual WebGL Contexts</InputLabel>
                            <Tooltip
                                title="If enabled, all plots will share one WebGL Context. This can fix the issue that too many WebGL Contexts are created, which can happen with many plots. To apply, you may need to refresh this browser tab."
                                arrow
                                placement="top"
                            >
                                <Select
                                    label="Use Virtual WebGL Contexts"
                                    value={
                                        useVirtualWebGL ? "enabled" : "disabled"
                                    }
                                    onChange={(e) =>
                                        setUseVirtualWebGL(
                                            e.target.value === "enabled"
                                        )
                                    }
                                    MenuProps={SidebarIgnoredMenuProps}
                                >
                                    <MenuItem value="enabled">Enabled</MenuItem>
                                    <MenuItem value="disabled">
                                        Disabled
                                    </MenuItem>
                                </Select>
                            </Tooltip>
                        </FormControl>
                        {useVirtualWebGL && (
                            <Typography
                                variant="body2"
                                sx={styles.warningStyle}
                            >
                                ⚠ This is an experimental setting using an
                                unmaintained Script. This may very well break
                                some things.
                            </Typography>
                        )}
                    </Box>

                    <Box sx={styles.settingBoxStyle}>
                        <FormControl fullWidth>
                            <InputLabel>
                                Keep Sidebar Closed after Dragging a Channel
                            </InputLabel>
                            <Tooltip
                                title="If enabled, the sidebar won't reopen after a channel(s) drag was completed. Instead, it will stay closed, even if the dragevent was cancelled."
                                arrow
                                placement="top"
                            >
                                <Select
                                    label="Keep Sidebar Closed after Dragging a Channel"
                                    value={
                                        keepSidebarClosedAfterDrag
                                            ? "enabled"
                                            : "disabled"
                                    }
                                    onChange={(e) =>
                                        setKeepSidebarClosedAfterDrag(
                                            e.target.value === "enabled"
                                        )
                                    }
                                    MenuProps={SidebarIgnoredMenuProps}
                                >
                                    <MenuItem value="enabled">Enabled</MenuItem>
                                    <MenuItem value="disabled">
                                        Disabled
                                    </MenuItem>
                                </Select>
                            </Tooltip>
                        </FormControl>
                    </Box>

                    <Box sx={styles.settingBoxStyle}>
                        <FormControl fullWidth>
                            <InputLabel>
                                Close Sidebar when Outside is Clicked
                            </InputLabel>
                            <Tooltip
                                title="If enabled, the sidebar will be collapsed on clicks outside of it."
                                arrow
                                placement="top"
                            >
                                <Select
                                    label="Close Sidebar when Outside is Clicked"
                                    value={
                                        closeSidebarOnOutsideClick
                                            ? "enabled"
                                            : "disabled"
                                    }
                                    onChange={(e) =>
                                        setCloseSidebarOnOutsideClick(
                                            e.target.value === "enabled"
                                        )
                                    }
                                    MenuProps={SidebarIgnoredMenuProps}
                                >
                                    <MenuItem value="enabled">Enabled</MenuItem>
                                    <MenuItem value="disabled">
                                        Disabled
                                    </MenuItem>
                                </Select>
                            </Tooltip>
                        </FormControl>
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
                                MenuProps={SidebarIgnoredMenuProps}
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
                                    MenuProps={SidebarIgnoredMenuProps}
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
                                    MenuProps={SidebarIgnoredMenuProps}
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
                    <Box sx={styles.ButtonBoxStyle}>
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
