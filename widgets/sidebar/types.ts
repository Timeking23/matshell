export interface WidgetDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  component: () => JSX.Element;
  separatorAfter: boolean;
  canDisable: boolean;
}

export type SidebarWidgetId =
  | "notion"
  | "calendar"
  | "clock"
  | "weather"
  | "settings"
  | "hardware"
  | "notes"
  | "wallpapers";

export const DEFAULT_WIDGET_ORDER: SidebarWidgetId[] = [
  "notion",
  "calendar",
  "clock",
  "weather",
  "wallpapers",
  "settings",
  "hardware",
  "notes",
];

export const DEFAULT_ENABLED_WIDGETS: SidebarWidgetId[] = [
  "notion",
  "calendar",
  "clock",
  "weather",
  "wallpapers",
  "settings",
  "hardware",
];
