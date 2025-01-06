import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, Typography } from "@mui/material";
import * as styles from "./Content.styles";
import { useApiUrls } from "../ApiContext/ApiContext";
import TimeSelector from "./TimeSelector/TimeSelector";

const Content: React.FC = () => {
    const { backendUrl } = useApiUrls();
    const gridItems = [1, 2, 3, 4, 5];
    const [counter, setCounter] = useState<number | null>(null);
    const [timeValues, setTimeValues] = useState({
        startTime: "",
        endTime: "",
        queryExpansion: false,
    });

    useEffect(() => {
        // Fetch the current counter from the backend
        fetch(`${backendUrl}/counter`)
            .then((response) => response.json())
            .then((data) => setCounter(data.counter))
            .catch((error) => console.error("Error fetching counter:", error));
    }, [backendUrl]);

    const incrementCounter = () => {
        fetch(`${backendUrl}/increment`, {
            method: "POST",
        })
            .then((response) => response.json())
            .then((data) => setCounter(data.counter))
            .catch((error) =>
                console.error("Error incrementing counter:", error)
            );
    };

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
            {/* Top Bar Placeholder */}
            <Box sx={styles.topBarStyles}>
                <TimeSelector
                    onTimeChange={handleTimeChange}
                    onRefresh={handleRefresh}
                />
            </Box>

            {/* Grid of elements */}
            <Box sx={styles.gridContainerStyles}>
                {gridItems.map((item, index) => (
                    <Box key={index} sx={styles.gridItemStyles}>
                        <Typography
                            variant="h6"
                            color="textPrimary"
                            sx={{ marginBottom: 2 }}
                        >
                            Counter: {counter !== null ? counter : "Loading..."}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={incrementCounter}
                            disabled={counter === null}
                        >
                            Increment Counter {item}
                        </Button>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default Content;
