import React, {
    useState,
    useMemo,
    useEffect,
    useCallback,
    useRef,
} from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    MenuItem,
    Select,
    Checkbox,
    ListItemText,
    useTheme,
    Tooltip,
} from "@mui/material";
import debounce from "lodash/debounce";
import axios from "axios";
import { List as ListWindow } from "react-window";
import { useApiUrls } from "../ApiContext/ApiContextHooks";
import ListItemRowComponent from "./ListItemRow/ListItemRow";
import * as styles from "./Selector.styles";
import { throttle } from "lodash";
import {
    ADD_CHANNELS_TO_FIRST_PLOT_EVENT,
    Channel,
    SelectorProps,
    StoredChannel,
    AddChannelsToFirstPlotEvent,
} from "./Selector.types";
import showSnackbarAndLog from "../../helpers/showSnackbar";
import AddIcon from "@mui/icons-material/Add";
import { useLocalStorage } from "../../helpers/useLocalStorage";
import { defaultKeepSidebarClosedAfterDrag } from "../../helpers/defaults";
import { SidebarIgnoredMenuProps } from "../../helpers/misc";
import AutoSizer from "react-virtualized-auto-sizer";

const Selector: React.FC<SelectorProps> = ({ setSidebarIsFocused }) => {
    const { backendUrl } = useApiUrls();
    const [keepSidebarClosedAfterDrag] = useLocalStorage(
        "keepSidebarClosedAfterDrag",
        defaultKeepSidebarClosedAfterDrag
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedBackends, setSelectedBackends] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [backendOptions, setBackendOptions] = useState<string[]>([]);
    const [typeOptions, setTypeOptions] = useState<string[]>([]);
    const [maxCharacters, setMaxCharacters] = useState<number>(20);
    const [searchResultsIsRecent, setSearchResultsIsRecent] = useState(true);
    const [storedChannels, setStoredChannels] = useState<StoredChannel[]>([]);
    const [searchRegex, setSearchRegex] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const alreadyFetchedRecentRef = useRef(false);
    const selectRef = useRef<HTMLHeadingElement>(null);
    const searchIsRunningRef = useRef(false);
    const theme = useTheme();

    const filteredChannels = useMemo(() => {
        let regex: RegExp | null = null;
        if (searchRegex) {
            try {
                regex = new RegExp(searchRegex, "i");
            } catch (error) {
                showSnackbarAndLog(
                    "Invalid search regex, treating it as plain string search!",
                    "warning",
                    error
                );
            }
        }

        return storedChannels.filter((channel) => {
            const matchesBackend =
                selectedBackends.length === 0 ||
                selectedBackends.includes(channel.attributes.backend);
            const matchesType =
                selectedTypes.length === 0 ||
                selectedTypes.includes(channel.attributes.type);
            const matchesSearch =
                !searchRegex ||
                (regex && regex.test(channel.attributes.name)) ||
                (!regex && channel.attributes.name.includes(searchRegex));

            return matchesBackend && matchesType && matchesSearch;
        });
    }, [storedChannels, selectedBackends, selectedTypes, searchRegex]);

    useEffect(() => {
        const updateMaxCharacters = throttle(() => {
            if (selectRef.current) {
                const width = selectRef.current.offsetWidth;
                // Magic formula I discovered (brute forced), achieves the best character limits I could achieve amongst all screen sizes / resolutions.
                setMaxCharacters(
                    Math.floor(width / 14.3 - Math.min(width / 14.3, 11.3))
                );
            }
        }, 16); // 16ms =~ 60fps

        const observer = new ResizeObserver(() => updateMaxCharacters());

        if (selectRef.current) {
            observer.observe(selectRef.current);
        }

        return () => observer.disconnect();
    });

    const fetchRecent = useCallback(async () => {
        try {
            const response = await axios.get<{
                channels: Channel[];
            }>(`${backendUrl}/channels/recent`);

            const newStoredChannels = [
                ...response.data.channels.map((channel) => ({
                    attributes: channel,
                    selected: false,
                })),
            ].sort((a, b) =>
                (
                    a.attributes.backend +
                    a.attributes.name +
                    a.attributes.type
                ).localeCompare(
                    b.attributes.backend + b.attributes.name + b.attributes.type
                )
            );
            setStoredChannels(newStoredChannels);

            // Extract unique backends and data types, used for filtering
            const backends = Array.from(
                new Set(
                    newStoredChannels.map(
                        (channel) => channel.attributes.backend
                    )
                )
            );
            const types = Array.from(
                new Set(
                    newStoredChannels.map((channel) => channel.attributes.type)
                )
            );

            setBackendOptions(backends);
            setTypeOptions(types);
            setSelectedBackends(backends);
            setSelectedTypes(types);
        } catch (error) {
            showSnackbarAndLog(
                "Failed to fetch recent channels",
                "error",
                error
            );
        }
    }, [backendUrl]);

    useEffect(() => {
        if (alreadyFetchedRecentRef.current) {
            return;
        }
        alreadyFetchedRecentRef.current = true;
        fetchRecent();
    }, [fetchRecent]);

    const debouncedSearch = useMemo(
        () =>
            // eslint-disable-next-line react-hooks/refs -- safe: ref accessed in debounced async callback --> function may be redeclared on render, but not executed on render.
            debounce(async (term: string) => {
                if (searchIsRunningRef.current) {
                    return;
                }
                searchIsRunningRef.current = true;
                setError(null);
                setLoading(true);
                try {
                    setSearchRegex(term.trim());

                    const response = await axios.get<{
                        channels: Channel[];
                    }>(`${backendUrl}/channels/search`, {
                        params: {
                            search_text: term,
                        },
                    });

                    const previousSelectedKeys = new Set(
                        storedChannels
                            .filter((channel) => channel.selected)
                            .map((channel) => channel.attributes.seriesId)
                    );

                    const newStoredChannels = [
                        ...response.data.channels.map((channel) => ({
                            attributes: channel,
                            selected: previousSelectedKeys.has(channel.seriesId)
                                ? true
                                : false,
                        })),
                    ].sort((a, b) =>
                        (
                            a.attributes.backend +
                            a.attributes.name +
                            a.attributes.type
                        ).localeCompare(
                            b.attributes.backend +
                                b.attributes.name +
                                b.attributes.type
                        )
                    );

                    setSelectAll(
                        newStoredChannels.every((channel) => channel.selected)
                    );

                    setStoredChannels(newStoredChannels);

                    // Extract unique backends and data types, used for filtering
                    const backends = Array.from(
                        new Set(
                            newStoredChannels.map(
                                (channel) => channel.attributes.backend
                            )
                        )
                    );
                    const types = Array.from(
                        new Set(
                            newStoredChannels.map(
                                (channel) => channel.attributes.type
                            )
                        )
                    );

                    // In case the filters are empty or selecting everything, set them to include all data just fetched
                    if (
                        (selectedBackends.length === 0 &&
                            selectedTypes.length === 0) ||
                        (selectedBackends.length === backendOptions.length &&
                            selectedTypes.length === typeOptions.length)
                    ) {
                        setSelectedBackends(backends);
                        setSelectedTypes(types);
                    }

                    setBackendOptions(backends);
                    setTypeOptions(types);

                    setSearchResultsIsRecent(false);
                } catch (error) {
                    setError("Error fetching channels");
                    showSnackbarAndLog(
                        "Failed to fetch channels",
                        "error",
                        error
                    );
                }
                setLoading(false);
                searchIsRunningRef.current = false;
            }, 500),
        [
            backendUrl,
            selectedBackends.length,
            selectedTypes.length,
            backendOptions.length,
            typeOptions.length,
            storedChannels,
        ]
    );

    const handleSearchTermChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value);
            debouncedSearch(e.target.value);
        },
        [debouncedSearch]
    );

    const handleKeyPress = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === "Enter") {
                debouncedSearch(searchTerm);
            }
        },
        [debouncedSearch, searchTerm]
    );

    const handleSelectChannel = useCallback(
        (seriesId: string) => {
            const newStoredChannels = storedChannels.map((channel) =>
                channel.attributes.seriesId === seriesId
                    ? { ...channel, selected: true }
                    : channel
            );
            setStoredChannels(newStoredChannels);
            if (newStoredChannels.every((channel) => channel.selected)) {
                setSelectAll(true);
            }
        },
        [storedChannels]
    );

    const handleDeselectChannel = useCallback(
        (seriesId: string) => {
            setSelectAll(false);
            const newStoredChannels = storedChannels.map((channel) =>
                channel.attributes.seriesId === seriesId
                    ? { ...channel, selected: false }
                    : channel
            );
            setStoredChannels(newStoredChannels);
        },
        [storedChannels]
    );

    const handleDragStart = useCallback(
        (event: React.DragEvent, initiatorSeriesId: string) => {
            // Mark the initiator as selected
            let newStoredChannels = storedChannels;
            const initiatorIsSelected =
                storedChannels.find(
                    (channel) =>
                        channel.attributes.seriesId === initiatorSeriesId
                )?.selected || false;
            if (!initiatorIsSelected) {
                newStoredChannels = storedChannels.map((channel) =>
                    channel.attributes.seriesId === initiatorSeriesId
                        ? { ...channel, selected: true }
                        : channel
                );
                setStoredChannels(newStoredChannels);
            }
            // Collect the selected channels
            const selectedChannels = newStoredChannels.filter(
                (channel) => channel.selected
            );

            const channelsToTransfer = selectedChannels.map(
                (channel) => channel.attributes
            );

            // Set the data for drag event
            event.dataTransfer.setData(
                "text",
                JSON.stringify(channelsToTransfer)
            );

            // Create the drag preview
            const dragPreview = document.createElement("div");
            dragPreview.style.cssText = `
                display: flex; align-items: center; padding: 10px; width: 300px; 
                background: #333; border-radius: 5px; color: white; font-weight: bold;
            `;

            if (selectedChannels.length === 1) {
                dragPreview.innerText = `${channelsToTransfer[0].name} (${channelsToTransfer[0].backend} - ${channelsToTransfer[0].type || "unknown"})`;
            } else {
                dragPreview.innerText = `Multiple Channels`;
            }

            document.body.appendChild(dragPreview);
            event.dataTransfer.setDragImage(dragPreview, 0, 0);

            setTimeout(() => {
                // Remove the preview after the drag starts
                dragPreview.remove();
                // To allow plots overlayed by the sidebar to be reached
                setSidebarIsFocused(false);
            });

            const onDragEnd = () => {
                if (!keepSidebarClosedAfterDrag) {
                    setSidebarIsFocused(true);
                }
                // Unselect the channel if it was previously unselected once the drag ends
                if (!initiatorIsSelected) {
                    newStoredChannels = newStoredChannels.map((channel) =>
                        channel.attributes.seriesId === initiatorSeriesId
                            ? { ...channel, selected: false }
                            : channel
                    );
                    setStoredChannels(newStoredChannels);
                }
            };

            event.currentTarget.addEventListener("dragend", onDragEnd, {
                once: true,
            });
        },
        [storedChannels, keepSidebarClosedAfterDrag, setSidebarIsFocused]
    );

    const handleSelectAll = useCallback(() => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        const updatedChannels = storedChannels.map((channel) => ({
            ...channel,
            selected: newSelectAll,
        }));

        setStoredChannels(updatedChannels);
    }, [selectAll, storedChannels]);

    const handleAddSelectedToFirstPlot = useCallback(() => {
        const selectedChannels = storedChannels.filter(
            (channel) => channel.selected
        );
        if (selectedChannels.length === 0) return;

        const channelsToTransfer = selectedChannels.map(
            (channel) => channel.attributes
        );

        const addChannelsToFirstPlotEvent: AddChannelsToFirstPlotEvent =
            new CustomEvent(ADD_CHANNELS_TO_FIRST_PLOT_EVENT, {
                detail: {
                    channels: channelsToTransfer,
                },
            });

        window.dispatchEvent(addChannelsToFirstPlotEvent);
    }, [storedChannels]);

    return (
        <Box sx={styles.containerStyle} ref={selectRef}>
            <Typography sx={styles.typographyTitleStyle}>
                Channel Selector
            </Typography>

            {/* Search box */}
            <TextField
                label="Search for a channel"
                variant="outlined"
                fullWidth
                value={searchTerm}
                helperText="Regex is supported"
                onChange={handleSearchTermChange}
                onKeyDown={handleKeyPress}
                sx={styles.searchBoxStyle}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={() => debouncedSearch(searchTerm)}
                sx={styles.buttonStyle}
                fullWidth
            >
                Search
            </Button>

            {/* Filter Box */}
            <Box sx={styles.filterBoxStyle}>
                <Typography sx={styles.typographyHeaderStyle}>
                    Filters
                    {backendOptions.length === 0 && (
                        <> (must search for channels first)</>
                    )}
                    :
                </Typography>
                <Box sx={{ ...styles.dropwDownBoxStyle }}>
                    <Select
                        multiple
                        value={selectedBackends}
                        onChange={(e) =>
                            setSelectedBackends(e.target.value as string[])
                        }
                        renderValue={(selected) => {
                            const concatenated = selected.join(", ");
                            return concatenated.length > maxCharacters
                                ? `${concatenated.slice(0, maxCharacters)}...`
                                : concatenated;
                        }}
                        sx={styles.filterDropdownStyle}
                        MenuProps={SidebarIgnoredMenuProps}
                    >
                        {backendOptions.map((backend) => (
                            <MenuItem
                                key={backend}
                                value={backend}
                                sx={styles.menuItemStyle}
                            >
                                <Checkbox
                                    checked={selectedBackends.includes(backend)}
                                />
                                <ListItemText primary={backend} />
                            </MenuItem>
                        ))}
                    </Select>
                    <Select
                        multiple
                        value={selectedTypes}
                        onChange={(e) =>
                            setSelectedTypes(e.target.value as string[])
                        }
                        renderValue={(selected) => {
                            const concatenated = selected
                                .map((type) => type || "unknown")
                                .join(", ");
                            return concatenated.length > maxCharacters
                                ? `${concatenated.slice(0, maxCharacters)}...`
                                : concatenated;
                        }}
                        sx={styles.filterDropdownStyle}
                        MenuProps={SidebarIgnoredMenuProps}
                    >
                        {typeOptions.map((type) => (
                            <MenuItem
                                key={type}
                                value={type}
                                sx={styles.menuItemStyle}
                            >
                                <Checkbox
                                    checked={selectedTypes.includes(type)}
                                />
                                <ListItemText primary={type || "unknown"} />
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </Box>

            {/* filtered channels */}
            <Box sx={styles.listBoxStyle}>
                <Typography sx={styles.typographyHeaderStyle}>
                    {searchResultsIsRecent
                        ? "Recent Channels"
                        : "Search Results"}{" "}
                    ({filteredChannels.length})
                </Typography>
                <Typography sx={styles.typographyHeaderStyle}>
                    Drag into Plot to display.
                </Typography>
                <Box sx={styles.selectedOptionsStyle}>
                    <Box sx={styles.selectAllStyle}>
                        <Tooltip title="Click on a checkbox and press the '+ Add selected' to add a channel to the plot">
                            <Checkbox
                                checked={selectAll}
                                onChange={handleSelectAll}
                                sx={styles.checkboxStyle}
                            />
                        </Tooltip>
                        <Typography>Select All</Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{ textTransform: "none" }}
                        onClick={handleAddSelectedToFirstPlot}
                    >
                        Add selected to first plot
                    </Button>
                </Box>

                {loading && <CircularProgress sx={styles.statusSymbolStyle} />}
                {error && (
                    <Alert severity="error" sx={styles.statusSymbolStyle}>
                        {error}
                    </Alert>
                )}
                <AutoSizer disableWidth>
                    {({ height }) => (
                        <div
                            style={{
                                display: "flex",
                            }}
                        >
                            <ListWindow
                                style={{ height: height - 120 }}
                                rowComponent={ListItemRowComponent}
                                rowCount={filteredChannels.length}
                                rowHeight={55}
                                rowProps={{
                                    filteredChannels,
                                    theme,
                                    handleSelectChannel,
                                    handleDeselectChannel,
                                    handleDragStart,
                                }}
                            />
                        </div>
                    )}
                </AutoSizer>
            </Box>
        </Box>
    );
};
export default Selector;
