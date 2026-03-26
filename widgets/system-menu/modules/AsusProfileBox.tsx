import { Gtk } from "ags/gtk4";
import { createState } from "ags";
import { execAsync } from "ags/process";

const [isExpanded, setIsExpanded] = createState(false);
const [activeProfile, setActiveProfile] = createState("Unknown");

const profiles = ["Quiet", "Balanced", "Performance"];

const profileIcons: Record<string, string> = {
  Quiet: "power-profile-power-saver-symbolic",
  Balanced: "power-profile-balanced-symbolic",
  Performance: "power-profile-performance-symbolic",
};

const refreshProfile = () => {
  execAsync(["bash", "-c", "asusctl profile get | grep -oP 'Active profile: \\K.*'"])
    .then((out) => setActiveProfile(out.trim()))
    .catch(() => setActiveProfile("Unknown"));
};

// Initial fetch
refreshProfile();

const ProfileItem = ({ icon, label, onClicked, cssClasses = [""] }) => (
  <button hexpand={true} onClicked={onClicked}>
    <box cssClasses={cssClasses} hexpand={true} halign={Gtk.Align.START}>
      <image iconName={icon} />
      <label label={label} />
    </box>
  </button>
);

export const AsusProfileBox = () => {
  return (
    <box orientation={Gtk.Orientation.VERTICAL} cssClasses={["power-profiles"]}>
      <ProfileItem
        cssClasses={["current-profile"]}
        icon={activeProfile((p) => profileIcons[p] ?? "preferences-system-symbolic")}
        label={activeProfile((p) => `ASUS: ${p}`)}
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
          {profiles.map((profile) => (
            <ProfileItem
              icon={profileIcons[profile]}
              label={profile}
              onClicked={() => {
                execAsync(["asusctl", "profile", "set", profile])
                  .then(() => {
                    setActiveProfile(profile);
                    setIsExpanded(false);
                  })
                  .catch((e) => console.error("Failed to set ASUS profile:", e));
              }}
            />
          ))}
        </box>
      </revealer>
    </box>
  );
};
