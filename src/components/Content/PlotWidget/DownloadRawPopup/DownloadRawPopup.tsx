import React, { useEffect, useState } from "react";
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
import { Alert, Box, Tooltip } from "@mui/material";
import showSnackbarAndLog, {
    logToConsole,
} from "../../../../helpers/showSnackbar";
import { DownloadLink, DownloadRawPopupProps } from "./DownloadRawPopup.types";
import axios from "axios";
import { useApiUrls } from "../../../ApiContext/ApiContext";

const DownloadRawPopup: React.FC<DownloadRawPopupProps> = ({
    startTime,
    endTime,
    curves,
    onClose,
}) => {
    const [loadingLinks, setLoadingLinks] = useState(true);
    const [loadingLinksFailed, setLoadingLinksFailed] = useState(false);
    const [downloadingMap, setDownloadingMap] = useState<
        Record<string, boolean>
    >({});
    const [links, setLinks] = useState<DownloadLink[]>([]);

    const { backendUrl } = useApiUrls();

    useEffect(() => {
        const fetchRawLinks = async () => {
            setLoadingLinks(true);
            setLoadingLinksFailed(false);

            if (!curves?.length) {
                setLoadingLinks(false);
                logToConsole("No channels to fetch data from.", "warning");
                return;
            }

            try {
                const rawDataLinks = await Promise.all(
                    curves.flatMap(({ backend, name }) =>
                        axios
                            .get(`${backendUrl}/channels/raw-link`, {
                                params: {
                                    channel_name: name,
                                    begin_time: startTime,
                                    end_time: endTime,
                                    backend,
                                },
                                responseType: "json",
                            })
                            .then((res) => {
                                if (!res.data?.link) {
                                    throw new Error(
                                        `No link for ${name} in backend: ${backend}`
                                    );
                                }
                                return { name, link: res.data.link };
                            })
                    )
                );

                setLinks(rawDataLinks);
            } catch (error) {
                showSnackbarAndLog("downloadDataRaw failed:", "error", error);
                setLoadingLinksFailed(true);
            } finally {
                setLoadingLinks(false);
            }
        };
        fetchRawLinks();
    }, [backendUrl, startTime, endTime, curves]);

    const copyToClipboard = async (text: string) => {
        const isSecureContext = window.isSecureContext;

        if (isSecureContext && navigator.clipboard?.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                return;
            } catch (error) {
                logToConsole("Clipboard API copy failed", "error", error);
            }
        }

        showSnackbarAndLog(
            `Copying to clipboard isn't available.\n\nPlease copy the text manually:\n\n${text}`,
            "error",
            null,
            60000
        );
    };

    const downloadFile = async (name: string, url: string) => {
        setDownloadingMap((prev) => ({ ...prev, [name]: true }));
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
        } catch (error) {
            showSnackbarAndLog(`Error downloading ${name}:`, "error", error);
        } finally {
            setDownloadingMap((prev) => ({ ...prev, [name]: false }));
        }
    };

    const downloadAndDisplay = async (name: string, url: string) => {
        setDownloadingMap((prev) => ({ ...prev, [name]: true }));
        try {
            const res = await fetch(url, {
                headers: { Accept: "application/json" },
            });
            if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

            let formattedJson = "No Data";
            try {
                const data = await res.json();
                formattedJson = JSON.stringify(data, null, 2);
            } catch {
                // JSON parse failed, leave formattedJson as "No Data"
            }

            const popup = window.open(
                "",
                "_blank",
                "width=600,height=400,scrollbars=yes,resizable=yes"
            );
            if (!popup) throw new Error("Popup blocked");

            popup.document.title = `${name} - JSON Data`;
            popup.document.body.style.whiteSpace = "pre-wrap";
            popup.document.body.style.fontFamily = "monospace";
            popup.document.body.style.padding = "10px";
            popup.document.body.textContent = formattedJson;
        } catch (error) {
            showSnackbarAndLog(
                `Error fetching/displaying ${name}:`,
                "error",
                error
            );
        } finally {
            setDownloadingMap((prev) => ({ ...prev, [name]: false }));
        }
    };

    const downloadFramedFile = async (
        name: string,
        url: string
    ): Promise<void> => {
        setDownloadingMap((prev) => ({ ...prev, [name]: true }));
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
            setDownloadingMap((prev) => ({ ...prev, [name]: false }));
        }
    };

    return (
        <Dialog
            open
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            disableEnforceFocus
        >
            <DialogTitle>Raw Data Download Links</DialogTitle>
            <DialogContent dividers>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Raw data may be huge, bigger timespans may timeout.
                </Alert>

                {loadingLinks ? (
                    <Box sx={styles.loadingBoxStyle}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <List sx={styles.linkListStyle}>
                        {links.length === 0 && "No Links available"}
                        {loadingLinksFailed && "Failed to fetch links"}
                        {links.map(({ name, link }) => (
                            <ListItem key={name} sx={styles.linkItemStyle}>
                                <Typography sx={styles.channelNameStyle}>
                                    {name}
                                </Typography>
                                <Tooltip title={link} placement="top" arrow>
                                    <Button
                                        sx={styles.buttonStyle}
                                        onClick={() => copyToClipboard(link)}
                                    >
                                        Copy Link
                                    </Button>
                                </Tooltip>
                                <Button
                                    sx={styles.buttonStyle}
                                    onClick={() =>
                                        downloadAndDisplay(name, link)
                                    }
                                    disabled={downloadingMap[name]}
                                    startIcon={
                                        downloadingMap[name] ? (
                                            <CircularProgress size={16} />
                                        ) : null
                                    }
                                >
                                    {downloadingMap[name]
                                        ? "Downloading..."
                                        : "Download & Display"}
                                </Button>
                                <Button
                                    sx={styles.buttonStyle}
                                    onClick={() => downloadFile(name, link)}
                                    disabled={downloadingMap[name]}
                                    startIcon={
                                        downloadingMap[name] ? (
                                            <CircularProgress size={16} />
                                        ) : null
                                    }
                                >
                                    {downloadingMap[name]
                                        ? "Downloading..."
                                        : "Download At Once"}
                                </Button>
                                <Button
                                    sx={styles.buttonStyle}
                                    onClick={() =>
                                        downloadFramedFile(name, link)
                                    }
                                    disabled={downloadingMap[name]}
                                    startIcon={
                                        downloadingMap[name] ? (
                                            <CircularProgress size={16} />
                                        ) : null
                                    }
                                >
                                    {downloadingMap[name]
                                        ? "Downloading..."
                                        : "Download Framed"}
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default DownloadRawPopup;
