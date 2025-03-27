import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import {
    Box,
    TextField,
    MenuItem,
    Switch,
    Button,
    Typography,
    Tooltip,
    LinearProgress,
} from "@mui/material";
import {
    AutoApplyOption,
    TimeSelectorProps,
    TimeSourceOption,
    QuickSelectOption,
    TimeSelectorHandle,
    LocalTimeSelectorHandle,
} from "./TimeSelector.types";
import * as styles from "./TimeSelector.styles";
import { useSearchParams } from "react-router-dom";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";

const quickOptions = [
    { label: "Not selected", value: false },
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

const TimeSelector = forwardRef<TimeSelectorHandle, TimeSelectorProps>(
    ({ onTimeChange }, ref) => {
        const [searchParams, setSearchParams] = useSearchParams();
        const [isAutoApplyPressSimulated, setIsAutoApplyPressSimulated] =
            useState(false);
        const [startTime, setStartTime] = useState<Dayjs>(dayjs());
        const [endTime, setEndTime] = useState<Dayjs>(dayjs());
        const [rawWhenSparse, setRawWhenSparse] = useState(true);
        const [removeEmptyBins, setRemoveEmptyBins] = useState(true);
        const [selectedQuickOption, setSelectedQuickOption] =
            useState<QuickSelectOption>(quickOptions[0].value);
        const [autoApply, setAutoApply] = useState<AutoApplyOption>("never");
        const [autoApplyProgress, setAutoApplyProgress] = useState(0);
        const autoApplyIntervalRef = useRef<NodeJS.Timeout | null>(null);
        const autoApplyProgressIntervalRef = useRef<NodeJS.Timeout | null>(
            null
        );
        const timeSourceRef = useRef<TimeSourceOption>("quickselect");
        const isUrlParsed = useRef(false);

        const localRef = useRef<LocalTimeSelectorHandle>(null);

        useImperativeHandle(localRef, () => ({
            autoApply: () => {
                handleApply();
            },
        }));

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
                        start = new Date(
                            now.getFullYear(),
                            now.getMonth() - 1,
                            1
                        );
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
            if (value === "false") {
                timeSourceRef.current = "manual";
                return;
            }
            timeSourceRef.current = "quickselect";
            setSelectedQuickOption(value);

            // Make the time fields also display the correct time
            const { start, end } = convertQuickOptionToTimestamps(value);
            setStartTime(dayjs(start));
            setEndTime(dayjs(end));
        };

        const handleApply = useCallback(() => {
            // in case a quickselect option was selected last, recalculate the start and end times based on it
            if (timeSourceRef.current === "quickselect") {
                const { start, end } =
                    convertQuickOptionToTimestamps(selectedQuickOption);
                setStartTime(dayjs(start));
                setEndTime(dayjs(end));
            } else setSelectedQuickOption(false);
            const startUnixTimeMs = startTime.valueOf();
            const endUnixTimeMs = endTime.valueOf();

            onTimeChange({
                startTime: startUnixTimeMs,
                endTime: endUnixTimeMs,
                rawWhenSparse,
                removeEmptyBins,
            });

            setTimeSearchParams(startUnixTimeMs, endUnixTimeMs);
        }, [
            autoApply,
            endTime,
            onTimeChange,
            rawWhenSparse,
            removeEmptyBins,
            selectedQuickOption,
            setSearchParams,
            startTime,
        ]);

        const setTimeSearchParams = useCallback(
            (startUnixTimeMs: number, endUnixTimeMs: number) => {
                const startParam = startUnixTimeMs.toString();
                const endParam = endUnixTimeMs.toString();

                setSearchParams((searchParams) => {
                    const newSearchParams = new URLSearchParams(
                        searchParams.toString()
                    );
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
                        "rawWhenSparse",
                        rawWhenSparse ? "true" : "false"
                    );
                    newSearchParams.set(
                        "removeEmptyBins",
                        removeEmptyBins ? "true" : "false"
                    );
                    newSearchParams.set("autoApply", autoApply);

                    return newSearchParams;
                });
            },
            [
                setSearchParams,
                rawWhenSparse,
                removeEmptyBins,
                selectedQuickOption,
                autoApply,
            ]
        );

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
                if (autoApplyProgressIntervalRef.current) {
                    clearInterval(autoApplyProgressIntervalRef.current);
                }

                // Set interval if not 'never'
                if (newAutoApply !== "never") {
                    const interval = newAutoApply === "1min" ? 60000 : 600000; // 1 minute or 10 minutes
                    setAutoApplyProgress(0);
                    autoApplyProgressIntervalRef.current = setInterval(() => {
                        setAutoApplyProgress((prev) => {
                            if (prev === 100) {
                                simulateAutoApplyPress();
                                localRef.current?.autoApply();
                                return 0;
                            }
                            return prev + 1;
                        });
                    }, interval / 100);
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
            const rawWhenSparse = searchParams.get("rawWhenSparse");
            const removeEmptyBins = searchParams.get("removeEmptyBins");
            const autoApplyParam = searchParams.get("autoApply");

            const startTime = Number(startTimeParam);
            const endTime = Number(endTimeParam);
            let start, end;
            // If both time parameters are valid numbers, initialize the time to those
            if (!isNaN(startTime) && !isNaN(endTime) && startTime * endTime) {
                start = new Date(startTime);
                end = new Date(endTime);
            } else {
                // Else, default to ten minutes ago
                ({ start, end } = convertQuickOptionToTimestamps(10));
                setSelectedQuickOption(10);
            }

            setStartTime(dayjs(start));
            setEndTime(dayjs(end));

            if (quickSelectParam) {
                if (quickSelectParam === "false") {
                    timeSourceRef.current = "manual";
                } else if (isValueInQuickSelectOptions(quickSelectParam)) {
                    timeSourceRef.current = "quickselect";
                    setSelectedQuickOption(quickSelectParam);
                } else if (
                    isValueInQuickSelectOptions(Number(quickSelectParam))
                ) {
                    timeSourceRef.current = "quickselect";
                    setSelectedQuickOption(Number(quickSelectParam));
                }
            }

            let newRawWhenSparse = false;
            if (rawWhenSparse) {
                if (rawWhenSparse === "true") {
                    newRawWhenSparse = true;
                    setRawWhenSparse(newRawWhenSparse);
                } else if (rawWhenSparse === "false") {
                    setRawWhenSparse(false);
                }
            }

            let newRemoveEmptyBins = false;
            if (removeEmptyBins) {
                if (removeEmptyBins === "true") {
                    newRemoveEmptyBins = true;
                    setRemoveEmptyBins(newRemoveEmptyBins);
                } else if (removeEmptyBins === "false") {
                    setRemoveEmptyBins(false);
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
                startTime: start.valueOf(),
                endTime: end.valueOf(),
                rawWhenSparse: newRawWhenSparse,
                removeEmptyBins: newRemoveEmptyBins,
            });
        }, [handleAutoApplyChange, onTimeChange, searchParams]);

        const setTimeRange = useCallback(
            (startTime: number, endTime: number) => {
                if (!startTime || !endTime) return;
                setStartTime(dayjs(startTime));
                setEndTime(dayjs(endTime));
                timeSourceRef.current = "manual";
                setSelectedQuickOption(false);
                onTimeChange({
                    startTime: startTime,
                    endTime: endTime,
                    rawWhenSparse: rawWhenSparse,
                    removeEmptyBins: removeEmptyBins,
                });
                setTimeSearchParams(startTime, endTime);
            },
            [
                onTimeChange,
                setSearchParams,
                rawWhenSparse,
                removeEmptyBins,
                selectedQuickOption,
                autoApply,
            ]
        );

        useImperativeHandle(
            ref,
            () => ({
                setTimeRange,
            }),
            [setTimeRange]
        );

        return (
            <Box sx={styles.timeSelectorContainerStyle}>
                <Box sx={styles.timeFieldStyle}>
                    <DateTimePicker
                        label="Start Time"
                        format="YYYY-MM-DD HH:mm:ss"
                        ampm={false}
                        value={startTime}
                        onChange={(newTime) => {
                            setStartTime(dayjs(newTime));
                            timeSourceRef.current = "manual";
                            setSelectedQuickOption(false);
                        }}
                    />
                </Box>
                <Box sx={styles.timeFieldStyle}>
                    <DateTimePicker
                        label="End Time"
                        format="YYYY-MM-DD HH:mm:ss"
                        ampm={false}
                        value={endTime}
                        onChange={(newTime) => {
                            setEndTime(dayjs(newTime));
                            timeSourceRef.current = "manual";
                            setSelectedQuickOption(false);
                        }}
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
                        <MenuItem
                            key={option.label}
                            value={
                                typeof option.value == "boolean"
                                    ? option.value.toString()
                                    : option.value
                            }
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
                <Tooltip
                    title="When little data is available, raw data is plotted instead of binned data"
                    arrow
                >
                    <Box sx={styles.toggleContainerStyle}>
                        <Typography>Raw when sparse</Typography>
                        <Switch
                            checked={rawWhenSparse}
                            onChange={(e) => setRawWhenSparse(e.target.checked)}
                        />
                    </Box>
                </Tooltip>

                <Tooltip
                    title="Bins containing no events are discarded, as opposed to being rendered with the previous value"
                    arrow
                >
                    <Box sx={styles.toggleContainerStyle}>
                        <Typography>Remove empty bins</Typography>
                        <Switch
                            checked={removeEmptyBins}
                            onChange={(e) =>
                                setRemoveEmptyBins(e.target.checked)
                            }
                        />
                    </Box>
                </Tooltip>
                <Box sx={styles.autoApplyContainerStyle}>
                    <Tooltip
                        title="Automatically applies the configuration, includes updating relative times from Quick Select"
                        arrow
                        placement="left"
                    >
                        <TextField
                            select
                            label="Auto Apply"
                            value={autoApply}
                            onChange={(e) =>
                                handleAutoApplyChange(
                                    e.target.value as AutoApplyOption
                                )
                            }
                        >
                            <MenuItem value="never">Never</MenuItem>
                            <MenuItem value="1min">1 min</MenuItem>
                            <MenuItem value="10min">10 min</MenuItem>
                        </TextField>
                    </Tooltip>
                    {autoApply !== "never" && (
                        <Box sx={styles.autoApplyProgressStyle}>
                            <LinearProgress
                                variant="determinate"
                                value={autoApplyProgress}
                            />
                        </Box>
                    )}
                </Box>
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
    }
);

export default TimeSelector;
