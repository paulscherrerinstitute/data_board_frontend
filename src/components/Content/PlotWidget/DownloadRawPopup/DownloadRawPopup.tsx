import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import * as styles from "./DownloadRawPopup.styles";
import { DownloadLink } from "./DownloadRawPopup.types";
import { Alert } from "@mui/material";
import showSnackbarAndLog, {
    logToConsole,
} from "../../../../helpers/showSnackbar";

interface DownloadRawPopupProps {
    links: DownloadLink[];
    onClose: () => void;
}

const DownloadRawPopup: React.FC<DownloadRawPopupProps> = ({
    links,
    onClose,
}) => {
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error("Failed to copy to clipboard", err);
        }
    };

    const downloadFile = async (name: string, url: string) => {
        setLoadingMap((prev) => ({ ...prev, [name]: true }));
        try {
            const res = await fetch(url, {
                headers: { Accept: "application/json" },
            });
            if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
            const blob = await res.blob();
            const downloadUrl = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `${name}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error(`Error downloading ${name}:`, err);
        } finally {
            setLoadingMap((prev) => ({ ...prev, [name]: false }));
        }
    };

    const downloadFramedFile = async (
        name: string,
        url: string
    ): Promise<void> => {
        setLoadingMap((prev) => ({ ...prev, [name]: true }));
        try {
            const response = await fetch(url, {
                headers: { Accept: "application/json-framed" },
            });
            if (!response.body) throw new Error("No response.body!");

            const reader = response.body.getReader();
            const textDecoder = new TextDecoder();
            let buffer = "";
            const allBatches: unknown[] = [];

            while (true) {
                const { value: chunk, done } = await reader.read();
                if (done) break;
                buffer += textDecoder.decode(chunk, { stream: true });

                while (true) {
                    const newlineIndex = buffer.indexOf("\n");
                    if (newlineIndex === -1) break;

                    const lengthHeader = buffer.slice(0, newlineIndex);
                    const frameLength = parseInt(lengthHeader, 10);
                    const frameTotalSize = newlineIndex + 1 + frameLength + 1;

                    if (isNaN(frameLength) || buffer.length < frameTotalSize)
                        break;

                    const jsonText = buffer.slice(
                        newlineIndex + 1,
                        newlineIndex + 1 + frameLength
                    );
                    allBatches.push(JSON.parse(jsonText));
                    buffer = buffer.slice(frameTotalSize);
                }
            }

            const blob = new Blob([JSON.stringify(allBatches, null, 2)], {
                type: "application/json",
            });
            const downloadUrl = URL.createObjectURL(blob);
            const linkElement = document.createElement("a");
            linkElement.href = downloadUrl;
            linkElement.download = `${name}.json`;
            document.body.appendChild(linkElement);
            linkElement.click();
            document.body.removeChild(linkElement);
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            showSnackbarAndLog(
                `Error downloading raw data for ${name}`,
                "error",
                error
            );
        } finally {
            setLoadingMap((prev) => ({ ...prev, [name]: false }));
        }
    };

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Raw Data Download Links</DialogTitle>
            <DialogContent dividers>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Raw data may be huge, bigger timespans may timeout.
                </Alert>
                <List sx={styles.linkListStyle}>
                    {links.map(({ name, link }) => (
                        <ListItem key={name} sx={styles.linkItemStyle}>
                            <Typography sx={styles.channelNameStyle}>
                                {name}
                            </Typography>
                            <Button
                                sx={styles.buttonStyle}
                                onClick={() => copyToClipboard(link)}
                            >
                                Copy Link
                            </Button>
                            <Button
                                sx={styles.buttonStyle}
                                onClick={() => downloadFile(name, link)}
                                disabled={loadingMap[name]}
                                startIcon={
                                    loadingMap[name] ? (
                                        <CircularProgress size={16} />
                                    ) : null
                                }
                            >
                                {loadingMap[name]
                                    ? "Downloading..."
                                    : "Download"}
                            </Button>
                            <Button
                                sx={styles.buttonStyle}
                                onClick={() => downloadFramedFile(name, link)}
                                disabled={loadingMap[name]}
                                startIcon={
                                    loadingMap[name] ? (
                                        <CircularProgress size={16} />
                                    ) : null
                                }
                            >
                                {loadingMap[name]
                                    ? "Downloading..."
                                    : "Download Framed"}
                            </Button>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default DownloadRawPopup;
