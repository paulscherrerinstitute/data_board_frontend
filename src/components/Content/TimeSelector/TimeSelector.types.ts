export interface TimeSelectorProps {
    onTimeChange: (values: {
        startTime: string;
        endTime: string;
        queryExpansion: boolean;
    }) => void;
}

export type TimeSourceOption = "quickselect" | "manual";

export type AutoApplyOption = "never" | "1min" | "10min";

export type QuickSelectOption = string | number;
