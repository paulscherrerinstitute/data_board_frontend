import * as ReactGridLayout from "react-grid-layout";
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

export type Dashboard = {
    widgets: Widget[];
};

export type DashboardDTO = {
    dashboard: Dashboard;
};

export type DashboardReturnDTO = DashboardDTO & {
    id: string;
};
