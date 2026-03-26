import { createBinding } from "ags";
import SystemMonitor from "utils/sysmon";

export default function Temps() {
  const sysmon = SystemMonitor.get_default();

  return (
    <box cssClasses={["bar-temps"]} spacing={4}>
      <label
        cssClasses={["temp-label"]}
        tooltipText="CPU Temperature"
        label={createBinding(sysmon.cpu, "temperature")((t) =>
          t > 0 ? `${Math.round(t)}°` : "--°",
        )}
      />
      <label
        cssClasses={["temp-label"]}
        tooltipText="GPU Temperature"
        label={createBinding(sysmon.gpu, "temperature")((t) =>
          t > 0 ? `${Math.round(t)}°` : "--°",
        )}
      />
    </box>
  );
}
