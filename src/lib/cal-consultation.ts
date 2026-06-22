import { getCalApi } from "@calcom/embed-react";
import { calConsultationConfig, SERVICE_BOOKING_FALLBACK_HREF } from "@/lib/site-config";

export type CalApi = Awaited<ReturnType<typeof getCalApi>>;

let calInitPromise: Promise<CalApi> | null = null;

export function isConsultationHref(href: string): boolean {
  return href === SERVICE_BOOKING_FALLBACK_HREF;
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
        cssVarsPerTheme: {
          light: {
            "cal-brand": calConsultationConfig.brandColor,
            "radius-full": "9999px",
            "radius-md": "9999px",
          },
          dark: {
            "cal-brand": calConsultationConfig.brandColor,
            "radius-full": "9999px",
            "radius-md": "9999px",
          },
        },
      });

      return cal;
    })();
  }

  return calInitPromise;
}

export function openConsultationModal(cal: CalApi) {
  cal("modal", {
    calLink: calConsultationConfig.calLink,
    config: {
      layout: "month_view",
      useSlotsViewOnSmallScreen: "true",
    },
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
