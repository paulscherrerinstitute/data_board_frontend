import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    TextField,
    MenuItem,
    Switch,
    Button,
    Typography,
} from "@mui/material";
import {
    AutoPlotOption,
    TimeSelectorProps,
    timeSourceOption,
} from "./TimeSelector.types";
import * as styles from "./TimeSelector.styles";

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

const formatDateForLocalInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
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

    const date = new Date(year, month - 1, day, hours, minutes);
    return date.toISOString();
};

const TimeSelector: React.FC<TimeSelectorProps> = ({ onTimeChange }) => {
    const [startTime, setStartTime] = useState<string>(
        formatDateForLocalInput(new Date(new Date().getTime() - 10 * 60 * 1000))
    );
    const [endTime, setEndTime] = useState<string>(
        formatDateForLocalInput(new Date())
    );
    const [queryExpansion, setQueryExpansion] = useState<boolean>(false);
    const [timeSource, setTimeSource] =
        useState<timeSourceOption>("quickselect");
    const [selectedQuickOption, setSelectedQuickOption] = useState<
        string | number
    >(quickOptions[1].value);
    const [autoPlot, setAutoPlot] = useState<AutoPlotOption>("never");
    const autoPlotInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        onTimeChange({
            startTime: new Date(
                new Date().getTime() - 10 * 60 * 1000
            ).toISOString(),
            endTime: new Date().toISOString(),
            queryExpansion: false,
        });
    }, [onTimeChange]);

    const handleQuickSelect = (value: string | number) => {
        setTimeSource("quickselect");
        setSelectedQuickOption(value);

        // Make the time fields also display the correct time
        const now = new Date();
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
        let start;
        if (typeof value === "number") {
            start = new Date(now.getTime() - value * 60 * 1000);
        } else {
            const startOfDay = new Date(now.toISOString().split("T")[0]);
            switch (value) {
                case "yesterday":
                    start = new Date(
                        startOfDay.getTime() - 24 * 60 * 60 * 1000
                    );
                    break;
                case "today":
                    start = startOfDay;
                    break;
                case "last_week":
                    start = new Date(
                        startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000
                    );
                    break;
                case "this_week":
                    start = new Date(
                        now.getTime() - now.getDay() * 24 * 60 * 60 * 1000
                    );
                    break;
                case "last_month":
                case "this_month":
                    const month =
                        value === "last_month"
                            ? now.getMonth() - 1
                            : now.getMonth();
                    start = new Date(now.getFullYear(), month, 1);
                    break;
                default:
                    start = tenMinutesAgo;
            }
        }
        setStartTime(formatDateForLocalInput(start));
        setEndTime(formatDateForLocalInput(now));
    };

    const handlePlot = () => {
        let calculatedStartTime = startTime;
        let calculatedEndTime = endTime;
        if (timeSource === "quickselect") {
            const now = new Date();
            const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
            let start: Date;
            if (typeof selectedQuickOption === "number") {
                start = new Date(
                    now.getTime() - selectedQuickOption * 60 * 1000
                );
            } else {
                const startOfDay = new Date(now.toISOString().split("T")[0]);
                switch (selectedQuickOption) {
                    case "yesterday":
                        start = new Date(
                            startOfDay.getTime() - 24 * 60 * 60 * 1000
                        );
                        break;
                    case "today":
                        start = startOfDay;
                        break;
                    case "last_week":
                        start = new Date(
                            startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000
                        );
                        break;
                    case "this_week":
                        start = new Date(
                            now.getTime() - now.getDay() * 24 * 60 * 60 * 1000
                        );
                        break;
                    case "last_month":
                    case "this_month":
                        const month =
                            selectedQuickOption === "last_month"
                                ? now.getMonth() - 1
                                : now.getMonth();
                        start = new Date(now.getFullYear(), month, 1);
                        break;
                    default:
                        start = tenMinutesAgo;
                }
            }
            calculatedStartTime = formatDateForLocalInput(start);
            calculatedEndTime = formatDateForLocalInput(new Date());
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
    };

    const handleAutoPlotChange = (newAutoPlot: AutoPlotOption) => {
        setAutoPlot(newAutoPlot);

        // Clear existing interval
        if (autoPlotInterval.current) {
            clearInterval(autoPlotInterval.current);
        }

        // Set interval if not 'never'
        if (newAutoPlot !== "never") {
            const interval = newAutoPlot === "1min" ? 60000 : 600000; // 1 minute or 10 minutes
            autoPlotInterval.current = setInterval(() => {
                handlePlot(); // Trigger the plot action
            }, interval);
        }
    };

    return (
        <Box sx={styles.timeSelectorContainerStyle}>
            <Box sx={styles.timeFieldStyle}>
                <TextField
                    label="Start Time"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => {
                        setStartTime(e.target.value);
                        setTimeSource("manual");
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
                        setTimeSource("manual");
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
                value={autoPlot}
                onChange={(e) =>
                    handleAutoPlotChange(e.target.value as AutoPlotOption)
                }
            >
                <MenuItem value="never">Never</MenuItem>
                <MenuItem value="1min">1 min</MenuItem>
                <MenuItem value="10min">10 min</MenuItem>
            </TextField>
            <Button
                variant="contained"
                sx={styles.refreshButtonStyle}
                onClick={handlePlot}
            >
                Apply
            </Button>
        </Box>
    );
};

export default TimeSelector;
