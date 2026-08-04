"use client";

import * as React from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { trackEvent } from "@/lib/analytics/client";
import type { AnalyticsEventName } from "@/lib/analytics/events";

const reportMetric: Parameters<typeof useReportWebVitals>[0] = (metric) => {
  trackEvent("web_vital", {
    metric: metric.name,
    value: Number(metric.value.toFixed(metric.name === "CLS" ? 4 : 0)),
    rating: metric.rating,
    metric_id: metric.id,
  });
};

export function Analytics({ gaId }: { gaId?: string }) {
  const pathname = usePathname();
  useReportWebVitals(reportMetric);

  React.useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    trackEvent("page_view", {
      utm_source: query.get("utm_source"),
      utm_medium: query.get("utm_medium"),
      utm_campaign: query.get("utm_campaign"),
    });

    const seen = new Set<string>();
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main [data-analytics-section]"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const section = (entry.target as HTMLElement).dataset.analyticsSection;
          if (!section || seen.has(section)) continue;
          seen.add(section);
          trackEvent("section_view", { section });
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.55 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  React.useEffect(() => {
    function recordClick(event: MouseEvent) {
      const element = event.target as Element | null;
      const explicit = element?.closest<HTMLElement>("[data-analytics-event]");
      if (explicit) {
        const eventName = explicit.dataset.analyticsEvent as
          | AnalyticsEventName
          | undefined;
        if (!eventName) return;
        trackEvent(eventName, {
          label: explicit.dataset.analyticsLabel,
          placement: explicit.dataset.analyticsPlacement,
          service: explicit.dataset.analyticsService,
        });
        return;
      }

      const link = element?.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (
        ![
          "/assessment",
          "/book",
          "/contact",
          "/plans",
          "/sign-up",
        ].some((path) => url.pathname.startsWith(path))
      ) {
        return;
      }
      trackEvent("cta_click", {
        destination: `${url.pathname}${url.search}`.slice(0, 160),
        label: (link.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 80),
        placement: window.location.pathname,
      });
    }

    document.addEventListener("click", recordClick);
    return () => document.removeEventListener("click", recordClick);
  }, []);

  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="vowfound-ga" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}
