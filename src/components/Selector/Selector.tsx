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
} from "@mui/material";
import debounce from "lodash/debounce";
import axios from "axios";
import { FixedSizeList as ListWindow } from "react-window";
import ListItemRow from "./ListItemRow/ListItemRow";
import { useApiUrls } from "../ApiContext/ApiContext";
import * as styles from "./Selector.styles";
import { throttle } from "lodash";

const Selector: React.FC = () => {
    const { backendUrl } = useApiUrls();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedBackends, setSelectedBackends] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    const [backendOptions, setBackendOptions] = useState<string[]>([]);
    const [typeOptions, setTypeOptions] = useState<string[]>([]);

    const selectRef = useRef<HTMLHeadingElement>(null);
    const [maxCharacters, setMaxCharacters] = useState<number>(20);

    const [searchResultsIsRecent, setSearchResultsIsRecent] = useState(true);

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

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const channelsParam = urlParams.get("channels");
        var urlChannels: any;
        if (channelsParam) {
            try {
                const parsedChannels = JSON.parse(channelsParam);
                const channels = parsedChannels.map(
                    (channel: { channelName: string; backend: string }) => {
                        return `${channel.backend}|${channel.channelName}`;
                    }
                );
                urlChannels = channels;
                setSelectedChannels(channels);
            } catch (e) {
                console.error("Error parsing URL channels:", e);
            }
        }

        const fetchRecent = async () => {
            try {
                const response = await axios.get<{
                    channels: string[][];
                }>(`${backendUrl}/channels/recent`);

                const joinedData = response.data.channels.map((item) =>
                    item.join("|")
                );
                const filteredResults = joinedData.filter((key: string) => {
                    const substring = key.split("|").slice(0, 2).join("|");
                    return !urlChannels.includes(substring);
                });

                // Extract unique backends and data types, used for filtering
                const backends = Array.from(
                    new Set(filteredResults.map((key) => key.split("|")[0]))
                );
                const types = Array.from(
                    new Set(filteredResults.map((key) => key.split("|")[3]))
                );

                if (searchResults.length === 0) {
                    setBackendOptions(backends);
                    setTypeOptions(types);

                    // In case the filters are empty, set them to include all data just fetched
                    if (
                        selectedBackends.length === 0 &&
                        selectedTypes.length === 0
                    ) {
                        setSelectedBackends(backends);
                        setSelectedTypes(types);
                    }

                    filteredResults.sort();
                    setSearchResults(filteredResults);
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchRecent();
    }, []);

    const updateUrl = useCallback((channels: string[]) => {
        const queryString = channels
            .map((channel) => {
                const [backend, channelName] = channel.split("|");
                return `{"channelName":"${encodeURIComponent(
                    channelName
                )}","backend":"${encodeURIComponent(backend)}"}`;
            })
            .join(",");

        const newUrl = `${window.location.pathname}?channels=[${queryString}]`;
        window.history.replaceState({}, "", newUrl);
    }, []);

    const debouncedSearch = useMemo(
        () =>
            debounce(async (term: string) => {
                setError(null);
                setLoading(true);
                try {
                    const response = await axios.get<{
                        channels: string[][];
                    }>(`${backendUrl}/channels/search?search_text=${term}`);

                    setSearchResultsIsRecent(false);

                    const joinedData = response.data.channels.map((item) =>
                        item.join("|")
                    );
                    const filteredResults = joinedData.filter((key: string) => {
                        const substring = key.split("|").slice(0, 2).join("|");
                        return !selectedChannels.includes(substring);
                    });

                    // Extract unique backends and data types, used for filtering
                    const backends = Array.from(
                        new Set(filteredResults.map((key) => key.split("|")[0]))
                    );
                    const types = Array.from(
                        new Set(filteredResults.map((key) => key.split("|")[3]))
                    );

                    setBackendOptions(backends);
                    setTypeOptions(types);

                    // In case the filters are empty, set them to include all data just fetched
                    if (
                        selectedBackends.length === 0 &&
                        selectedTypes.length === 0
                    ) {
                        setSelectedBackends(backends);
                        setSelectedTypes(types);
                    }

                    filteredResults.sort();
                    setSearchResults(filteredResults);
                } catch (err) {
                    setError("Error fetching channels");
                    console.log(err);
                }
                setLoading(false);
            }, 300),
        [
            selectedChannels,
            backendUrl,
            selectedBackends.length,
            selectedTypes.length,
        ]
    );

    const handleSearchTermChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value);
            debouncedSearch(e.target.value);
        },
        [debouncedSearch]
    );

    const handleSelectChannel = useCallback(
        (key: string) => {
            if (selectedChannels.length < 100) {
                const updatedChannels = [...selectedChannels, key];
                setSelectedChannels(updatedChannels);
                updateUrl(updatedChannels);
                setSearchResults((prev) => prev.filter((c) => c !== key));
            } else {
                console.log("Nuh uh");
            }
        },
        [selectedChannels, updateUrl]
    );

    const handleDeselectChannel = useCallback(
        (key: string) => {
            const updatedChannels = selectedChannels.filter((c) => c !== key);
            setSelectedChannels(updatedChannels);
            updateUrl(updatedChannels);
            setSearchResults((prev) => {
                const updatedResults = [...prev, key];
                updatedResults.sort();
                return updatedResults;
            });
        },
        [selectedChannels, updateUrl]
    );

    const handleKeyPress = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === "Enter") {
                debouncedSearch(searchTerm);
            }
        },
        [debouncedSearch, searchTerm]
    );

    const filteredResults = useMemo(() => {
        return searchResults.filter((key) => {
            const [backend, , , type] = key.split("|");
            const matchesBackend =
                selectedBackends.length === 0 ||
                selectedBackends.includes(backend);
            const matchesType =
                selectedTypes.length === 0 || selectedTypes.includes(type);
            return matchesBackend && matchesType;
        });
    }, [searchResults, selectedBackends, selectedTypes]);

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
                sx={{ ...styles.textFieldStyle }}
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
                            const concatenated = selected.join(", ");
                            return concatenated.length > maxCharacters
                                ? `${concatenated.slice(0, maxCharacters)}...`
                                : concatenated;
                        }}
                        sx={styles.filterDropdownStyle}
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
                                <ListItemText primary={type} />
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </Box>

            {/* Available unselected channels */}
            <Box sx={styles.listBoxStyle}>
                <Typography sx={styles.typographyHeaderStyle}>
                    {searchResultsIsRecent
                        ? "Recent Channels"
                        : "Search Results"}{" "}
                    ({filteredResults.length})
                </Typography>

                {loading && <CircularProgress sx={styles.statusSymbolStyle} />}
                {error && (
                    <Alert severity="error" sx={styles.statusSymbolStyle}>
                        {error}
                    </Alert>
                )}

                <ListWindow
                    height={380}
                    itemCount={filteredResults.length}
                    itemSize={46}
                    width="100%"
                    itemData={{
                        items: filteredResults,
                        onSelect: handleSelectChannel,
                        onDeselect: handleDeselectChannel,
                        selectedChannels,
                        isDraggable: false,
                    }}
                >
                    {ListItemRow}
                </ListWindow>
            </Box>

            {/* Selected channels */}
            <Box sx={styles.listBoxStyle}>
                <Typography sx={styles.typographyHeaderStyle}>
                    Selected Channels ({selectedChannels.length})
                </Typography>
                <ListWindow
                    height={280}
                    itemCount={selectedChannels.length}
                    itemSize={46}
                    width="100%"
                    itemData={{
                        items: selectedChannels,
                        onSelect: handleSelectChannel,
                        onDeselect: handleDeselectChannel,
                        selectedChannels,
                        isDraggable: true,
                    }}
                >
                    {ListItemRow}
                </ListWindow>
            </Box>
        </Box>
    );
};

export default Selector;
