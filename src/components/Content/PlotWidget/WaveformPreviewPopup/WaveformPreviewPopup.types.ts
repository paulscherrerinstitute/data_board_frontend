import { BackendCurveData, Curve } from "../PlotWidget.types";

export interface WaveformPreviewPopupProps {
    waveformPreviewData: WaveformPreviewData | undefined;
    setWaveformPreviewData: React.Dispatch<
        React.SetStateAction<WaveformPreviewData | undefined>
    >;
}

export type WaveformPreviewData = Omit<Curve, "curveData"> & {
    curveData: BackendCurveData;
};
