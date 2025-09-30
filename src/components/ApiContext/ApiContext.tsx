import React from "react";
import { ApiProviderProps } from "./ApiContext.types";
import { ApiContext } from "./ApiContextHooks";

export const ApiProvider: React.FC<ApiProviderProps> = ({
    children,
    apiUrls,
}) => {
    return (
        <ApiContext.Provider value={apiUrls}>{children}</ApiContext.Provider>
    );
};
