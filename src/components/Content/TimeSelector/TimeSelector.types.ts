export interface TimeSelectorProps {
    onTimeChange: (values: {
        startTime: number;
        endTime: number;
        queryExpansion: boolean;
    }) => void;
}

export type TimeSourceOption = "quickselect" | "manual";

export type AutoApplyOption = "never" | "1min" | "10min";

export type QuickSelectOption = string | number;
