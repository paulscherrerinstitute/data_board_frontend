import ReactGridLayout from "react-grid-layout";
import { Channel } from "../Selector/Selector.types";

export type Widget = {
    channels: Channel[];
    layout: ReactGridLayout.Layout;
};

export type TimeValues = {
    startTime: number;
    endTime: number;
    rawWhenSparse: boolean;
    removeEmptyBins: boolean;
};

export type Dashboard = {
    widgets: Widget[];
};

export type DashboardDto = {
    id: string;
    dashboard: Dashboard;
};
