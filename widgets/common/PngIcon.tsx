import { Gtk, Gdk } from "ags/gtk4";
import GdkPixbuf from "gi://GdkPixbuf";

interface PngIconProps {
  path: string;
  size?: number;
  cssClasses?: string[];
}

/**
 * Renders a PNG file as an icon without clipping.
 * Uses GdkPixbuf to scale the image to fit within the given size
 * while preserving aspect ratio, then displays it with Gtk.Image.
 */
export default function PngIcon({ path, size = 24, cssClasses = [] }: PngIconProps) {
  return (
    <image
      cssClasses={cssClasses}
      pixelSize={size}
      $={(self) => {
        try {
          const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(
            path,
            size,
            size,
            true, // preserve aspect ratio
          );
          const texture = Gdk.Texture.new_for_pixbuf(pixbuf);
          self.set_from_paintable(texture);
        } catch (e) {
          console.error(`PngIcon: failed to load ${path}:`, e);
          self.set_from_icon_name("image-missing-symbolic");
        }
      }}
    />
  );
}
