import { createPoll } from "ags/time";
import GLib from "gi://GLib?version=2.0";

// State
export const currentTime = createPoll(Date.now(), 60000, () => Date.now());

export const currentTimeString = createPoll<string>("12:00:00 AM", 1000, () => {
  const now = new Date();
  let hours = now.getHours();
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const hh = hours.toString().padStart(2, "0");
  const mm = now.getMinutes().toString().padStart(2, "0");
  const ss = now.getSeconds().toString().padStart(2, "0");
  return `${hh}:${mm}:${ss} ${period}`;
});

export const currentDate = createPoll<string>("", 60_000, () => {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
});

// Formatting
export const formatTimestamp = (timestamp: number, format = "%I:%M %p") =>
  GLib.DateTime.new_from_unix_local(timestamp).format(format)!;
