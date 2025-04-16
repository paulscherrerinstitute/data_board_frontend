import ReactGridLayout from "react-grid-layout";
import { Channel } from "../Selector/Selector.types";
import { PlotSettings } from "./PlotWidget/PlotSettingsPopup/PlotSettingsPopup.types";
import { CurveAttributes } from "./PlotWidget/PlotWidget.types";

export type StoredPlotSettings = Omit<PlotSettings, "curveAttributes"> & {
    curveAttributes: { [k: string]: CurveAttributes };
};

export type Widget = {
    channels: Channel[];
    plotSettings?: StoredPlotSettings;
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
