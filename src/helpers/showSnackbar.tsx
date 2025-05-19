import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Snackbar, Alert, AlertColor, Box } from "@mui/material";

interface SnackbarMessage {
    id: number;
    message: string;
    type: AlertColor;
    duration: number;
}

const SnackbarStack = ({
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
            pointerEvents: "none",
            zIndex: 1300,
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

const SnackbarContainer = ({
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
                pointerEvents: "auto",
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

let root: ReactDOM.Root | null = null;
let messages: SnackbarMessage[] = [];
let idCounter = 0;

const update = () => {
    if (!root) return;
    root.render(
        <SnackbarStack
            messages={messages}
            onRemove={(id) => {
                messages = messages.filter((m) => m.id !== id);
                update();
            }}
        />
    );
};

export const logToConsole = (
    message: string,
    type: AlertColor,
    details?: unknown
) => {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${message}`;

    if (type === "warning" || type === "error") {
        console.error(formattedMessage);
        if (details) {
            console.error(details);
        }
    } else {
        console.log(formattedMessage);
        if (details) {
            console.log(details);
        }
    }
};

const showSnackbarAndLog = (
    message: string,
    type: AlertColor = "info",
    details?: unknown,
    duration: number = 3000
) => {
    logToConsole(message, type, details);

    if (!root) {
        const div = document.createElement("div");
        document.body.appendChild(div);
        root = ReactDOM.createRoot(div);
    }

    messages.push({ id: ++idCounter, message, type, duration });
    if (messages.length > 3) messages.shift();
    update();
};

export default showSnackbarAndLog;
