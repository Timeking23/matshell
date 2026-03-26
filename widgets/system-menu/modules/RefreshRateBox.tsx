import { Gtk } from "ags/gtk4";
import { createState } from "ags";
import { execAsync } from "ags/process";

const [isExpanded, setIsExpanded] = createState(false);
const [activeRate, setActiveRate] = createState("Unknown");

const rates = ["60", "120"];

const refreshRate = () => {
  execAsync(["bash", "-c", "hyprctl monitors -j | python3 -c \"import sys,json; m=json.load(sys.stdin); print(int(m[0]['refreshRate']))\""])
    .then((out) => setActiveRate(out.trim()))
    .catch(() => setActiveRate("Unknown"));
};

refreshRate();

const RateItem = ({ icon, label, onClicked, cssClasses = [""] }) => (
  <button hexpand={true} onClicked={onClicked}>
    <box cssClasses={cssClasses} hexpand={true} halign={Gtk.Align.START}>
      <image iconName={icon} />
      <label label={label} />
    </box>
  </button>
);

export const RefreshRateBox = () => {
  return (
    <box orientation={Gtk.Orientation.VERTICAL} cssClasses={["power-profiles"]}>
      <RateItem
        cssClasses={["current-profile"]}
        icon="preferences-desktop-display-symbolic"
        label={activeRate((r) => `Display: ${r}Hz`)}
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
          {rates.map((rate) => (
            <RateItem
              icon="preferences-desktop-display-symbolic"
              label={`${rate}Hz`}
              onClicked={() => {
                execAsync(["bash", "-c", `hyprctl keyword monitor eDP-2,2880x1800@${rate},auto,auto`])
                  .then(() => {
                    setActiveRate(rate);
                    setIsExpanded(false);
                  })
                  .catch((e) => console.error("Failed to set refresh rate:", e));
              }}
            />
          ))}
        </box>
      </revealer>
    </box>
  );
};
