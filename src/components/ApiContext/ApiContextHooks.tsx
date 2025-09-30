import { createContext, useContext } from "react";
import { ApiUrls } from "./ApiContext.types";

// Create the context with a default value (or undefined if no provider is used)
export const ApiContext = createContext<ApiUrls | undefined>(undefined);

// Custom hook to access the API URLs in any component
export const useApiUrls = (): ApiUrls => {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error("useApiUrls must be used within an ApiProvider");
    }
    return context;
};
