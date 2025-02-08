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
    startTime: number;
    endTime: number;
    queryExpansion: boolean;
};

export type Dashboard = {
    widgets: Widget[];
};

export type DashboardDto = {
    id: string;
    dashboard: Dashboard;
};
