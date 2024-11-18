import { SxProps, Theme } from "@mui/material";

export const contentContainerStyles: SxProps<Theme> = {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start", // Align top
    height: "100%",
    overflowY: "auto", // Allow vertical scrolling if content overflows
};

export const topBarStyles: SxProps<Theme> = {
    width: "100%",
    height: "10vh", // 10% of the screen height
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderBottom: "1px solid #ccc",
};

export const gridContainerStyles: SxProps<Theme> = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(20vw, 1fr))", // 20% screen width, auto-fill for responsive layout
    gap: "16px", // Space between grid items
    width: "100%",
    padding: "16px",
    flexGrow: 1, // Make sure the grid takes up the remaining space
    overflowY: "auto", // Allow vertical scrolling if content overflows
    justifyItems: "center", // Center items horizontally
    placeItems: "center", // Center items vertically when they don't fill the row
};

export const gridItemStyles: SxProps<Theme> = {
    width: "20vw", // Fixed width of 20% of the viewport width
    height: "20vh", // Fixed height of 20% of the viewport height
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease",
    "&:hover": {
        transform: "scale(1.05)", // Slight zoom effect on hover
    },
};
