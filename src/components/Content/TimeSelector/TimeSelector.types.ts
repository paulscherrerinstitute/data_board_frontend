export interface TimeSelectorProps {
    onTimeChange: (values: TimeValues) => void;
}

export type TimeValues = {
    startTime: number;
    endTime: number;
    rawWhenSparse: boolean;
    removeEmptyBins: boolean;
};

export type AppliedTimeValues = TimeValues & {
    selectedQuickOption: QuickSelectOption;
};

export type TimeSelectorHandle = {
    setTimeRange: (startTime: number, endTime: number) => void;
};

export type LocalTimeSelectorHandle = {
    autoApply: () => void;
};

export type TimeSourceOption = "quickselect" | "manual";

export type AutoApplyOption = "never" | "1min" | "10min";

export type QuickSelectOption = string | number | boolean;
