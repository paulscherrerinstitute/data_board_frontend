import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";
import ReactDOM from "react-dom/client";

type Choice = "point" | "range" | null;

export function showWaveformPreviewChoiceDialog(): Promise<Choice> {
    return new Promise<Choice>((resolve) => {
        const div = document.createElement("div");
        document.body.appendChild(div);

        const root = ReactDOM.createRoot(div);

        const handleClose = (choice: Choice) => {
            resolve(choice);
            setTimeout(() => {
                root.unmount();
                div.remove();
            }, 0);
        };

        const DialogComponent = () => {
            return (
                <Dialog open onClose={() => handleClose(null)}>
                    <DialogTitle>Select Preview Mode</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Do you want to preview the waveform for the clicked
                            point, or the full zoomed range?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => handleClose("point")}
                            variant="contained"
                        >
                            Clicked Point
                        </Button>

                        <Button onClick={() => handleClose("range")}>
                            Zoomed Range
                        </Button>
                        <Button
                            onClick={() => handleClose(null)}
                            color="inherit"
                        >
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            );
        };

        root.render(<DialogComponent />);
    });
}
