import { Box, Button, Typography } from "@mui/material";
import { useApiUrls } from "../ApiContext/ApiContext";

const Selector: React.FC = () => {
    const { backendUrl } = useApiUrls();

    return (
        <Box>
            {backendUrl}
        </Box>
    );
};

export default Selector;
