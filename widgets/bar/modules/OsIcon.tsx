import app from "ags/gtk4/app";
import { Gdk } from "ags/gtk4";
import GdkPixbuf from "gi://GdkPixbuf";
import GLib from "gi://GLib?version=2.0";
import options from "options";

export default function OsIcon() {
  return (
    <button onClicked={() => app.toggle_window("sidebar")}>
      <image
        cssClasses={["OsIcon-file"]}
        $={(self) => {
          const update = () => {
            const iconValue = options["bar.modules.os-icon.type"].get();
            const isFile = iconValue.startsWith("/") || iconValue.startsWith("~");

            if (isFile) {
              try {
                const path = iconValue.startsWith("~")
                  ? iconValue.replace("~", GLib.get_home_dir()!)
                  : iconValue;
                const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(
                  path, 64, 64, true,
                );
                const texture = Gdk.Texture.new_for_pixbuf(pixbuf);
                self.set_from_paintable(texture);
              } catch (e) {
                console.error(`OsIcon: failed to load ${iconValue}:`, e);
                self.set_from_icon_name("image-missing-symbolic");
              }
            } else {
              self.set_from_icon_name(iconValue);
            }
          };

          options["bar.modules.os-icon.type"].subscribe(update);
          update();
        }}
      />
    </button>
  );
}
