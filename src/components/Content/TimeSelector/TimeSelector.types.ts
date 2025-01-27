export interface TimeSelectorProps {
    onTimeChange: (values: {
        startTime: string;
        endTime: string;
        queryExpansion: boolean;
    }) => void;
}

export type timeSourceOption = "quickselect" | "manual";

export type AutoPlotOption = "never" | "1min" | "10min";
