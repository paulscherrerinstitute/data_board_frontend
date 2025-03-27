import { Box, CircularProgress, Tooltip } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { Curve } from "../PlotWidget.types";
import * as styles from "./LegendEntry.styles";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const LegendEntry: React.FC<{
    curve: Curve;
    label: string;
    displayLabel: string | undefined;
    color: string | undefined;
    onChannelDragStart: (e: React.DragEvent, curve: Curve) => void;
    handleRemoveCurve: (label: string) => void;
}> = ({
    curve,
    label,
    displayLabel,
    color,
    onChannelDragStart,
    handleRemoveCurve,
}) => {
    const [isSmall, setIsSmall] = useState(false);
    const legendEntryRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new ResizeObserver(() => {
            if (legendEntryRef.current) {
                const width = legendEntryRef.current.offsetWidth;
                setIsSmall(width < 200);
            }
        });

        if (legendEntryRef.current) {
            observer.observe(legendEntryRef.current);
        }

        return () => {
            if (legendEntryRef.current) {
                observer.unobserve(legendEntryRef.current);
            }
        };
    }, []);

    return (
        <Box
            className="legendEntry"
            ref={legendEntryRef}
            sx={{
                ...styles.legendEntryStyle,
                flexDirection: isSmall ? "column" : "row",
                alignItems: isSmall ? "center" : "flex-start",
            }}
        >
            <Box
                sx={{
                    alignSelf: isSmall ? "unset" : "center",
                }}
            >
                {curve.isLoading ? (
                    <CircularProgress
                        size="1rem"
                        disableShrink={true}
                        sx={styles.statusSymbolStyle}
                    />
                ) : curve.error ? (
                    <Tooltip title={curve.error} arrow>
                        <ErrorOutlineIcon color="error" />
                    </Tooltip>
                ) : (
                    <span
                        style={{
                            display: "inline-block",
                            width: "16px",
                            height: "16px",
                            backgroundColor: color,
                        }}
                    ></span>
                )}
            </Box>
            <span
                style={{
                    overflowWrap: "break-word",
                    maxWidth: isSmall ? "" : "calc(100% - 100px)",
                    textAlign: isSmall ? "center" : "left",
                    writingMode: isSmall ? "vertical-rl" : "horizontal-tb",
                }}
            >
                {displayLabel}
            </span>
            <Box
                sx={{
                    ...styles.interactiveLegendElementsStyle,
                    flexDirection: isSmall ? "column" : "row",
                    marginLeft: isSmall ? "0" : "auto",
                    alignSelf: isSmall ? "unset" : "center",
                }}
            >
                <Box
                    sx={styles.dragIconStyle}
                    draggable={true}
                    onDragStart={(e: React.DragEvent) => {
                        onChannelDragStart(e, curve);
                    }}
                >
                    <DragIndicatorIcon />
                </Box>
                <button
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "red",
                        fontWeight: "bold",
                    }}
                    onClick={() => handleRemoveCurve(label)}
                >
                    ✖
                </button>
            </Box>
        </Box>
    );
};

export default LegendEntry;
