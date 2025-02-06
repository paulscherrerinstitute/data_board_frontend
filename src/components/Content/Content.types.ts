import ReactGridLayout from "react-grid-layout";

export type Channel = {
    channelName: string;
    backend: string;
    datatype: string;
};

export type Widget = {
    channels: Channel[];
    layout: ReactGridLayout.Layout;
};

export type TimeValues = {
    startTime: string;
    endTime: string;
    queryExpansion: boolean;
};

export type DashboardData = {
    widgets: Widget[],
}

export type Dashboard = {
    id: string,
    data: DashboardData,
}
