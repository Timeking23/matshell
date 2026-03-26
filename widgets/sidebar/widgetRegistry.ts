import ClockWidget from "./modules/ClockWidget";
import CalendarWidget from "./modules/CalendarWidget";
import NotionWidget from "./modules/NotionWidget";
import WeatherWidget from "./modules/WeatherWidget";
import WallpaperPickerWidget from "./modules/WallpaperPickerWidget";
import MatshellSettingsWidget from "./modules/MatshellSettingsWidget/main";
import HardwareMonitorWidget from "./modules/HardwareWidget/main";
import NotesWidget from "./modules/NotesWidget";
import type { WidgetDefinition, SidebarWidgetId } from "./types.ts";

export const SIDEBAR_WIDGETS = {
  notion: {
    id: "notion",
    name: "Notion",
    icon: "Event_Note",
    description: "Today's events from Notion",
    component: NotionWidget,
    separatorAfter: false,
    canDisable: true,
  },
  calendar: {
    id: "calendar",
    name: "Calendar",
    icon: "Calendar_Month",
    description: "Monthly calendar",
    component: CalendarWidget,
    separatorAfter: true,
    canDisable: true,
  },
  clock: {
    id: "clock",
    name: "Clock",
    icon: "Schedule",
    description: "Time and date",
    component: ClockWidget,
    separatorAfter: true,
    canDisable: true,
  },
  weather: {
    id: "weather",
    name: "Weather",
    icon: "Partly_Cloudy_Day",
    description: "Weather information",
    component: WeatherWidget,
    separatorAfter: false,
    canDisable: true,
  },
  settings: {
    id: "settings",
    name: "Settings",
    icon: "Settings_Applications",
    description: "Configuration panel",
    component: MatshellSettingsWidget,
    separatorAfter: false,
    canDisable: false,
  },
  hardware: {
    id: "hardware",
    name: "System Monitor",
    icon: "Memory",
    description: "CPU, RAM, GPU, Disk",
    component: HardwareMonitorWidget,
    separatorAfter: false,
    canDisable: true,
  },
  notes: {
    id: "notes",
    name: "Notes",
    icon: "Note",
    description: "Scratchpad",
    component: NotesWidget,
    separatorAfter: false,
    canDisable: true,
  },
  wallpapers: {
    id: "wallpapers",
    name: "Wallpapers",
    icon: "Wallpaper",
    description: "Wallpaper Engine picker",
    component: WallpaperPickerWidget,
    separatorAfter: false,
    canDisable: true,
  },
} as const satisfies Record<string, WidgetDefinition>;

export function getAvailableWidgets(): WidgetDefinition[] {
  return Object.values(SIDEBAR_WIDGETS);
}

export function getWidgetById(id: string): WidgetDefinition | undefined {
  return SIDEBAR_WIDGETS[id as SidebarWidgetId];
}

export function isValidWidgetId(id: string): id is SidebarWidgetId {
  return id in SIDEBAR_WIDGETS;
}
