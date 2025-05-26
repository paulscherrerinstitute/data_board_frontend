export interface DownloadRawPopupProps {
    links: DownloadLink[];
    onClose: () => void;
}

export type DownloadLink = {
    name: string;
    link: string;
};
