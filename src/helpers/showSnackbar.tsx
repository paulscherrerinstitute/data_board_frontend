import ReactDOM from "react-dom/client";
import { AlertColor } from "@mui/material";
import { SnackbarStack } from "./showSnackbarHooks";

export interface SnackbarMessage {
    id: number;
    message: string;
    type: AlertColor;
    duration: number;
}

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
