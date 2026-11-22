import { getCalApi } from "@calcom/embed-react";
import { calConsultationConfig, SERVICE_BOOKING_FALLBACK_HREF } from "@/lib/site-config";

export type CalApi = Awaited<ReturnType<typeof getCalApi>>;

let calInitPromise: Promise<CalApi> | null = null;
let calApiInstance: CalApi | null = null;

const CAL_MODAL_MOBILE_MQ = "(max-width: 640px)";

function isMobileCalModalViewport(): boolean {
  return window.matchMedia(CAL_MODAL_MOBILE_MQ).matches;
}

export function isConsultationHref(href: string): boolean {
  return href === SERVICE_BOOKING_FALLBACK_HREF;
}

export function calLinkFromBookingUrl(bookingUrl: string): string | null {
  const trimmed = bookingUrl.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const pathname = new URL(trimmed).pathname.replace(/^\/+|\/+$/g, "");
      return pathname || null;
    } catch {
      return null;
    }
  }

  return trimmed;
}

export function hasCalBookingUrl(bookingUrl: string): boolean {
  return Boolean(calLinkFromBookingUrl(bookingUrl));
}

const CAL_RADIUS_DESKTOP = {
  "radius-full": "9999px",
  "radius-md": "9999px",
} as const;

const CAL_RADIUS_MOBILE = {
  "radius-none": "0px",
  "radius-sm": "0px",
  "radius": "0px",
  "radius-md": "0px",
  "radius-lg": "0px",
  "radius-xl": "0px",
  "radius-2xl": "0px",
  "radius-3xl": "0px",
  "radius-full": "0px",
} as const;

function buildCalCssVarsPerTheme(overrides: Record<string, string>) {
  const shared = {
    "cal-brand": calConsultationConfig.brandColor,
    ...overrides,
  };
  return {
    light: shared,
    dark: shared,
  };
}

function prefersDarkColorScheme(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getMobileModalSurfaceColor(): string {
  return prefersDarkColorScheme() ? "hsl(0, 0%, 6%)" : "#ffffff";
}

function getCalEmbedUiOverrides(): Record<string, string> {
  if (!isMobileCalModalViewport()) {
    return { ...CAL_RADIUS_DESKTOP };
  }

  const surface = getMobileModalSurfaceColor();

  return {
    ...CAL_RADIUS_MOBILE,
    "cal-border-booker-width": "0px",
    "cal-border-booker": "transparent",
    "cal-bg": surface,
    "cal-bg-muted": surface,
    "cal-bg-subtle": surface,
  };
}

function applyCalEmbedUiForViewport(cal: CalApi) {
  const uiConfig: {
    cssVarsPerTheme: ReturnType<typeof buildCalCssVarsPerTheme>;
    styles?: { body: { background: string } };
  } = {
    cssVarsPerTheme: buildCalCssVarsPerTheme(getCalEmbedUiOverrides()),
  };

  if (isMobileCalModalViewport()) {
    uiConfig.styles = {
      body: { background: getMobileModalSurfaceColor() },
    };
  }

  cal("ui", uiConfig);
}

export function initConsultationCal(): Promise<CalApi> {
  if (!calInitPromise) {
    calInitPromise = (async () => {
      const cal = await getCalApi({ namespace: calConsultationConfig.namespace });

      cal("ui", {
        hideEventTypeDetails: false,
        layout: "month_view",
        styles: {
          branding: {
            brandColor: calConsultationConfig.brandColor,
          },
        },
        cssVarsPerTheme: buildCalCssVarsPerTheme(getCalEmbedUiOverrides()),
      });

      calApiInstance = cal;

      cal("on", {
        action: "linkReady",
        callback: () => {
          if (calApiInstance) {
            applyCalEmbedUiForViewport(calApiInstance);
          }
          document.querySelectorAll("cal-modal-box").forEach((el) => {
            if (el instanceof HTMLElement) {
              syncCalModalLayout(el);
            }
          });
        },
      });

      return cal;
    })().catch((error) => {
      calInitPromise = null;
      throw error;
    });
  }

  return calInitPromise;
}

const calModalConfig = {
  layout: "month_view",
  useSlotsViewOnSmallScreen: "true",
} as const;

function getCalModalConfig() {
  if (isMobileCalModalViewport()) {
    return {
      layout: "month_view" as const,
    };
  }

  return calModalConfig;
}

function resetCalModalForMobileOpen() {
  if (!isMobileCalModalViewport()) return;

  document.querySelectorAll("cal-modal-box").forEach((modal) => {
    modal.setAttribute("state", "closed");
    modal.remove();
  });
}

export function openConsultationModal(cal: CalApi) {
  applyCalEmbedUiForViewport(cal);
  resetCalModalForMobileOpen();
  cal("modal", {
    calLink: calConsultationConfig.calLink,
    config: getCalModalConfig(),
  });
}

export function openCalBookingModal(cal: CalApi, calLink: string) {
  applyCalEmbedUiForViewport(cal);
  resetCalModalForMobileOpen();
  cal("modal", {
    calLink,
    config: getCalModalConfig(),
  });
}

export function openConsultationModalFromEvent(cal: CalApi, event: Event) {
  event.preventDefault();
  openConsultationModal(cal);
}

export async function openConsultationBooking(): Promise<void> {
  const cal = await initConsultationCal();
  openConsultationModal(cal);
}

const CAL_MODAL_LAYOUT_STYLE_ID = "gipl-cal-modal-mobile-layout";

const CAL_MODAL_MOBILE_CSS = `
@media ${CAL_MODAL_MOBILE_MQ} {
  :host {
    position: fixed !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
    overflow: hidden !important;
    z-index: 2147483647 !important;
  }

  .my-backdrop {
    position: fixed !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    padding: 0 !important;
    margin: 0 !important;
    background-color: #ffffff !important;
    border-radius: 0 !important;
    overflow: hidden !important;
    z-index: 2147483647 !important;
  }

  @media (prefers-color-scheme: dark) {
    .my-backdrop {
      background-color: hsl(0, 0%, 6%) !important;
    }
  }

  .header {
    position: fixed !important;
    top: max(0.75rem, env(safe-area-inset-top, 0px));
    right: max(1rem, env(safe-area-inset-right, 0px));
    left: auto;
    float: none;
    z-index: 2147483647 !important;
    padding: 0;
    margin: 0;
    pointer-events: auto !important;
  }

  .close {
    position: relative !important;
    left: 0 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    margin: 0;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 9999px;
    background-color: rgba(61, 49, 38, 0.88) !important;
    color: #faf8f5 !important;
    font-size: 1.5rem;
    font-weight: 400;
    line-height: 1;
    box-shadow: none !important;
    cursor: pointer !important;
    pointer-events: auto !important;
    z-index: 2147483647 !important;
    -webkit-tap-highlight-color: transparent;
    appearance: none;
  }

  .close:focus-visible {
    outline: 2px solid #b38b5d;
    outline-offset: 2px;
  }

  .modal-box {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100dvh !important;
    max-width: none !important;
    max-height: 100dvh !important;
    margin: 0 !important;
    transform: none !important;
    overflow: hidden !important;
    border-radius: 0 !important;
    z-index: 1 !important;
  }

  .body,
  #skeleton-container {
    min-height: 100% !important;
    height: 100% !important;
    max-height: 100% !important;
    border-radius: 0 !important;
  }

  iframe.cal-embed {
    display: block !important;
    width: 100% !important;
    height: 100% !important;
    min-height: 100% !important;
    max-height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    border-radius: 0 !important;
    overflow: hidden !important;
  }
}
`;

const CAL_MODAL_DESKTOP_CSS = `
@media (min-width: 641px) {
  .my-backdrop {
    overflow-y: auto !important;
  }
}
`;

const CAL_MODAL_LAYOUT_CSS = `${CAL_MODAL_MOBILE_CSS}\n${CAL_MODAL_DESKTOP_CSS}`;

function removeInlineProps(el: HTMLElement, props: string[]) {
  for (const prop of props) {
    el.style.removeProperty(prop);
  }
}

function resetCalModalInlineStyles(modal: HTMLElement) {
  removeInlineProps(modal, [
    "position",
    "inset",
    "width",
    "height",
    "max-height",
    "z-index",
  ]);

  const root = modal.shadowRoot;
  if (!root) return;

  const modalBox = root.querySelector(".modal-box");
  if (modalBox instanceof HTMLElement) {
    removeInlineProps(modalBox, [
      "position",
      "top",
      "left",
      "right",
      "bottom",
      "width",
      "height",
      "max-height",
      "margin",
      "transform",
      "border-radius",
      "z-index",
    ]);
  }

  const header = root.querySelector(".header");
  if (header instanceof HTMLElement) {
    removeInlineProps(header, ["z-index", "pointer-events"]);
  }

  const close = root.querySelector(".close");
  if (close instanceof HTMLElement) {
    removeInlineProps(close, [
      "pointer-events",
      "cursor",
      "color",
      "background-color",
      "border",
      "box-shadow",
    ]);
  }

  const iframe = modal.querySelector("iframe.cal-embed");
  if (iframe instanceof HTMLIFrameElement) {
    removeInlineProps(iframe, [
      "width",
      "height",
      "min-height",
      "max-height",
      "border-radius",
      "margin",
      "transform",
      "transform-origin",
    ]);
  }

  const body = root.querySelector(".body, #skeleton-container");
  if (body instanceof HTMLElement) {
    removeInlineProps(body, ["height", "min-height", "max-height"]);
  }
}

function syncCalModalOpenClass(modal: HTMLElement) {
  const state = modal.getAttribute("state");
  const isOpen = Boolean(state && state !== "closed");
  document.body.classList.toggle("cal-modal-open", isOpen);
}

function syncCalModalOpenClassFromDom() {
  const openModal = [...document.querySelectorAll("cal-modal-box")].find((el) => {
    const state = el.getAttribute("state");
    return Boolean(state && state !== "closed");
  });
  document.body.classList.toggle("cal-modal-open", Boolean(openModal));
}

function patchCalModalIframe(modal: HTMLElement) {
  if (!isMobileCalModalViewport()) return;

  const iframe = modal.querySelector("iframe.cal-embed");
  if (!(iframe instanceof HTMLIFrameElement)) return;

  iframe.style.setProperty("width", "100%", "important");
  iframe.style.setProperty("height", "100%", "important");
  iframe.style.setProperty("min-height", "100%", "important");
  iframe.style.setProperty("max-height", "100%", "important");
  iframe.style.setProperty("margin", "0", "important");
  iframe.style.setProperty("border-radius", "0", "important");
}

function patchCalModalDesktopIframe(modal: HTMLElement) {
  if (isMobileCalModalViewport()) return;

  const iframe = modal.querySelector("iframe.cal-embed");
  if (!(iframe instanceof HTMLIFrameElement)) return;

  const cap = window.innerHeight - 100;
  iframe.style.setProperty("max-height", `${cap}px`, "important");

  const parsedHeight = Number.parseFloat(iframe.style.height);
  if (Number.isFinite(parsedHeight) && parsedHeight > cap) {
    iframe.style.setProperty("height", `${cap}px`, "important");
  }
}

function patchCalModalMobileInline(modal: HTMLElement) {
  modal.style.setProperty("position", "fixed", "important");
  modal.style.setProperty("inset", "0", "important");
  modal.style.setProperty("width", "100%", "important");
  modal.style.setProperty("height", "100dvh", "important");
  modal.style.setProperty("max-height", "100dvh", "important");
  modal.style.setProperty("z-index", "2147483647", "important");

  const root = modal.shadowRoot;
  if (!root) return;

  const backdrop = root.querySelector(".my-backdrop");
  if (backdrop instanceof HTMLElement) {
    backdrop.style.setProperty("border-radius", "0", "important");
    backdrop.style.setProperty("overflow", "hidden", "important");
    backdrop.style.setProperty("background-color", getMobileModalSurfaceColor(), "important");
  }

  const modalBox = root.querySelector(".modal-box");
  if (modalBox instanceof HTMLElement) {
    modalBox.style.setProperty("position", "absolute", "important");
    modalBox.style.setProperty("inset", "0", "important");
    modalBox.style.setProperty("width", "100%", "important");
    modalBox.style.setProperty("height", "100dvh", "important");
    modalBox.style.setProperty("max-height", "100dvh", "important");
    modalBox.style.setProperty("margin", "0", "important");
    modalBox.style.setProperty("transform", "none", "important");
    modalBox.style.setProperty("border-radius", "0", "important");
    modalBox.style.setProperty("z-index", "1", "important");
  }

  const header = root.querySelector(".header");
  if (header instanceof HTMLElement) {
    header.style.setProperty("z-index", "2147483647", "important");
    header.style.setProperty("pointer-events", "auto", "important");
  }

  const close = root.querySelector(".close");
  if (close instanceof HTMLElement) {
    close.style.setProperty("pointer-events", "auto", "important");
    close.style.setProperty("cursor", "pointer", "important");
    close.style.setProperty("color", "#faf8f5", "important");
    close.style.setProperty("background-color", "rgba(61, 49, 38, 0.88)", "important");
    close.style.setProperty("border", "1px solid rgba(255, 255, 255, 0.35)", "important");
    close.style.setProperty("box-shadow", "none", "important");
  }

  const body = root.querySelector(".body, #skeleton-container");
  if (body instanceof HTMLElement) {
    body.style.setProperty("height", "100%", "important");
    body.style.setProperty("min-height", "100%", "important");
    body.style.setProperty("max-height", "100%", "important");
  }

  patchCalModalIframe(modal);
}

function injectCalModalLayoutStyles(modal: HTMLElement) {
  const root = modal.shadowRoot;
  if (!root) return;

  let style = root.getElementById(CAL_MODAL_LAYOUT_STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = CAL_MODAL_LAYOUT_STYLE_ID;
    root.appendChild(style);
  }
  style.textContent = CAL_MODAL_LAYOUT_CSS;
}

function syncCalModalLayout(modal: HTMLElement) {
  injectCalModalLayoutStyles(modal);
  syncCalModalOpenClass(modal);

  if (calApiInstance) {
    applyCalEmbedUiForViewport(calApiInstance);
  }

  if (isMobileCalModalViewport()) {
    patchCalModalMobileInline(modal);
    return;
  }

  // Desktop: only cap iframe height. Cal.com relies on its own inline layout styles.
  patchCalModalDesktopIframe(modal);
}

export function applyCalModalMobileLayout(modal: HTMLElement) {
  syncCalModalLayout(modal);
}

function watchCalModalLayout(modal: HTMLElement): () => void {
  syncCalModalLayout(modal);

  let iframeObserver: MutationObserver | undefined;
  let syncRaf = 0;

  const attachIframeObserver = () => {
    const iframe = modal.querySelector("iframe.cal-embed");
    if (!(iframe instanceof HTMLIFrameElement) || iframeObserver) return;

    iframeObserver = new MutationObserver(() => {
      scheduleResync();
    });
    iframeObserver.observe(iframe, {
      attributes: true,
      attributeFilter: ["style"],
    });
  };

  const scheduleResync = () => {
    cancelAnimationFrame(syncRaf);
    syncRaf = requestAnimationFrame(() => {
      syncCalModalLayout(modal);
      attachIframeObserver();
    });
  };

  const modalObserver = new MutationObserver((mutations) => {
    const stateChanged = mutations.some(
      (mutation) =>
        mutation.type === "attributes" &&
        mutation.attributeName === "state" &&
        mutation.target === modal,
    );
    if (stateChanged) {
      scheduleResync();
      return;
    }

    const subtreeChanged = mutations.some(
      (mutation) => mutation.type === "childList" && mutation.target === modal,
    );
    if (subtreeChanged) {
      scheduleResync();
    }
  });

  modalObserver.observe(modal, {
    attributes: true,
    attributeFilter: ["state"],
    childList: true,
    subtree: false,
  });

  scheduleResync();
  window.addEventListener("resize", scheduleResync);

  return () => {
    cancelAnimationFrame(syncRaf);
    modalObserver.disconnect();
    iframeObserver?.disconnect();
    window.removeEventListener("resize", scheduleResync);
    syncCalModalOpenClassFromDom();
  };
}

const modalWatchers = new WeakMap<HTMLElement, () => void>();

export function observeCalModalMobileLayout(): () => void {
  const scan = (node: Node) => {
    if (!(node instanceof HTMLElement)) return;

    const modals =
      node.tagName === "CAL-MODAL-BOX"
        ? [node]
        : [...node.querySelectorAll("cal-modal-box")];

    for (const modal of modals) {
      if (!(modal instanceof HTMLElement)) continue;
      if (modalWatchers.has(modal)) continue;
      modalWatchers.set(modal, watchCalModalLayout(modal));
    }
  };

  document.querySelectorAll("cal-modal-box").forEach((el) => {
    scan(el);
  });

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(scan);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    document.querySelectorAll("cal-modal-box").forEach((el) => {
      const stop = modalWatchers.get(el as HTMLElement);
      stop?.();
      modalWatchers.delete(el as HTMLElement);
    });
  };
}

export async function openCalBooking(bookingUrl: string): Promise<void> {
  const calLink = calLinkFromBookingUrl(bookingUrl);
  if (!calLink) {
    await openConsultationBooking();
    return;
  }

  const cal = await initConsultationCal();
  openCalBookingModal(cal, calLink);
}
