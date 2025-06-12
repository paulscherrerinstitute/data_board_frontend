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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { PlotSettingsPopupProps } from "./PlotSettingsPopup.types";
import * as styles from "./PlotSettingsPopup.styles";
import { CurveAttributes } from "../PlotWidget.types";
import showSnackbarAndLog from "../../../../helpers/showSnackbar";

const PlotSettingsPopup: React.FC<PlotSettingsPopupProps> = ({
    open,
    onClose,
    plotSettings,
    onSave,
}) => {
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

                if (field === "axisAssignment" && value === "x") {
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
                return { ...prev, curveAttributes: newCurveAttributes };
            });
        },
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
                                        ).map(([key, attr]) => (
                                            <TableRow key={key}>
                                                <TableCell>
                                                    <Input
                                                        type="color"
                                                        defaultValue={
                                                            attr.color
                                                        }
                                                        sx={
                                                            styles.colorPickerStyle
                                                        }
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
                                                                attr.curveShape
                                                            }
                                                            onChange={(e) =>
                                                                handleCurveAttributesChanged(
                                                                    key,
                                                                    "curveShape",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            <MenuItem value="linear">
                                                                Direct (linear)
                                                            </MenuItem>
                                                            <MenuItem value="hv">
                                                                Digital (hv)
                                                            </MenuItem>
                                                            <MenuItem value="vh">
                                                                vh
                                                            </MenuItem>
                                                            <MenuItem value="hvh">
                                                                hvh
                                                            </MenuItem>
                                                            <MenuItem value="vhv">
                                                                vhv
                                                            </MenuItem>
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
                                                                attr.curveMode
                                                            }
                                                            onChange={(e) =>
                                                                handleCurveAttributesChanged(
                                                                    key,
                                                                    "curveMode",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            <MenuItem value="lines+markers">
                                                                Lines and
                                                                Markers
                                                            </MenuItem>
                                                            <MenuItem value="markers">
                                                                Only Markers
                                                                (points)
                                                            </MenuItem>
                                                            <MenuItem value="lines">
                                                                Only Lines
                                                            </MenuItem>
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
                                                        onChange={(e) =>
                                                            handleCurveAttributesChanged(
                                                                key,
                                                                "axisAssignment",
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        <MenuItem value="x">
                                                            x
                                                        </MenuItem>
                                                        <MenuItem value="y1">
                                                            y1
                                                        </MenuItem>
                                                        <MenuItem value="y2">
                                                            y2
                                                        </MenuItem>
                                                        <MenuItem value="y3">
                                                            y3
                                                        </MenuItem>
                                                        <MenuItem value="y4">
                                                            y4
                                                        </MenuItem>
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
                                                            value={axis.scaling}
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
                                                            <MenuItem value="linear">
                                                                Linear
                                                            </MenuItem>
                                                            <MenuItem value="log">
                                                                Log10
                                                            </MenuItem>
                                                        </Select>
                                                    </TableCell>

                                                    <TableCell>
                                                        <Input
                                                            type="text"
                                                            value={
                                                                inputsMin[index]
                                                            }
                                                            placeholder="auto"
                                                            onChange={(e) =>
                                                                handleLimitInputChanged(
                                                                    e,
                                                                    index,
                                                                    "min"
                                                                )
                                                            }
                                                        />
                                                    </TableCell>

                                                    <TableCell>
                                                        <Input
                                                            type="text"
                                                            value={
                                                                inputsMax[index]
                                                            }
                                                            placeholder="auto"
                                                            onChange={(e) =>
                                                                handleLimitInputChanged(
                                                                    e,
                                                                    index,
                                                                    "max"
                                                                )
                                                            }
                                                        />
                                                    </TableCell>

                                                    <TableCell>
                                                        <Input
                                                            value={
                                                                axis.displayLabel
                                                            }
                                                            onChange={(e) =>
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
                                                                        return newLocalPlotSettings;
                                                                    }
                                                                )
                                                            }
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
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default PlotSettingsPopup;
