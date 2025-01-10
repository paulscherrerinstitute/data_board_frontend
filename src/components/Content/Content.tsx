import React, { useState, useCallback } from "react";
import { Box, Button, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"
import * as styles from "./Content.styles";
import TimeSelector from "./TimeSelector/TimeSelector";
import { Widget, Channel } from "./Content.types";
import { uniqueId } from "lodash";

const Content: React.FC = () => {
    const [timeValues, setTimeValues] = useState({
        startTime: "",
        endTime: "",
        queryExpansion: false,
    });
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [draggedOverKey, setDraggedOverKey] = useState("");
    const [hoveredOverKey, setHoveredOverKey] = useState("");

    const handleDrop = (event: React.DragEvent<HTMLElement>, key: string) => {
        event.preventDefault();
        setDraggedOverKey("");
        setHoveredOverKey("");
        const data = event.dataTransfer.getData("text");
        console.log("Dropped data:", data);
        try {
            const channel: Channel = JSON.parse(data);
            if (channel && channel.channelName && channel.backend) {
                if (key === "-1") {
                    setWidgets([
                        ...widgets,
                        {
                            key: uniqueId(),
                            channels: [
                                {
                                    channelName: channel.channelName,
                                    backend: channel.backend,
                                },
                            ],
                        },
                    ]);
                } else {
                    setWidgets((prevWidgets) =>
                        prevWidgets.map((widget) =>
                            widget.key === key
                                ? {
                                      ...widget,
                                      channels: [...widget.channels, channel],
                                  }
                                : widget
                        )
                    );
                }
            } else {
                console.error("Invalid channel structure.");
                alert("Invalid channel structure.");
            }
        } catch (error) {
            console.error("Error parsing dropped data as JSON:", error);
            alert(`Error parsing dropped data as JSON: ${error}`);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLElement>, key: string) => {
        event.preventDefault();
        setDraggedOverKey(key);
    };

    const handleDragLeave = () => {
        setDraggedOverKey("");
    };

    const handleRemoveWidget = (key: string) => {
        setWidgets((prevWidgets) => prevWidgets.filter((widget) => widget.key !== key));
    };

    const handleCreateWidget = () => {
        setWidgets([
            ...widgets,
            {
                key: uniqueId(),
                channels: [],
            },
        ]);
    };

    const handleMouseEnter = (key: string) => {
        setHoveredOverKey(key);
    }

    const handleMouseLeave = () => {
        setHoveredOverKey("");
    }

    const handleTimeChange = useCallback(
        (values: {
            startTime: string;
            endTime: string;
            queryExpansion: boolean;
        }) => {
            setTimeValues(values);
            console.log("Updated Time Values:", values);
        },
        []
    );

    const handleRefresh = () => {
        console.log("refreshed");
        console.log("Current Time Values:", timeValues);
    };

    return (
        <Box sx={styles.contentContainerStyles}>
            <Box sx={styles.topBarStyles}>
                <TimeSelector
                    onTimeChange={handleTimeChange}
                    onRefresh={handleRefresh}
                />
            </Box>

            <Box sx={styles.gridContainerStyles}>
                {widgets.map(({ key, channels }) => (
                    <Box
                        sx={{
                            ...styles.gridItemStyles,
                            position: "relative",
                            transform: draggedOverKey === key ? "scale(1.05)" : "scale(1)",
                            transition: "transform 0.2s ease",
                        }}
                        onDrop={(event) => handleDrop(event, key)}
                        onDragOver={(event) => handleDragOver(event, key)}
                        onDragLeave={handleDragLeave}
                        onMouseEnter={() => handleMouseEnter(key)}
                        onMouseLeave={handleMouseLeave}
                        key={key}
                    >
                        {hoveredOverKey === key && (
                            <IconButton
                                onClick={() => handleRemoveWidget(key)}
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    color: "white",
                                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                                    "&:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                                    },
                                    zIndex: 1,
                                }}
                                size="small"
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        )}
                        <Typography
                            variant="h6"
                            color="textPrimary"
                            sx={{ marginBottom: 2 }}
                        >
                            Drag and Drop Channels to Plot:
                            {channels.map((channel, index) => (
                                <Typography
                                    variant="body1"
                                    color="textSecondary"
                                    key={index}
                                >
                                    {channel.channelName} ({channel.backend})
                                </Typography>
                            ))}
                        </Typography>
                    </Box>
                ))}
                <Button
                    onDrop={(event) => handleDrop(event, "-1")}
                    onDragOver={(event) => handleDragOver(event, "-1")}
                    onDragLeave={handleDragLeave}
                    sx={{
                        ...styles.CreateWidgetStyles,
                        transform: draggedOverKey === "-1" ? "scale(1.05)" : "scale(1)",
                        transition: "transform 0.2s ease",
                    }}
                    aria-label="Add new"
                    onClick={handleCreateWidget}
                ></Button>
            </Box>
        </Box>
    );
};

export default Content;
