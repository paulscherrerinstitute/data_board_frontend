export function downloadBlob(blob: Blob, fileName: string) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export const hexToRgba = (hexString: string, alpha: number) => {
    const hexValue = parseInt(hexString.slice(1), 16);
    const r = (hexValue >> 16) & 255;
    const g = (hexValue >> 8) & 255;
    const b = hexValue & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
