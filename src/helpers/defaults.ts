import { InitialSidebarState } from "../components/Sidebar/Sidebar.types";
import { AvailableTheme } from "../themes/themes.types";

export const defaultWatermarkOpacity = 0.1;
export const defaultPlotBackgroundColor = "#fcfcfc";
export const defaultXAxisGridColor = "#ebebeb";
export const defaultYAxisGridColor = "#ebebeb";
export const defaultTheme: AvailableTheme = "default";
export const defaultUseWebGL = true;
export const defaultUseVirtualWebGL = false;
export const defaultKeepSidebarClosedAfterDrag = false;
export const defaultCloseSidebarOnOutsideClick = false;

export const defaultCurveColors = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
];
export const defaultYAxisScaling: Plotly.AxisType = "linear";
export const defaultCurveShape: Plotly.ScatterLine["shape"] = "linear";
export const defaultCurveMode: Plotly.PlotData["mode"] = "lines+markers";

export const defaultWidgetWidth = 12;
export const defaultWidgetHeight = 12;

export const defaultInitialSidebarState: InitialSidebarState =
    "closedIfDashboard";
