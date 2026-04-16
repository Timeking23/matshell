import { Gtk, Gdk } from "ags/gtk4";

let provider: Gtk.CssProvider | null = null;

function clamp(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function generateBloomCSS(b: number): string {
  const c = (base: number) => clamp(base * b).toFixed(3);

  return `
.sidebar {
  box-shadow:
    0 8px 40px rgba(0,0,0,0.65),
    0 0 18px  rgba(79,195,247,${c(0.14)}),
    0 0 50px  rgba(79,195,247,${c(0.07)}),
    0 0 90px  rgba(79,195,247,${c(0.03)}),
    inset 0 1px 0 rgba(120,200,255,${c(0.09)});
}
.sidebar separator {
  box-shadow: 0 0 6px rgba(79,195,247,${c(0.30)});
}
.sidebar scrollbar slider {
  box-shadow: 0 0 8px rgba(79,195,247,${c(0.40)});
}
.base-widget .header-icon {
  filter: drop-shadow(0 0 8px rgba(79,195,247,${c(0.70)}));
}
.base-widget .header-title {
  filter: drop-shadow(0 0 5px rgba(79,195,247,${c(0.28)}));
}
.clock-widget {
  filter:
    drop-shadow(0 0 6px rgba(79,195,247,${c(0.70)}))
    drop-shadow(0 0 16px rgba(79,195,247,${c(0.30)}));
}
.greeting-widget {
  box-shadow:
    -4px 0 12px rgba(79,195,247,${c(0.35)}),
    -4px 0 28px rgba(79,195,247,${c(0.12)});
}
.greeting-widget .greeting-heart {
  filter:
    drop-shadow(0 0 6px  rgba(79,195,247,${c(0.90)}))
    drop-shadow(0 0 18px rgba(79,195,247,${c(0.45)}));
}
.greeting-widget .greeting-period {
  filter: drop-shadow(0 0 5px rgba(79,195,247,${c(0.60)}));
}
.greeting-widget .greeting-period-icon {
  filter: drop-shadow(0 0 6px rgba(79,195,247,${c(0.65)}));
}
.greeting-widget .greeting-divider {
  box-shadow: 0 0 6px rgba(79,195,247,${c(0.35)});
}
.greeting-widget .greeting-text {
  filter: drop-shadow(0 0 6px rgba(79,195,247,${c(0.38)}));
}
.hardware-monitor-widget circularprogress {
  filter: drop-shadow(0 0 7px rgba(79,195,247,${c(0.55)}));
}
.hardware-monitor-widget .hw-page-cpu circularprogress {
  filter: drop-shadow(0 0 7px rgba(120,90,255,${c(0.60)}));
}
.hardware-monitor-widget .hw-page-gpu circularprogress {
  filter: drop-shadow(0 0 7px rgba(79,195,247,${c(0.65)}));
}
.quick-actions-widget .action-button .action-icon {
  filter: drop-shadow(0 0 5px rgba(79,195,247,${c(0.45)}));
}
`;
}

export function applyBloom(brightness: number): void {
  if (!provider) {
    provider = new Gtk.CssProvider();
    const display = Gdk.Display.get_default();
    if (display) {
      Gtk.StyleContext.add_provider_for_display(
        display,
        provider,
        Gtk.STYLE_PROVIDER_PRIORITY_USER,
      );
    }
  }
  provider.load_from_string(generateBloomCSS(brightness));
}
