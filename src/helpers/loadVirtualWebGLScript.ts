import { logToConsole } from "./showSnackbar";

const VIRTUAL_WEBGL_SCRIPT_SRC =
    "https://unpkg.com/virtual-webgl@1.0.6/src/virtual-webgl.js";

export const loadVirtualWebGLScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(
            `script[src="${VIRTUAL_WEBGL_SCRIPT_SRC}"]`
        );

        if (existingScript) {
            logToConsole("Virtual WebGL script already loaded", "info");
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = VIRTUAL_WEBGL_SCRIPT_SRC;
        script.async = true;
        script.onload = () => {
            logToConsole("Virtual WebGL script loaded", "success");
            resolve();
        };
        script.onerror = () => {
            logToConsole("Failed to load Virtual WebGL script", "error");
            reject(new Error("Failed to load Virtual WebGL script"));
        };

        document.body.appendChild(script);
    });
};

export const unloadVirtualWebGLScript = (): void => {
    const script = document.querySelector(
        `script[src="${VIRTUAL_WEBGL_SCRIPT_SRC}"]`
    );
    if (script) {
        script.remove();
        logToConsole("Virtual WebGL script unloaded", "success");
    } else {
        logToConsole("No Virtual WebGL script found to unload", "info");
    }
};
