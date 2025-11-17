import { type AuthenticationResult, EventType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { type ReactNode } from "react";
import { msalInstance } from "./auth-config";


interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {

    if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
        msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
    }

    msalInstance.enableAccountStorageEvents();

    msalInstance.addEventCallback((event) => {
        const authenticationResult = event?.payload as AuthenticationResult;
        if (event.eventType === EventType.LOGIN_SUCCESS && authenticationResult?.account) {
            const account = authenticationResult?.account;
            msalInstance.setActiveAccount(account);
            window.location.reload();
        }
    });

    return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};
