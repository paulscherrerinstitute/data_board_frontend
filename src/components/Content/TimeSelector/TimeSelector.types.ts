export interface TimeSelectorProps {
    onTimeChange: (values: {
        startTime: number;
        endTime: number;
        rawWhenSparse: boolean;
        removeEmptyBins: boolean;
    }) => void;
}

export type TimeSelectorHandle = {
    setTimeRange: (startTime: number, endTime: number) => void;
};

export type TimeSourceOption = "quickselect" | "manual";

export type AutoApplyOption = "never" | "1min" | "10min";

export type QuickSelectOption = string | number;
