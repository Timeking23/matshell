import Mpris from "gi://AstalMpris";
import { Gtk } from "ags/gtk4";
import { Title, Artists } from "./TitleArtists";
import { Controls } from "./Controls";

export function Info({ player }: { player: Mpris.Player }) {
  return (
    <box orientation={Gtk.Orientation.VERTICAL} cssClasses={["info"]}>
      <Title player={player} />
      <Artists player={player} />
      <Controls player={player} />
    </box>
  );
}
