import { Curve } from "../PlotWidget.types";

export interface DownloadRawPopupProps {
    startTime: number;
    endTime: number;
    curves: Curve[];
    onClose: () => void;
}

export type DownloadLink = {
    name: string;
    link: string;
};
