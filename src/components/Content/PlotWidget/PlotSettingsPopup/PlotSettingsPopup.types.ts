import { CurveAttributes, YAxisAttributes } from "../PlotWidget.types";

export interface PlotSettingsPopupProps {
    open: boolean;
    onClose: () => void;
    plotSettings: PlotSettings;
    onSave: (newPlotSettings: PlotSettings) => void;
}

export type PlotSettings = {
    plotTitle: string;
    curveAttributes: Map<string, CurveAttributes>;
    yAxisAttributes: YAxisAttributes[];
    manualAxisAssignment: boolean;
};
