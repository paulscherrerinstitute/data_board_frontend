import React, { useCallback, useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Box,
    Input,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    MenuItem,
    Select,
    Tooltip,
    Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { PlotSettingsPopupProps } from "./PlotSettingsPopup.types";
import * as styles from "./PlotSettingsPopup.styles";
import {
    CurveAttributes,
    Y_AXIS_ASSIGNMENT_OPTIONS,
    YAxisAttributes,
} from "../PlotWidget.types";
import showSnackbarAndLog from "../../../../helpers/showSnackbar";
import {
    defaultCurveColors,
    defaultCurveMode,
    defaultCurveShape,
    defaultYAxisScaling,
} from "../../../../helpers/defaults";
import { useLocalStorage } from "../../../../helpers/useLocalStorage";
import { getLabelForChannelAttributes } from "../../../../helpers/curveDataTransformations";

const PlotSettingsPopup: React.FC<PlotSettingsPopupProps> = ({
    open,
    onClose,
    plotSettings,
    onSave,
}) => {
    const [initialCurveColors] = useLocalStorage(
        "curveColors",
        defaultCurveColors,
        true
    );

    const [initialCurveShape] = useLocalStorage(
        "curveShape",
        defaultCurveShape,
        true
    );

    const [initialCurveMode] = useLocalStorage(
        "curveMode",
        defaultCurveMode,
        true
    );

    const [initialAxisScaling] = useLocalStorage(
        "yAxisScaling",
        defaultYAxisScaling,
        true
    );

    const [inputsMin, setInputsMin] = useState(
        plotSettings.yAxisAttributes.map((attributes) =>
            (attributes.min || "").toString()
        )
    );
    const [inputsMax, setInputsMax] = useState(
        plotSettings.yAxisAttributes.map((attributes) =>
            (attributes.max || "").toString()
        )
    );
    const [localPlotSettings, setLocalPlotSettings] = useState(plotSettings);

    // When the widget is opened, update the local Plot Settings
    useEffect(() => {
        if (open) {
            setLocalPlotSettings(plotSettings);

            setInputsMin(
                plotSettings.yAxisAttributes.map((attr) =>
                    (attr.min ?? "").toString()
                )
            );
            setInputsMax(
                plotSettings.yAxisAttributes.map((attr) =>
                    (attr.max ?? "").toString()
                )
            );
        }
    }, [open]);

    // For the sake of simplicity, there is no safe button, updates are applied on safe.
    const saveAndClose = useCallback(() => {
        onSave(localPlotSettings);
        onClose();
    }, [localPlotSettings, onSave, onClose]);

    const handleLimitInputChanged = useCallback(
        (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            index: number,
            inputType: "min" | "max"
        ) => {
            const value = e.target.value.trim();
            const parsedValue = parseFloat(value);
            const newValue = isNaN(parsedValue) ? null : parsedValue;

            if (inputType === "min") {
                setInputsMin((prev) => {
                    const newInputs = [...prev];
                    newInputs[index] = isNaN(parsedValue) ? "" : value;
                    return newInputs;
                });
            } else if (inputType === "max") {
                setInputsMax((prev) => {
                    const newInputs = [...prev];
                    newInputs[index] = isNaN(parsedValue) ? "" : value;
                    return newInputs;
                });
            }

            setLocalPlotSettings((prevLocalPlotSettings) => {
                const newLocalPlotSettings = { ...prevLocalPlotSettings };
                newLocalPlotSettings.yAxisAttributes[index][inputType] =
                    newValue;
                return newLocalPlotSettings;
            });
        },
        []
    );

    const handleCurveAttributesChanged = useCallback(
        (
            key: string,
            field: keyof CurveAttributes,
            value: CurveAttributes[typeof field]
        ) => {
            setLocalPlotSettings((prev) => {
                const newCurveAttributes = new Map(prev.curveAttributes);
                const attr = newCurveAttributes.get(key);
                if (attr) {
                    newCurveAttributes.set(key, { ...attr, [field]: value });
                }

                if (field === "axisAssignment") {
                    prev.manualAxisAssignment = true;
                    if (value === "x") {
                        let collidingAssignmentFound = false;
                        let notAllLinesWereMarkers = false;
                        for (const [
                            entryKey,
                            entryValue,
                        ] of newCurveAttributes.entries()) {
                            // Check if there is already another x axis assignment, and remove it
                            if (
                                entryKey != key &&
                                entryValue.axisAssignment === "x"
                            ) {
                                newCurveAttributes.set(entryKey, {
                                    ...entryValue,
                                    axisAssignment: "y1",
                                });
                                collidingAssignmentFound = true;
                            }

                            // Check if any curve has a different mode than markers, if yes reset it
                            if (entryValue.curveMode !== "markers") {
                                newCurveAttributes.set(entryKey, {
                                    ...entryValue,
                                    curveMode: "markers",
                                });
                                notAllLinesWereMarkers = true;
                            }
                        }

                        if (collidingAssignmentFound) {
                            showSnackbarAndLog(
                                "Cannot have more than one curve assigned to 'x'. Other assigned curves have been set to first axis.",
                                "warning"
                            );
                        }

                        if (notAllLinesWereMarkers) {
                            showSnackbarAndLog(
                                "By default, all curve modes have been reset to markers, since correlation plot was activated",
                                "info"
                            );
                        }
                    }
                }
                return { ...prev, curveAttributes: newCurveAttributes };
            });
        },
        []
    );

    const resetToDefaults = useCallback(() => {
        setLocalPlotSettings((prev) => {
            prev.manualAxisAssignment = false;
            prev.plotTitle = "New Plot";

            const curveLabels: string[] = [];

            prev.curveAttributes.forEach((attr, key) => {
                const label = getLabelForChannelAttributes(
                    attr.channel.name,
                    attr.channel.backend,
                    attr.channel.type
                );
                curveLabels.push(label);
                prev.curveAttributes.set(key, {
                    channel: attr.channel,
                    displayLabel: label,
                    axisAssignment: attr.axisAssignment,
                });
            });

            prev.yAxisAttributes = prev.yAxisAttributes.map((attr, index) => {
                const newAttributes: YAxisAttributes = {
                    label: attr.label,
                    min: null,
                    max: null,
                    displayLabel: Y_AXIS_ASSIGNMENT_OPTIONS[index],
                    manualDisplayLabel: false,
                };

                if (curveLabels.length <= 4 && index < curveLabels.length) {
                    newAttributes.displayLabel = curveLabels[index];
                } else if (index === 0) {
                    newAttributes.displayLabel = "value (multiple channels)";
                }

                return newAttributes;
            });

            return { ...prev };
        });

        setInputsMin(["", "", "", ""]);
        setInputsMax(["", "", "", ""]);
    }, []);

    const curveShapeOptions = [
        { value: "linear", label: "Direct (linear)" },
        { value: "hv", label: "Digital (hv)" },
        { value: "vh", label: "vh" },
        { value: "hvh", label: "hvh" },
        { value: "vhv", label: "vhv" },
    ] as const;

    const curveModeOptions = [
        { value: "lines+markers", label: "Lines and Markers" },
        { value: "markers", label: "Only Markers (points)" },
        { value: "lines", label: "Only Lines" },
    ] as const;

    const axisAssignmentOptions = [
        { value: "x", label: "x" },
        { value: "y1", label: "y1" },
        { value: "y2", label: "y2" },
        { value: "y3", label: "y3" },
        { value: "y4", label: "y4" },
    ] as const;

    const axisScalingOptions = [
        { value: "linear", label: "Linear" },
        { value: "log", label: "Log10" },
    ] as const;

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
                open={open}
                onClose={saveAndClose}
                fullWidth
                maxWidth={false}
                sx={styles.dialogStyle}
            >
                <DialogTitle>
                    Plot Settings
                    <IconButton
                        aria-label="close"
                        onClick={saveAndClose}
                        sx={styles.closeButtonStyle}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={styles.settingBoxStyle}>
                        <Typography variant="h6">Plot Title</Typography>
                        <Input
                            type="text"
                            value={localPlotSettings.plotTitle}
                            onChange={(e) =>
                                setLocalPlotSettings(
                                    (prevLocalPlotSettings) => ({
                                        ...prevLocalPlotSettings,
                                        plotTitle: e.target.value,
                                    })
                                )
                            }
                            sx={styles.textFieldStyle}
                        ></Input>
                    </Box>
                    <Box sx={styles.settingBoxStyle}>
                        <Box sx={styles.tableContainerStyle}>
                            <Typography variant="h6">Curve Settings</Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Color</TableCell>
                                            <TableCell>Curve Shape</TableCell>
                                            <TableCell>Curve Mode</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Backend</TableCell>
                                            <TableCell>Datatype</TableCell>
                                            <TableCell>Shape</TableCell>
                                            <TableCell>Label</TableCell>
                                            <TableCell>Axis</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Array.from(
                                            localPlotSettings.curveAttributes.entries()
                                        ).map(([key, attr], index) => (
                                            <TableRow key={key}>
                                                <TableCell>
                                                    <Input
                                                        type="color"
                                                        defaultValue={
                                                            attr.color ||
                                                            initialCurveColors[
                                                                index %
                                                                    initialCurveColors.length
                                                            ]
                                                        }
                                                        sx={{
                                                            ...styles.colorPickerStyle,
                                                            border: attr.color
                                                                ? "2px solid #000"
                                                                : undefined,
                                                        }}
                                                        onBlur={(e) =>
                                                            handleCurveAttributesChanged(
                                                                key,
                                                                "color",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Tooltip
                                                        title="Defines the connection between data points."
                                                        arrow
                                                        placement="top"
                                                    >
                                                        <Select
                                                            value={
                                                                attr.curveShape ||
                                                                initialCurveShape
                                                            }
                                                            style={{
                                                                fontWeight:
                                                                    attr.curveShape
                                                                        ? "bold"
                                                                        : "normal",
                                                            }}
                                                            onChange={(e) =>
                                                                handleCurveAttributesChanged(
                                                                    key,
                                                                    "curveShape",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            {curveShapeOptions.map(
                                                                ({
                                                                    value,
                                                                    label,
                                                                }) => (
                                                                    <MenuItem
                                                                        key={
                                                                            value
                                                                        }
                                                                        value={
                                                                            value
                                                                        }
                                                                        style={{
                                                                            fontWeight:
                                                                                attr.curveShape ===
                                                                                value
                                                                                    ? "bold"
                                                                                    : "normal",
                                                                        }}
                                                                    >
                                                                        {label}
                                                                    </MenuItem>
                                                                )
                                                            )}
                                                        </Select>
                                                    </Tooltip>
                                                </TableCell>

                                                <TableCell>
                                                    <Tooltip
                                                        title="Defines the mode in which the data points are drawn."
                                                        arrow
                                                        placement="top"
                                                    >
                                                        <Select
                                                            value={
                                                                attr.curveMode ||
                                                                initialCurveMode
                                                            }
                                                            style={{
                                                                fontWeight:
                                                                    attr.curveMode
                                                                        ? "bold"
                                                                        : "normal",
                                                            }}
                                                            onChange={(e) =>
                                                                handleCurveAttributesChanged(
                                                                    key,
                                                                    "curveMode",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            {curveModeOptions.map(
                                                                ({
                                                                    value,
                                                                    label,
                                                                }) => (
                                                                    <MenuItem
                                                                        key={
                                                                            value
                                                                        }
                                                                        value={
                                                                            value
                                                                        }
                                                                        style={{
                                                                            fontWeight:
                                                                                attr.curveMode ===
                                                                                value
                                                                                    ? "bold"
                                                                                    : "normal",
                                                                        }}
                                                                    >
                                                                        {label}
                                                                    </MenuItem>
                                                                )
                                                            )}
                                                        </Select>
                                                    </Tooltip>
                                                </TableCell>

                                                <TableCell>
                                                    <Input
                                                        type="text"
                                                        value={
                                                            attr.channel.name
                                                        }
                                                        disabled
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Input
                                                        type="text"
                                                        value={
                                                            attr.channel.backend
                                                        }
                                                        disabled
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Input
                                                        type="text"
                                                        value={
                                                            attr.channel.type ||
                                                            "unknown"
                                                        }
                                                        disabled
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Input
                                                        type="text"
                                                        value={
                                                            "[" +
                                                            attr.channel.shape.toString() +
                                                            "]"
                                                        }
                                                        disabled
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Input
                                                        type="text"
                                                        value={
                                                            attr.displayLabel
                                                        }
                                                        style={{
                                                            fontWeight:
                                                                attr.displayLabel !==
                                                                getLabelForChannelAttributes(
                                                                    attr.channel
                                                                        .name,
                                                                    attr.channel
                                                                        .backend,
                                                                    attr.channel
                                                                        .type
                                                                )
                                                                    ? "bold"
                                                                    : "normal",
                                                        }}
                                                        onChange={(e) =>
                                                            handleCurveAttributesChanged(
                                                                key,
                                                                "displayLabel",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Select
                                                        value={
                                                            attr.axisAssignment
                                                        }
                                                        style={{
                                                            fontWeight:
                                                                localPlotSettings.manualAxisAssignment
                                                                    ? "bold"
                                                                    : "normal",
                                                        }}
                                                        onChange={(e) =>
                                                            handleCurveAttributesChanged(
                                                                key,
                                                                "axisAssignment",
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        {axisAssignmentOptions.map(
                                                            ({
                                                                value,
                                                                label,
                                                            }) => (
                                                                <MenuItem
                                                                    key={value}
                                                                    value={
                                                                        value
                                                                    }
                                                                    style={{
                                                                        fontWeight:
                                                                            localPlotSettings.manualAxisAssignment &&
                                                                            attr.axisAssignment ===
                                                                                value
                                                                                ? "bold"
                                                                                : "normal",
                                                                    }}
                                                                >
                                                                    {label}
                                                                </MenuItem>
                                                            )
                                                        )}
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Box>
                    <Box sx={styles.settingBoxStyle}>
                        <Box sx={styles.tableContainerStyle}>
                            <Typography variant="h6">Y-Axes</Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>#</TableCell>
                                            <TableCell>Scaling</TableCell>
                                            <TableCell>Min</TableCell>
                                            <TableCell>Max</TableCell>
                                            <TableCell>Label</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {localPlotSettings.yAxisAttributes.map(
                                            (axis, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        {axis.label}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={
                                                                axis.scaling ||
                                                                initialAxisScaling
                                                            }
                                                            style={{
                                                                fontWeight:
                                                                    axis.scaling
                                                                        ? "bold"
                                                                        : "normal",
                                                            }}
                                                            onChange={(e) => {
                                                                const newScaling =
                                                                    e.target
                                                                        .value as Plotly.AxisType;
                                                                setLocalPlotSettings(
                                                                    (
                                                                        prevLocalPlotSettings
                                                                    ) => {
                                                                        const newLocalPlotSettings =
                                                                            {
                                                                                ...prevLocalPlotSettings,
                                                                            };
                                                                        newLocalPlotSettings.yAxisAttributes[
                                                                            index
                                                                        ].scaling =
                                                                            newScaling;
                                                                        return newLocalPlotSettings;
                                                                    }
                                                                );
                                                            }}
                                                        >
                                                            {axisScalingOptions.map(
                                                                ({
                                                                    value,
                                                                    label,
                                                                }) => (
                                                                    <MenuItem
                                                                        key={
                                                                            value
                                                                        }
                                                                        value={
                                                                            value
                                                                        }
                                                                        style={{
                                                                            fontWeight:
                                                                                axis.scaling ===
                                                                                value
                                                                                    ? "bold"
                                                                                    : "normal",
                                                                        }}
                                                                    >
                                                                        {label}
                                                                    </MenuItem>
                                                                )
                                                            )}
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip
                                                            title="Interpreted as a power of ten"
                                                            arrow
                                                            placement="top"
                                                            {...(localPlotSettings
                                                                .yAxisAttributes[
                                                                index
                                                            ].scaling !== "log"
                                                                ? {
                                                                      disableHoverListener:
                                                                          true,
                                                                      disableTouchListener:
                                                                          true,
                                                                      disableFocusListener:
                                                                          true,
                                                                  }
                                                                : {})}
                                                        >
                                                            <Input
                                                                type="text"
                                                                value={
                                                                    inputsMin[
                                                                        index
                                                                    ]
                                                                }
                                                                style={{
                                                                    fontWeight:
                                                                        inputsMin[
                                                                            index
                                                                        ]
                                                                            ? "bold"
                                                                            : "normal",
                                                                }}
                                                                placeholder="auto"
                                                                onChange={(e) =>
                                                                    handleLimitInputChanged(
                                                                        e,
                                                                        index,
                                                                        "min"
                                                                    )
                                                                }
                                                            />
                                                        </Tooltip>
                                                    </TableCell>

                                                    <TableCell>
                                                        <Tooltip
                                                            title="Interpreted as a power of ten"
                                                            arrow
                                                            placement="top"
                                                            {...(localPlotSettings
                                                                .yAxisAttributes[
                                                                index
                                                            ].scaling !== "log"
                                                                ? {
                                                                      disableHoverListener:
                                                                          true,
                                                                      disableTouchListener:
                                                                          true,
                                                                      disableFocusListener:
                                                                          true,
                                                                  }
                                                                : {})}
                                                        >
                                                            <Input
                                                                type="text"
                                                                value={
                                                                    inputsMax[
                                                                        index
                                                                    ]
                                                                }
                                                                style={{
                                                                    fontWeight:
                                                                        inputsMax[
                                                                            index
                                                                        ]
                                                                            ? "bold"
                                                                            : "normal",
                                                                }}
                                                                placeholder="auto"
                                                                onChange={(e) =>
                                                                    handleLimitInputChanged(
                                                                        e,
                                                                        index,
                                                                        "max"
                                                                    )
                                                                }
                                                            />
                                                        </Tooltip>
                                                    </TableCell>

                                                    <TableCell>
                                                        <Input
                                                            value={
                                                                axis.displayLabel
                                                            }
                                                            style={{
                                                                fontWeight:
                                                                    localPlotSettings
                                                                        .yAxisAttributes[
                                                                        index
                                                                    ]
                                                                        .manualDisplayLabel
                                                                        ? "bold"
                                                                        : "normal",
                                                            }}
                                                            onChange={(e) => {
                                                                setLocalPlotSettings(
                                                                    (
                                                                        prevLocalPlotSettings
                                                                    ) => {
                                                                        const newLocalPlotSettings =
                                                                            {
                                                                                ...prevLocalPlotSettings,
                                                                            };
                                                                        newLocalPlotSettings.yAxisAttributes[
                                                                            index
                                                                        ].displayLabel =
                                                                            e.target.value;
                                                                        newLocalPlotSettings.yAxisAttributes[
                                                                            index
                                                                        ].manualDisplayLabel =
                                                                            true;
                                                                        return newLocalPlotSettings;
                                                                    }
                                                                );
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Box>
                    <Box sx={styles.resetButtonBoxStyle}>
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
        </Box>
    );
};

export default PlotSettingsPopup;
