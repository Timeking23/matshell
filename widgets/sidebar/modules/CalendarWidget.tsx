import { Gtk } from "ags/gtk4";
import GLib from "gi://GLib?version=2.0";
import { createState } from "ags";

export default function CalendarWidget() {
  const now = GLib.DateTime.new_now_local();
  const [year, setYear] = createState(now.get_year());
  const [month, setMonth] = createState(now.get_month());

  const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const todayYear = now.get_year();
  const todayMonth = now.get_month();
  const todayDay = now.get_day_of_month();

  const navigate = (delta: number) => {
    let m = month.get() + delta;
    let y = year.get();
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setMonth(m);
    setYear(y);
  };

  const buildGrid = (y: number, m: number) => {
    const first = GLib.DateTime.new_local(y, m, 1, 0, 0, 0);
    // GLib day of week: 1=Mon, 7=Sun
    const startDow = first.get_day_of_week();
    const daysInMonth = GLib.Date.get_days_in_month(m, y);

    const cells: { day: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonth = m === 1 ? 12 : m - 1;
    const prevYear = m === 1 ? y - 1 : y;
    const daysInPrev = GLib.Date.get_days_in_month(prevMonth, prevYear);
    for (let i = startDow - 2; i >= 0; i--) {
      cells.push({ day: daysInPrev - i, isCurrentMonth: false });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, isCurrentMonth: true });
    }

    // Next month padding
    let nextDay = 1;
    while (cells.length % 7 !== 0) {
      cells.push({ day: nextDay++, isCurrentMonth: false });
    }

    return cells;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <box
      class="calendar-widget"
      orientation={Gtk.Orientation.VERTICAL}
      spacing={6}
    >
      {/* Header with nav */}
      <box class="calendar-header" orientation={Gtk.Orientation.HORIZONTAL}>
        <button
          class="calendar-nav"
          label="chevron_left"
          onClicked={() => navigate(-1)}
        />
        <label
          class="calendar-month-label"
          hexpand
          halign={Gtk.Align.CENTER}
          label={(() => {
            // Reactive: combine year + month
            const combined = (fn: (v: string) => string) => fn;
            return month((m) => `${monthNames[m - 1]} ${year.get()}`);
          })()}
        />
        <button
          class="calendar-nav"
          label="chevron_right"
          onClicked={() => navigate(1)}
        />
      </box>

      <Gtk.Separator orientation={Gtk.Orientation.HORIZONTAL} />

      {/* Day headers */}
      <box class="calendar-day-headers" homogeneous spacing={2}>
        {DAYS.map((d) => (
          <label class="calendar-day-header" label={d} halign={Gtk.Align.CENTER} />
        ))}
      </box>

      {/* Day grid */}
      <box
        class="calendar-grid"
        orientation={Gtk.Orientation.VERTICAL}
        spacing={2}
        $={(self) => {
          const rebuild = () => {
            // Remove existing children
            let child = self.get_first_child();
            while (child) {
              const next = child.get_next_sibling();
              self.remove(child);
              child = next;
            }

            const y = year.get();
            const m = month.get();
            const cells = buildGrid(y, m);

            for (let row = 0; row < cells.length / 7; row++) {
              const rowBox = new Gtk.Box({
                orientation: Gtk.Orientation.HORIZONTAL,
                homogeneous: true,
                spacing: 2,
                cssClasses: ["calendar-row"],
              });

              for (let col = 0; col < 7; col++) {
                const cell = cells[row * 7 + col];
                const isToday =
                  cell.isCurrentMonth &&
                  cell.day === todayDay &&
                  y === todayYear &&
                  m === todayMonth;

                const classes = ["calendar-day"];
                if (!cell.isCurrentMonth) classes.push("calendar-day-dim");
                if (isToday) classes.push("calendar-day-today");

                const label = new Gtk.Label({
                  label: cell.day.toString(),
                  halign: Gtk.Align.CENTER,
                  cssClasses: classes,
                });
                rowBox.append(label);
              }

              self.append(rowBox);
            }
          };

          // Subscribe to state changes
          year.subscribe(rebuild);
          month.subscribe(rebuild);
          rebuild();
        }}
      />

      {/* Today button */}
      <button
        class="calendar-today-btn"
        label="Today"
        halign={Gtk.Align.CENTER}
        onClicked={() => {
          setYear(todayYear);
          setMonth(todayMonth);
        }}
      />
    </box>
  );
}
