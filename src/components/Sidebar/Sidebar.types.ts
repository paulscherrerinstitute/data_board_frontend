export interface SidebarProps {
    initialWidthPercent?: number;
    maxWidthPercent?: number;
}

export type InitialSidebarState =
    | "alwaysOpen"
    | "alwaysClosed"
    | "closedIfDashboard";

export type InitialAdjustSidebarState = "overlap" | "move";
