import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Snackbar, Alert, AlertColor } from "@mui/material";

const SnackbarContainer = ({
    message,
    type,
    duration,
    onClose,
}: {
    message: string;
    type: AlertColor;
    duration: number;
    onClose: () => void;
}) => {
    const [open, setOpen] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setOpen(false);
            setTimeout(onClose, 500);
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <Snackbar
            open={open}
            autoHideDuration={duration}
            onClose={() => setOpen(false)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
            <Alert
                severity={type}
                onClose={() => setOpen(false)}
                sx={{ width: "100%" }}
            >
                {message}
            </Alert>
        </Snackbar>
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

    const snackbarRoot = document.createElement("div");
    document.body.appendChild(snackbarRoot);
    const root = ReactDOM.createRoot(snackbarRoot);

    const removeSnackbar = () => {
        root.unmount();
        document.body.removeChild(snackbarRoot);
    };

    root.render(
        <SnackbarContainer
            message={message}
            type={type}
            duration={duration}
            onClose={removeSnackbar}
        />
    );
};

export default showSnackbarAndLog;
