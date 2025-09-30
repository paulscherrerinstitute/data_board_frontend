import { useEffect, useState } from "react";
import { SnackbarMessage } from "./showSnackbar";
import { Snackbar, Alert, AlertColor, Box } from "@mui/material";

export const SnackbarStack = ({
    messages,
    onRemove,
}: {
    messages: SnackbarMessage[];
    onRemove: (id: number) => void;
}) => (
    <Box
        sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 2000,
        }}
    >
        {messages.map((m, idx) => (
            <SnackbarContainer
                key={m.id}
                message={m.message}
                type={m.type}
                duration={m.duration}
                offset={idx}
                onClose={() => onRemove(m.id)}
            />
        ))}
    </Box>
);

export const SnackbarContainer = ({
    message,
    type,
    duration,
    offset,
    onClose,
}: {
    message: string;
    type: AlertColor;
    duration: number;
    offset: number;
    onClose: () => void;
}) => {
    const [open, setOpen] = useState(true);

    useEffect(() => {
        if (duration < 0) return;
        const timer = setTimeout(() => {
            setOpen(false);
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const handleClose = (_: unknown, reason?: string) => {
        if (reason === "clickaway") return;
        setOpen(false);
        onClose();
    };

    return (
        <Snackbar
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            autoHideDuration={duration >= 0 ? duration : undefined}
            sx={{
                mt: `${8 + offset * 60}px`,
                transition: "margin 500ms ease",
            }}
        >
            <Alert severity={type} onClose={handleClose} sx={{ width: "100%" }}>
                {message}
            </Alert>
        </Snackbar>
    );
};
