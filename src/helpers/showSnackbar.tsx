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

const showSnackbar = (
    message: string,
    type: AlertColor = "info",
    duration: number = 3000
) => {
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

export default showSnackbar;
