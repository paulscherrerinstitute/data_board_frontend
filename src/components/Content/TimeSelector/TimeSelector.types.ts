export interface TimeSelectorProps {
    onTimeChange: (values: {
        startTime: string;
        endTime: string;
        queryExpansion: boolean;
    }) => void;
    onRefresh: () => void;
}
