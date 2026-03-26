import { Gtk, Gdk } from "ags/gtk4";
import GLib from "gi://GLib?version=2.0";
import GdkPixbuf from "gi://GdkPixbuf";
import { createState, For } from "ags";
import { execAsync } from "ags/process";

const WORKSHOP_DIR = `${GLib.get_home_dir()}/.steam/steam/steamapps/workshop/content/431960`;
const SAVE_FILE = `${GLib.get_home_dir()}/.cache/ags/last-wallpaper`;

interface WallpaperEntry {
  id: string;
  title: string;
  previewPath: string;
  type: string;
}

function loadSavedWallpaper(): string {
  try {
    if (GLib.file_test(SAVE_FILE, GLib.FileTest.EXISTS)) {
      const [ok, contents] = GLib.file_get_contents(SAVE_FILE);
      if (ok && contents) return new TextDecoder().decode(contents).trim();
    }
  } catch {}
  return "";
}

function saveWallpaper(id: string) {
  try {
    GLib.file_set_contents(SAVE_FILE, id);
  } catch (e) {
    console.error("WallpaperPicker: failed to save wallpaper choice:", e);
  }
}

function scanWallpapers(): WallpaperEntry[] {
  const entries: WallpaperEntry[] = [];
  try {
    const dir = GLib.Dir.open(WORKSHOP_DIR, 0);
    let name: string | null;
    while ((name = dir.read_name()) !== null) {
      const wallpaperDir = `${WORKSHOP_DIR}/${name}`;
      const projectPath = `${wallpaperDir}/project.json`;
      if (!GLib.file_test(projectPath, GLib.FileTest.EXISTS)) continue;

      try {
        const [ok, contents] = GLib.file_get_contents(projectPath);
        if (!ok || !contents) continue;
        const decoder = new TextDecoder();
        const json = JSON.parse(decoder.decode(contents));

        const previewFile = json.preview || "preview.jpg";
        const previewPath = `${wallpaperDir}/${previewFile}`;

        if (!GLib.file_test(previewPath, GLib.FileTest.EXISTS)) continue;

        entries.push({
          id: name,
          title: json.title || name,
          previewPath,
          type: json.type || "Unknown",
        });
      } catch {
        // skip malformed entries
      }
    }
  } catch (e) {
    console.error("WallpaperPicker: failed to scan workshop dir:", e);
  }
  return entries;
}

const [wallpapers, setWallpapers] = createState<WallpaperEntry[]>(scanWallpapers());
const [activeId, setActiveId] = createState(loadSavedWallpaper());
const [statusText, setStatusText] = createState("Select a wallpaper");

function refreshWallpapers() {
  const entries = scanWallpapers();
  setWallpapers(entries);
  setStatusText(`Found ${entries.length} wallpaper${entries.length !== 1 ? "s" : ""}`);
}

async function applyWallpaper(entry: WallpaperEntry) {
  setActiveId(entry.id);
  setStatusText(`Applying...`);

  try {
    await execAsync(["pkill", "-f", "linux-wallpaperengine"]).catch(() => {});
    await execAsync(["pkill", "hyprpaper"]).catch(() => {});
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Run linux-wallpaperengine via XWayland for full scene rendering
    execAsync([
      "bash", "-c",
      `linux-wallpaperengine --screen-root eDP-2 --scaling stretch --silent --fps 30 ${entry.id}`,
    ]).catch((e) => console.error("wallpaper engine error:", e));

    // Save choice so it persists across reboots
    saveWallpaper(entry.id);

    // Convert preview to png for matugen (it can't read gifs)
    const tmpPng = "/tmp/wp-preview-matugen.png";
    await execAsync([
      "magick", entry.previewPath + "[0]", tmpPng,
    ]).catch(() =>
      execAsync(["ffmpeg", "-y", "-i", entry.previewPath, "-frames:v", "1", tmpPng])
    ).catch(() => {});

    const matugenSrc = entry.previewPath.endsWith(".gif") ? tmpPng : entry.previewPath;
    await execAsync(["matugen", "image", "--source-color-index", "0", matugenSrc]).catch((e) =>
      console.error("matugen error:", e)
    );

    setStatusText(entry.title);
  } catch (e) {
    console.error("WallpaperPicker: failed to apply wallpaper:", e);
    setStatusText("Failed to apply");
  }
}

export default function WallpaperPickerWidget() {
  return (
    <box cssClasses={["wp-picker"]} orientation={Gtk.Orientation.VERTICAL}>
      <box cssClasses={["wp-header"]} spacing={8}>
        <image iconName="Wallpaper" />
        <label label="Wallpapers" cssClasses={["wp-title"]} hexpand halign={Gtk.Align.START} />
        <label
          label={statusText((s) => s)}
          cssClasses={["wp-status"]}
          halign={Gtk.Align.END}
          ellipsize={3}
          maxWidthChars={20}
        />
      </box>
      <Gtk.ScrolledWindow
        cssClasses={["wp-scroll"]}
        hscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
        vscrollbarPolicy={Gtk.PolicyType.NEVER}
        hexpand
      >
        <box cssClasses={["wp-list"]} spacing={8}>
          <For each={wallpapers}>
            {(entry) => (
              <button
                cssClasses={["wp-thumb"]}
                tooltipText={`${entry.title} (${entry.type})`}
                onClicked={() => applyWallpaper(entry)}
              >
                <image
                  cssClasses={["wp-thumb-img"]}
                  $={(self) => {
                    try {
                      const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(
                        entry.previewPath, 200, 120, true,
                      );
                      const texture = Gdk.Texture.new_for_pixbuf(pixbuf);
                      self.set_from_paintable(texture);
                    } catch (e) {
                      self.set_from_icon_name("image-missing-symbolic");
                    }
                  }}
                />
              </button>
            )}
          </For>
        </box>
      </Gtk.ScrolledWindow>
      <box cssClasses={["wp-actions"]} spacing={8}>
        <button
          cssClasses={["wp-refresh-btn"]}
          onClicked={() => refreshWallpapers()}
        >
          <box spacing={4}>
            <image iconName="Refresh" />
            <label label="Refresh" />
          </box>
        </button>
        <button
          cssClasses={["wp-stop-btn"]}
          onClicked={async () => {
            await execAsync(["pkill", "-f", "linux-wallpaperengine"]).catch(() => {});
            setActiveId("");
            setStatusText("Stopped");
          }}
        >
          <box spacing={4}>
            <image iconName="Stop_Circle" />
            <label label="Stop" />
          </box>
        </button>
      </box>
    </box>
  );
}
