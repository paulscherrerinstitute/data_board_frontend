import { ReactNode } from "react";

export interface ApiProviderProps {
    children: ReactNode;
    apiUrls: ApiUrls;
}

export type ApiUrls = {
    backendUrl: string;
};
