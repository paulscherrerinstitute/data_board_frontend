import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import {
    contentContainerStyles,
    topBarStyles,
    gridContainerStyles,
    gridItemStyles,
} from "./Content.styles";
import { useApiUrls } from "../ApiContext/ApiContext";

const Content: React.FC = () => {
    const { backendUrl } = useApiUrls();
    const [counter, setCounter] = useState<number | null>(null);

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

    const gridItems = [1, 2, 3, 4, 5]; // Hardcoding 5 items for now

    return (
        <Box sx={contentContainerStyles}>
            {/* Top Bar Placeholder */}
            <Box sx={topBarStyles}>
                <Typography variant="h6" color="textSecondary">
                    Here would be the time specification
                </Typography>
            </Box>

            {/* Grid of elements */}
            <Box sx={gridContainerStyles}>
                {gridItems.map((item, index) => (
                    <Box key={index} sx={gridItemStyles}>
                        <Typography variant="h6" color="textPrimary" sx={{ marginBottom: 2 }}>
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
