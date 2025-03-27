import React from "react";
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
    defaultPlotBackgroundColor,
    defaultWidgetHeight,
    defaultWidgetWidth,
    defaultXAxisGridColor,
    defaultYAxisGridColor,
    defaultYAxisScaling,
} from "../../helpers/defaults";
import Plot from "react-plotly.js";

const GeneralSettingsPopup: React.FC<GeneralSettingsPopupProps> = ({
    open,
    onClose,
}) => {
    const [plotBackgroundColor, setPlotBackgroundColor] = useLocalStorage(
        "plotBackgroundColor",
        defaultPlotBackgroundColor
    );
    const [xAxisGridColor, setXAxisGridColor] = useLocalStorage(
        "xAxisGridColor",
        defaultXAxisGridColor
    );
    const [yAxisGridColor, setYAxisGridColor] = useLocalStorage(
        "yAxisGridColor",
        defaultYAxisGridColor
    );
    const [initialWidgetHeight, setInitialWidgetHeight] = useLocalStorage(
        "initialWidgetHeight",
        defaultWidgetHeight
    );
    const [initialWidgetWidth, setInitialWidgetWidth] = useLocalStorage(
        "initialWidgetWidth",
        defaultWidgetWidth
    );
    const [curveColors, setCurveColors] = useLocalStorage(
        "curveColors",
        defaultCurveColors
    );
    const [yAxisScaling, setYAxisScaling] = useLocalStorage(
        "yAxisScaling",
        defaultYAxisScaling
    );
    const [curveShape, setCurveShape] = useLocalStorage(
        "curveShape",
        defaultCurveShape
    );

    const [curveMode, setCurveMode] = useLocalStorage(
        "curveMode",
        defaultCurveMode
    );

    const resetToDefaults = () => {
        setPlotBackgroundColor(defaultPlotBackgroundColor);
        setXAxisGridColor(defaultXAxisGridColor);
        setYAxisGridColor(defaultYAxisGridColor);
        setInitialWidgetHeight(defaultWidgetHeight);
        setInitialWidgetWidth(defaultWidgetWidth);
        setCurveColors(defaultCurveColors);
        setYAxisScaling(defaultYAxisScaling);
        setCurveShape(defaultCurveShape);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth={false}
            sx={styles.dialogStyle}
        >
            <DialogTitle>
                Settings
                <Tooltip
                    title="These settings are only stored locally in your browser, so they will not be saved to the url, or the dashboards you export/save."
                    arrow
                >
                    <IconButton size="small">
                        <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
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
                    <Typography variant="h6">Plot Background Color</Typography>
                    <Input
                        type="color"
                        value={plotBackgroundColor}
                        onChange={(e) => setPlotBackgroundColor(e.target.value)}
                        sx={styles.colorPickerStyle}
                    ></Input>
                </Box>

                <Box sx={styles.settingBoxStyle}>
                    <Typography variant="h6">X-Axis Grid Color</Typography>
                    <Input
                        type="color"
                        value={xAxisGridColor}
                        onChange={(e) => setXAxisGridColor(e.target.value)}
                        sx={styles.colorPickerStyle}
                    ></Input>
                </Box>

                <Box sx={styles.settingBoxStyle}>
                    <Typography variant="h6">Y-Axis Grid Color</Typography>
                    <Input
                        type="color"
                        value={yAxisGridColor}
                        onChange={(e) => setYAxisGridColor(e.target.value)}
                        sx={styles.colorPickerStyle}
                    ></Input>
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
                                Math.max(1, Math.floor(Number(e.target.value)))
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
                                Math.max(1, Math.floor(Number(e.target.value)))
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
                                        const updatedColors = [...curveColors];
                                        updatedColors[index] = e.target.value;
                                        setCurveColors(updatedColors);
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
                            onChange={(e) => setYAxisScaling(e.target.value)}
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
                                onChange={(e) => setCurveShape(e.target.value)}
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
                                onChange={(e) => setCurveMode(e.target.value)}
                                label="Curve Mode"
                            >
                                <MenuItem value="lines+markers">
                                    lines and markers
                                </MenuItem>
                                <MenuItem value="markers">
                                    only markers (points)
                                </MenuItem>
                                <MenuItem value="lines">only lines</MenuItem>
                            </Select>
                        </Tooltip>
                    </FormControl>
                </Box>
                <Typography variant="h4" sx={{ marginBottom: "8px" }}>
                    Example Plot
                </Typography>
                <Plot
                    data={[
                        {
                            x: [
                                1, 50, 120, 230, 310, 450, 520, 630, 740, 850,
                                920,
                            ],
                            y: [
                                1, 100, 250, 400, 320, 510, 600, 720, 800, 910,
                                980,
                            ],
                            type: "scattergl",
                            mode: curveMode as Plotly.PlotData["mode"],
                            line: {
                                color: curveColors[0], // First curve color
                                shape: curveShape as Plotly.ScatterLine["shape"],
                            },
                            name: "Curve 1",
                        },
                        {
                            x: [
                                1, 30, 140, 260, 340, 460, 540, 650, 760, 870,
                                950,
                            ],
                            y: [
                                1, 90, 220, 390, 310, 480, 580, 690, 770, 890,
                                950,
                            ],
                            type: "scattergl",
                            mode: curveMode as Plotly.PlotData["mode"],
                            line: {
                                color: curveColors[1] || "#ff0000", // Second curve color (fallback to red)
                                shape: curveShape as Plotly.ScatterLine["shape"],
                            },
                            name: "Curve 2",
                        },
                    ]}
                    layout={{
                        paper_bgcolor: plotBackgroundColor,
                        plot_bgcolor: plotBackgroundColor,
                        xaxis: {
                            gridcolor: xAxisGridColor,
                        },
                        yaxis: {
                            gridcolor: yAxisGridColor,
                            type: yAxisScaling as Plotly.AxisType,
                        },
                    }}
                    config={{ responsive: true, displaylogo: false }}
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
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default GeneralSettingsPopup;
