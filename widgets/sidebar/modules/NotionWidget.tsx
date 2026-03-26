import { Gtk } from "ags/gtk4";
import { createState } from "ags";
import { execAsync } from "ags/process";
import GLib from "gi://GLib?version=2.0";

interface NotionEvent {
  title: string;
}

const [events, setEvents] = createState<NotionEvent[]>([]);
const [status, setStatus] = createState<"loading" | "ready" | "error" | "unconfigured">("loading");
const [errorMsg, setErrorMsg] = createState("");

const fetchEvents = () => {
  setStatus("loading");
  execAsync([
    "python3",
    `${GLib.get_home_dir()}/.config/waybar/notion.py`,
  ])
    .then((out) => {
      try {
        const data = JSON.parse(out.trim());
        if (data.class === "unconfigured") {
          setStatus("unconfigured");
          return;
        }
        if (data.class === "error") {
          setStatus("error");
          setErrorMsg("Could not reach Notion API");
          return;
        }

        // Parse event titles from tooltip
        const tooltip: string = data.tooltip ?? "";
        const lines = tooltip.split("\n").slice(1); // skip header
        const parsed: NotionEvent[] = lines
          .map((line: string) => line.replace(/^\s*󰃰\s*/, "").trim())
          .filter((t: string) => t.length > 0)
          .map((title: string) => ({ title }));

        setEvents(parsed);
        setStatus("ready");
      } catch {
        setStatus("error");
        setErrorMsg("Failed to parse Notion data");
      }
    })
    .catch((e) => {
      setStatus("error");
      setErrorMsg(String(e));
    });
};

// Fetch on load and every 5 minutes
fetchEvents();
GLib.timeout_add(GLib.PRIORITY_DEFAULT, 300000, () => {
  fetchEvents();
  return GLib.SOURCE_CONTINUE;
});

function EventItem({ title }: { title: string }) {
  return (
    <box class="notion-event" spacing={8}>
      <label class="notion-event-icon" label="schedule" />
      <label
        class="notion-event-title"
        label={title}
        hexpand
        halign={Gtk.Align.START}
        ellipsize={3}
      />
    </box>
  );
}

export default function NotionWidget() {
  return (
    <box
      class="notion-widget"
      orientation={Gtk.Orientation.VERTICAL}
      spacing={6}
    >
      <box class="notion-header" orientation={Gtk.Orientation.HORIZONTAL} spacing={6}>
        <label class="header-title" label="Notion" hexpand halign={Gtk.Align.START} />
        <button
          class="notion-refresh"
          label="refresh"
          tooltipText="Refresh"
          onClicked={() => fetchEvents()}
        />
      </box>

      <Gtk.Separator orientation={Gtk.Orientation.HORIZONTAL} />

      <box
        class="notion-content"
        orientation={Gtk.Orientation.VERTICAL}
        spacing={4}
        $={(self) => {
          const rebuild = () => {
            let child = self.get_first_child();
            while (child) {
              const next = child.get_next_sibling();
              self.remove(child);
              child = next;
            }

            const s = status.get();

            if (s === "loading") {
              const lbl = new Gtk.Label({
                label: "Loading...",
                cssClasses: ["notion-status"],
                halign: Gtk.Align.CENTER,
              });
              self.append(lbl);
              return;
            }

            if (s === "unconfigured") {
              const lbl = new Gtk.Label({
                label: "Set up notion.env",
                cssClasses: ["notion-status"],
                halign: Gtk.Align.CENTER,
                tooltipText: "Set NOTION_TOKEN and NOTION_DB_ID in\n~/.config/waybar/notion.env",
              });
              self.append(lbl);
              return;
            }

            if (s === "error") {
              const lbl = new Gtk.Label({
                label: errorMsg.get() || "Error",
                cssClasses: ["notion-status", "notion-error"],
                halign: Gtk.Align.CENTER,
              });
              self.append(lbl);
              return;
            }

            const ev = events.get();
            if (ev.length === 0) {
              const lbl = new Gtk.Label({
                label: "No events today",
                cssClasses: ["notion-status", "notion-empty"],
                halign: Gtk.Align.CENTER,
              });
              self.append(lbl);
              return;
            }

            // Header with count
            const countLbl = new Gtk.Label({
              label: `${ev.length} event${ev.length > 1 ? "s" : ""} today`,
              cssClasses: ["notion-count"],
              halign: Gtk.Align.START,
            });
            self.append(countLbl);

            for (const e of ev) {
              const row = new Gtk.Box({
                orientation: Gtk.Orientation.HORIZONTAL,
                spacing: 8,
                cssClasses: ["notion-event"],
              });
              const icon = new Gtk.Label({
                label: "schedule",
                cssClasses: ["notion-event-icon"],
              });
              const title = new Gtk.Label({
                label: e.title,
                halign: Gtk.Align.START,
                hexpand: true,
                ellipsize: 3,
                cssClasses: ["notion-event-title"],
              });
              row.append(icon);
              row.append(title);
              self.append(row);
            }
          };

          status.subscribe(rebuild);
          events.subscribe(rebuild);
          rebuild();
        }}
      />
    </box>
  );
}
