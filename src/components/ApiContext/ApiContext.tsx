import React, { createContext, useContext, ReactNode } from "react";

interface ApiUrls {
    backendUrl: string;
}

// Create the context with a default value (or undefined if no provider is used)
const ApiContext = createContext<ApiUrls | undefined>(undefined);

// ApiProvider to wrap the app and provide the API URLs
interface ApiProviderProps {
    children: ReactNode;
    apiUrls: ApiUrls; // Accept the API URLs as props
}

export const ApiProvider: React.FC<ApiProviderProps> = ({
    children,
    apiUrls,
}) => {
    return (
        <ApiContext.Provider value={apiUrls}>{children}</ApiContext.Provider>
    );
};

// Custom hook to access the API URLs in any component
export const useApiUrls = (): ApiUrls => {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error("useApiUrls must be used within an ApiProvider");
    }
    return context;
};
