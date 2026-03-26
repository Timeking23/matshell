import { Gtk } from "ags/gtk4";
import { createState } from "ags";
import { execAsync } from "ags/process";

const [isExpanded, setIsExpanded] = createState(false);
const [activeMode, setActiveMode] = createState("Unknown");

const modes = ["Integrated", "Hybrid", "AsusMuxDgpu"];

const modeLabels: Record<string, string> = {
  Integrated: "Integrated (AMD)",
  Hybrid: "Hybrid",
  AsusMuxDgpu: "Discrete (NVIDIA)",
};

const modeIcons: Record<string, string> = {
  Integrated: "battery-good-symbolic",
  Hybrid: "system-run-symbolic",
  AsusMuxDgpu: "video-display-symbolic",
};

const refreshMode = () => {
  try {
    execAsync(["supergfxctl", "-g"])
      .then((out) => setActiveMode(out.trim()))
      .catch(() => setActiveMode("Unknown"));
  } catch {
    setActiveMode("Unknown");
  }
};

refreshMode();

const ModeItem = ({ icon, label, onClicked, cssClasses = [""] }) => (
  <button hexpand={true} onClicked={onClicked}>
    <box cssClasses={cssClasses} hexpand={true} halign={Gtk.Align.START}>
      <image iconName={icon} />
      <label label={label} />
    </box>
  </button>
);

export const GpuModeBox = () => {
  return (
    <box orientation={Gtk.Orientation.VERTICAL} cssClasses={["power-profiles"]}>
      <ModeItem
        cssClasses={["current-profile"]}
        icon={activeMode((m) => modeIcons[m] ?? "preferences-system-symbolic")}
        label={activeMode((m) => `GPU: ${modeLabels[m] ?? m}`)}
        onClicked={() => setIsExpanded((prev) => !prev)}
      />
      <revealer
        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
        transitionDuration={300}
        revealChild={isExpanded}
      >
        <box
          orientation={Gtk.Orientation.VERTICAL}
          cssClasses={["profile-options"]}
        >
          {modes.map((mode) => (
            <ModeItem
              icon={modeIcons[mode]}
              label={modeLabels[mode]}
              onClicked={() => {
                execAsync(["supergfxctl", "-m", mode])
                  .then(() => {
                    setActiveMode(mode);
                    setIsExpanded(false);
                  })
                  .catch((e) => console.error("Failed to set GPU mode:", e));
              }}
            />
          ))}
        </box>
      </revealer>
    </box>
  );
};
