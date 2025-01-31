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
import { BackendChannel, StoredChannel } from "./Selector.types";

const Selector: React.FC = () => {
    const { backendUrl } = useApiUrls();
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedBackends, setSelectedBackends] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    const [backendOptions, setBackendOptions] = useState<string[]>([]);
    const [typeOptions, setTypeOptions] = useState<string[]>([]);

    const selectRef = useRef<HTMLHeadingElement>(null);
    const [maxCharacters, setMaxCharacters] = useState<number>(20);

    const [searchResultsIsRecent, setSearchResultsIsRecent] = useState(true);

    const [storedChannels, setStoredChannels] = useState<StoredChannel[]>([]);

    const [searchRegex, setSearchRegex] = useState("");

    const filteredChannels = useMemo(() => {
        return storedChannels.filter((channel) => {
            const [backend, , type] = channel.key.split("|");
            const matchesBackend =
                selectedBackends.length === 0 ||
                selectedBackends.includes(backend);
            const matchesType =
                selectedTypes.length === 0 || selectedTypes.includes(type);
            const matchesSearch =
                !searchRegex || new RegExp(searchRegex, "i").test(channel.key);
            return matchesBackend && matchesType && matchesSearch;
        });
    }, [storedChannels, selectedBackends, selectedTypes, searchRegex]);

    const selectedChannels = useMemo(() => {
        return storedChannels.filter((channel) => {
            return channel.selected;
        });
    }, [storedChannels]);

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

    const fetchRecent = useCallback(async (urlChannels: StoredChannel[]) => {
        try {
            const response = await axios.get<{
                channels: BackendChannel[];
            }>(`${backendUrl}/channels/recent`);

            const joinedData = response.data.channels.map((channel) =>
                [channel.backend, channel.name, channel.type].join("|")
            );

            const newStoredChannels = [
                ...urlChannels,
                ...joinedData
                    .filter(
                        (key: string) =>
                            !urlChannels.some((channel) => channel.key === key)
                    )
                    .map((key: string) => ({
                        key,
                        selected: false,
                    })),
            ].sort((a, b) => a.key.localeCompare(b.key));
            setStoredChannels(newStoredChannels);

            // Extract unique backends and data types, used for filtering
            const backends = Array.from(
                new Set(
                    newStoredChannels.map(
                        (channel) => channel.key.split("|")[0]
                    )
                )
            );
            const types = Array.from(
                new Set(
                    newStoredChannels.map(
                        (channel) => channel.key.split("|")[2]
                    )
                )
            );

            setBackendOptions(backends);
            setTypeOptions(types);
            setSelectedBackends(backends);
            setSelectedTypes(types);
        } catch (err) {
            console.log(err);
        }

    }, [backendUrl]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const channelsParam = urlParams.get("channels");
        let urlChannels = [] as StoredChannel[];
        if (channelsParam) {
            try {
                const parsedChannels = JSON.parse(channelsParam);
                const channels = parsedChannels.map(
                    // cn = channelname, be = backend, dt = datatype --> abbreviations to save space in url
                    (channel: { cn: string; be: string; dt: string }) => {
                        return `${channel.be}|${channel.cn}|${channel.dt}`;
                    }
                );
                urlChannels = channels.map((key: string) => ({
                    key,
                    selected: true,
                }));
                setStoredChannels(urlChannels);
            } catch (e) {
                console.error("Error parsing URL channels:", e);
            }
        }
        fetchRecent(urlChannels);
    }, [fetchRecent]);

    const debouncedSearch = useMemo(
        () =>
            debounce(async (term: string) => {
                setError(null);
                setLoading(true);
                try {
                    setSearchRegex(term);

                    const response = await axios.get<{
                        channels: BackendChannel[];
                    }>(`${backendUrl}/channels/search`, {
                        params: {
                            search_text: term,
                        },
                    });

                    // Take backend, channelname and datatype (if no datatype, show [])
                    const joinedData = response.data.channels.map((channel) =>
                        [channel.backend, channel.name, channel.type ? channel.type : "[]"].join("|")
                    );

                    const newStoredChannels = [
                        ...storedChannels,
                        ...joinedData
                            .filter(
                                (key: string) =>
                                    !storedChannels.some(
                                        (channel) => channel.key === key
                                    )
                            )
                            .map((key: string) => ({
                                key,
                                selected: false,
                            })),
                    ].sort((a, b) => a.key.localeCompare(b.key));
                    setStoredChannels(newStoredChannels);

                    // Extract unique backends and data types, used for filtering
                    const backends = Array.from(
                        new Set(
                            newStoredChannels.map(
                                (channel) => channel.key.split("|")[0]
                            )
                        )
                    );
                    const types = Array.from(
                        new Set(
                            newStoredChannels.map(
                                (channel) => channel.key.split("|")[2]
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
                } catch (err) {
                    setError("Error fetching channels");
                    console.log(err);
                }
                setLoading(false);
            }, 300),
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

    const updateUrl = useCallback((channels: string[]) => {
        const queryString = channels
            .map((channel) => {
                const [backend, channelname, datatype] = channel.split("|");
                return JSON.stringify({
                    cn: channelname,
                    be: backend,
                    dt: datatype,
                });
            })
            .join(",");

        const newUrl = `${window.location.pathname}?channels=[${queryString}]`;
        window.history.replaceState({}, "", newUrl);
    }, []);

    const handleSelectChannel = useCallback(
        (key: string) => {
            if (selectedChannels.length < 100) {
                const newStoredChannels = storedChannels.map((channel) =>
                    channel.key === key
                        ? { ...channel, selected: true }
                        : channel
                );
                setStoredChannels(newStoredChannels);
                updateUrl(
                    newStoredChannels
                        .filter((channel) => channel.selected)
                        .map((channel) => channel.key)
                );
            } else {
                console.log("Nuh uh");
            }
        },
        [selectedChannels, storedChannels, updateUrl]
    );

    const handleDeselectChannel = useCallback(
        (key: string) => {
            const newStoredChannels = storedChannels.map((channel) =>
                channel.key === key ? { ...channel, selected: false } : channel
            );
            setStoredChannels(newStoredChannels);
            updateUrl(
                newStoredChannels
                    .filter((channel) => channel.selected)
                    .map((channel) => channel.key)
            );
        },
        [storedChannels, updateUrl]
    );

    const handleKeyPress = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === "Enter") {
                debouncedSearch(searchTerm);
            }
        },
        [debouncedSearch, searchTerm]
    );

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

            {/* Stored (filtered) channels */}
            <Box sx={styles.listBoxStyle}>
                <Typography sx={styles.typographyHeaderStyle}>
                    {searchResultsIsRecent
                        ? "Recent Channels"
                        : "Search Results"}{" "}
                    ({filteredChannels.length})
                </Typography>

                {loading && <CircularProgress sx={styles.statusSymbolStyle} />}
                {error && (
                    <Alert severity="error" sx={styles.statusSymbolStyle}>
                        {error}
                    </Alert>
                )}

                <ListWindow
                    style={{ background: "#46494A" }}
                    height={380}
                    itemCount={filteredChannels.length}
                    itemSize={46}
                    width="100%"
                    itemData={{
                        items: filteredChannels,
                        onSelect: handleSelectChannel,
                        onDeselect: handleDeselectChannel,
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
                <Typography sx={styles.typographyHeaderStyle}>
                    Drag into a Plot to display.
                </Typography>
                <ListWindow
                    style={{ background: "#46494A" }}
                    height={280}
                    itemCount={selectedChannels.length}
                    itemSize={46}
                    width="100%"
                    itemData={{
                        items: selectedChannels,
                        onSelect: handleSelectChannel,
                        onDeselect: handleDeselectChannel,
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
