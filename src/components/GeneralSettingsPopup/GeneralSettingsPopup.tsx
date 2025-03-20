import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { GeneralSettingsPopupProps } from "./GeneralSettingsPopup.types";
import * as styles from "./GeneralSettingsPopup.styles";

const GeneralSettingsPopup: React.FC<GeneralSettingsPopupProps> = ({
    open,
    onClose,
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth={false}
            sx={styles.dialogStyle}
        >
            <DialogTitle>
                Settings
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={styles.closeButtonStyle}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography variant="h4" sx={{ marginBottom: "8px" }}>
                    General
                </Typography>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Curabitur ac leo egestas, elementum sem sed, commodo sapien.
                Phasellus elementum ante elit, id blandit nisi scelerisque id.
                Maecenas nec nisi vitae massa mattis scelerisque eget vitae mi.
                Pellentesque mi orci, suscipit et pellentesque vel, elementum eu
                arcu. Praesent id purus et velit venenatis congue. Sed malesuada
                tortor ut dolor convallis posuere. Etiam mollis, eros ac mattis
                tincidunt, purus justo congue mi, id lacinia nisl orci eu mi.
                <Typography variant="h4" sx={{ marginBottom: "8px" }}>
                    Plot Defaults
                </Typography>
                Donec vulputate viverra fermentum. Vestibulum ullamcorper at
                neque ac consectetur. Praesent imperdiet posuere augue. Nullam
                volutpat malesuada maximus. Lorem ipsum dolor sit amet,
                consectetur adipiscing elit. In ultricies non mauris quis
                tincidunt. Nunc varius lorem sed nunc accumsan pellentesque.
                Mauris neque nulla, mollis vitae finibus vitae, iaculis a justo.
            </DialogContent>
        </Dialog>
    );
};

export default GeneralSettingsPopup;
