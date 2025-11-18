import { LogLevel } from "@azure/msal-browser";
import { PublicClientApplication } from "@azure/msal-browser";
import { AuthProvider } from "./AuthProvider";

/*
import type { EnvWindow } from "../services.types";

const ENV = (window as EnvWindow)._env_;
const SCOPES = ENV?.RPM_PACKAGES_AUTH_SCOPES.split(";") ?? [];
*/


export const msalConfig = {
    auth: {
        clientId: CLIENT, //ENV?.RPM_PACKAGES_AUTH_CLIENT_ID ?? "",
        authority: AUTHORITY, //ENV?.RPM_PACKAGES_AUTH_AUTHORITY ?? "",
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
    system: {
        loggerOptions: {
            loggerCallback: (
                level: LogLevel,
                message: string,
                containsPii: boolean
            ) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }
            },
        },
    },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
    scopes: SCOPES,
};

export function useAuthProvider() {
    return { AuthProvider };
}
