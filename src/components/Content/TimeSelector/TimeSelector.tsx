import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Box,
    TextField,
    MenuItem,
    Switch,
    Button,
    Typography,
} from "@mui/material";
import {
    AutoApplyOption,
    TimeSelectorProps,
    TimeSourceOption,
    QuickSelectOption,
} from "./TimeSelector.types";
import * as styles from "./TimeSelector.styles";
import { useSearchParams } from "react-router-dom";

const quickOptions = [
    { label: "Last 1m", value: 1 },
    { label: "Last 10m", value: 10 },
    { label: "Last 1h", value: 60 },
    { label: "Last 12h", value: 720 },
    { label: "Last 24h", value: 1440 },
    { label: "Last 7d", value: 10080 },
    { label: "Yesterday", value: "yesterday" },
    { label: "Today", value: "today" },
    { label: "Last Week", value: "last_week" },
    { label: "This Week", value: "this_week" },
    { label: "Last Month", value: "last_month" },
    { label: "This Month", value: "this_month" },
];

const TimeSelector: React.FC<TimeSelectorProps> = ({ onTimeChange }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isAutoApplyPressSimulated, setIsAutoApplyPressSimulated] =
        useState(false);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [queryExpansion, setQueryExpansion] = useState(false);
    const [selectedQuickOption, setSelectedQuickOption] =
        useState<QuickSelectOption>(quickOptions[1].value);
    const [autoApply, setAutoApply] = useState<AutoApplyOption>("never");
    const autoApplyIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeSourceRef = useRef<TimeSourceOption>("quickselect");
    const isUrlParsed = useRef(false);

    const formatDateForLocalInput = (date: Date): string => {
        const year = date.getFullYear();
        // The month is returned as a zero based index, so increment it once.
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        // getHours returns the local hours, so we can simply keep that.
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const getISOstringFromLocalInput = (localInput: string): string => {
        if (localInput === "") {
            return new Date().toISOString();
        }
        const [datePart, timePart] = localInput.split("T");
        const [year, month, day] = datePart.split("-").map(Number);
        const [hours, minutes] = timePart.split(":").map(Number);

        // Convert month back to zero based index and treat local hours as input for iso hours (Which is why we don't need to change hours to adapt).
        const date = new Date(year, month - 1, day, hours, minutes);
        return date.toISOString();
    };

    const convertQuickOptionToTimestamps = (option: QuickSelectOption) => {
        const now = new Date();
        const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
        let start, end;

        if (typeof option === "number") {
            start = new Date(now.getTime() - option * 60 * 1000);
            end = now;
        } else {
            switch (option) {
                case "yesterday":
                    start = new Date(
                        startOfDay.getTime() - 24 * 60 * 60 * 1000
                    );
                    end = startOfDay;
                    break;
                case "today":
                    start = startOfDay;
                    end = now;
                    break;
                case "last_week":
                    start = new Date(
                        startOfDay.getTime() - 14 * 24 * 60 * 60 * 1000
                    );
                    end = new Date(
                        startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000
                    );
                    break;
                case "this_week":
                    start = new Date(
                        now.getTime() - now.getDay() * 24 * 60 * 60 * 1000
                    );
                    end = now;
                    break;
                case "last_month":
                    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    end = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case "this_month":
                    start = new Date(now.getFullYear(), now.getMonth(), 1);
                    end = now;
                    break;
                default:
                    start = new Date(now.getTime() - 10 * 60 * 1000); // tenMinutesAgo
                    end = now;
            }
        }

        return { start, end };
    };

    const handleQuickSelect = (value: QuickSelectOption) => {
        timeSourceRef.current = "quickselect";
        setSelectedQuickOption(value);

        // Make the time fields also display the correct time
        const { start, end } = convertQuickOptionToTimestamps(value);
        setStartTime(formatDateForLocalInput(start));
        setEndTime(formatDateForLocalInput(end));
    };

    const handleApply = useCallback(() => {
        let calculatedStartTime = startTime;
        let calculatedEndTime = endTime;
        // in case a quickselect option was selected last, recalculate the start and end times based on it
        if (timeSourceRef.current === "quickselect") {
            const { start, end } =
                convertQuickOptionToTimestamps(selectedQuickOption);
            calculatedStartTime = formatDateForLocalInput(start);
            calculatedEndTime = formatDateForLocalInput(end);
            setStartTime(calculatedStartTime);
            setEndTime(calculatedEndTime);
        }
        const startTimeISO = getISOstringFromLocalInput(calculatedStartTime);
        const endTimeISO = getISOstringFromLocalInput(calculatedEndTime);
        onTimeChange({
            startTime: startTimeISO,
            endTime: endTimeISO,
            queryExpansion,
        });

        const startParam = (new Date(startTimeISO).getTime() / 1000).toString();
        const endParam = (new Date(endTimeISO).getTime() / 1000).toString();

        setSearchParams((searchParams) => {
            const newSearchParams = searchParams;
            newSearchParams.set("startTime", startParam);
            newSearchParams.set("endTime", endParam);
            if (timeSourceRef.current === "quickselect") {
                newSearchParams.set(
                    "relativeTime",
                    selectedQuickOption.toString()
                );
            } else {
                newSearchParams.set("relativeTime", "false");
            }
            newSearchParams.set(
                "queryExpansion",
                queryExpansion ? "true" : "false"
            );
            newSearchParams.set("autoApply", autoApply);
            return newSearchParams;
        });
    }, [
        autoApply,
        endTime,
        onTimeChange,
        queryExpansion,
        selectedQuickOption,
        setSearchParams,
        startTime,
    ]);

    const simulateAutoApplyPress = () => {
        setIsAutoApplyPressSimulated(true);
        setTimeout(() => setIsAutoApplyPressSimulated(false), 200);
    };

    const handleAutoApplyChange = useCallback(
        (newAutoApply: AutoApplyOption) => {
            setAutoApply(newAutoApply);

            // Clear existing interval
            if (autoApplyIntervalRef.current) {
                clearInterval(autoApplyIntervalRef.current);
            }

            // Set interval if not 'never'
            if (newAutoApply !== "never") {
                const interval = newAutoApply === "1min" ? 60000 : 600000; // 1 minute or 10 minutes
                autoApplyIntervalRef.current = setInterval(() => {
                    simulateAutoApplyPress();
                    handleApply();
                }, interval);
            }
        },
        [handleApply]
    );

    const isValueInQuickSelectOptions = (value: string | number) => {
        const possibleValues = quickOptions.map((option) => option.value);
        return possibleValues.includes(value);
    };

    // Initially, parse all relevant url parameters
    useEffect(() => {
        if (isUrlParsed.current) {
            return;
        }
        isUrlParsed.current = true;

        const startTimeParam = searchParams.get("startTime");
        const endTimeParam = searchParams.get("endTime");
        const quickSelectParam = searchParams.get("relativeTime");
        const queryExpansionParam = searchParams.get("queryExpansion");
        const autoApplyParam = searchParams.get("autoApply");

        const startTime = Number(startTimeParam);
        const endTime = Number(endTimeParam);
        let start, end;
        // If both time parameters are valid numbers, initialize the time to those
        if (!isNaN(startTime) && !isNaN(endTime) && startTime * endTime) {
            start = new Date(startTime * 1000);
            end = new Date(endTime * 1000);
        } else {
            // Else, default to ten minutes ago
            ({ start, end } = convertQuickOptionToTimestamps(10));
        }

        const formattedStart = formatDateForLocalInput(start);
        const formattedEnd = formatDateForLocalInput(end);

        setStartTime(formattedStart);
        setEndTime(formattedEnd);

        if (quickSelectParam) {
            if (quickSelectParam === "false") {
                timeSourceRef.current = "manual";
            } else if (isValueInQuickSelectOptions(quickSelectParam)) {
                timeSourceRef.current = "quickselect";
                setSelectedQuickOption(quickSelectParam);
            } else if (isValueInQuickSelectOptions(Number(quickSelectParam))) {
                timeSourceRef.current = "quickselect";
                setSelectedQuickOption(Number(quickSelectParam));
            }
        }

        let newQueryExpansion = false;
        if (queryExpansionParam) {
            if (queryExpansionParam === "true") {
                newQueryExpansion = true;
                setQueryExpansion(newQueryExpansion);
            } else if (queryExpansionParam === "false") {
                setQueryExpansion(false);
            }
        }

        if (autoApplyParam) {
            if (
                autoApplyParam === "never" ||
                autoApplyParam === "1min" ||
                autoApplyParam === "10min"
            ) {
                handleAutoApplyChange(autoApplyParam);
            }
        }

        onTimeChange({
            startTime: formattedStart,
            endTime: formattedEnd,
            queryExpansion: newQueryExpansion,
        });
    }, [handleAutoApplyChange, onTimeChange, searchParams]);

    return (
        <Box sx={styles.timeSelectorContainerStyle}>
            <Box sx={styles.timeFieldStyle}>
                <TextField
                    label="Start Time"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => {
                        setStartTime(e.target.value);
                        timeSourceRef.current = "manual";
                    }}
                    fullWidth
                />
            </Box>
            <Box sx={styles.timeFieldStyle}>
                <TextField
                    label="End Time"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => {
                        setEndTime(e.target.value);
                        timeSourceRef.current = "manual";
                    }}
                    fullWidth
                />
            </Box>
            <TextField
                select
                label="Quick Select"
                onChange={(e) => {
                    handleQuickSelect(e.target.value);
                }}
                sx={styles.quickSelectStyle}
                value={selectedQuickOption}
            >
                {quickOptions.map((option) => (
                    <MenuItem key={option.label} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </TextField>
            <Box sx={styles.toggleContainerStyle}>
                <Typography>Query Expansion</Typography>
                <Switch
                    checked={queryExpansion}
                    onChange={(e) => setQueryExpansion(e.target.checked)}
                />
            </Box>
            <TextField
                select
                label="Auto Apply"
                value={autoApply}
                onChange={(e) =>
                    handleAutoApplyChange(e.target.value as AutoApplyOption)
                }
            >
                <MenuItem value="never">Never</MenuItem>
                <MenuItem value="1min">1 min</MenuItem>
                <MenuItem value="10min">10 min</MenuItem>
            </TextField>
            <Button
                variant="contained"
                sx={{
                    ...styles.refreshButtonStyle,
                    ...(isAutoApplyPressSimulated && {
                        transform: "scale(0.95)",
                    }),
                }}
                onClick={handleApply}
            >
                Apply
            </Button>
        </Box>
    );
};

export default TimeSelector;
