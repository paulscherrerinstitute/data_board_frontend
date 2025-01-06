import React, { useState, useEffect } from "react";
import {
    Box,
    TextField,
    MenuItem,
    Switch,
    Button,
    Typography,
} from "@mui/material";
import { TimeSelectorProps } from "./TimeSelector.types";
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

const TimeSelector: React.FC<TimeSelectorProps> = ({
    onTimeChange,
    onRefresh,
}) => {
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [queryExpansion, setQueryExpansion] = useState<boolean>(false);

    useEffect(() => {
        const now = new Date();
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
        setEndTime(now.toISOString().slice(0, 16));
        setStartTime(tenMinutesAgo.toISOString().slice(0, 16));
    }, []);

    useEffect(() => {
        console.log("change");
        onTimeChange({ startTime, endTime, queryExpansion });
    }, [startTime, endTime, queryExpansion, onTimeChange]);

    const handleQuickSelect = (value: string | number) => {
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
        setStartTime(start.toISOString().slice(0, 16));
        setEndTime(now.toISOString().slice(0, 16));
    };

    return (
        <Box sx={styles.timeSelectorContainerStyle}>
            <Box sx={styles.timeFieldStyle}>
                <TextField
                    label="Start Time"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    fullWidth
                />
            </Box>
            <Box sx={styles.timeFieldStyle}>
                <TextField
                    label="End Time"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    fullWidth
                />
            </Box>
            <TextField
                select
                label="Quick Select"
                value=""
                onChange={(e) => handleQuickSelect(e.target.value)}
                sx={styles.quickSelectStyle}
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
            <Button
                variant="contained"
                onClick={onRefresh}
                sx={styles.refreshButtonStyle}
            >
                Refresh
            </Button>
        </Box>
    );
};

export default TimeSelector;
