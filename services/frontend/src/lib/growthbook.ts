import { GrowthBook } from "@growthbook/growthbook-react";
import { BrowserCookieStickyBucketService } from "@growthbook/growthbook";
import { autoAttributesPlugin, growthbookTrackingPlugin } from "@growthbook/growthbook/plugins";
import Cookies from "js-cookie";

const clientKey = import.meta.env.VITE_GROWTHBOOK_CLIENT_KEY || "sdk-placeholder";

const stickyBucketService = new BrowserCookieStickyBucketService({
  jsCookie: Cookies
});

export const growthbook = new GrowthBook({
  apiHost: "https://cdn.growthbook.io",
  clientKey,
  enableDevMode: import.meta.env.DEV,
  subscribeToChanges: true,
  stickyBucketService,
  trackingCallback: (experiment, result) => {
    growthbook.logEvent("Experiment Viewed", {
      experimentId: experiment.key,
      variationId: result.key,
    });
  },
  plugins: [
    autoAttributesPlugin(),
    growthbookTrackingPlugin()
  ]
});

// Initialize features immediately
growthbook.init({
  streaming: true
});

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  console.log("[Telemetry Event]", eventName, properties);
  growthbook.logEvent(eventName, properties);
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

export function trackSearchDebounced(query: string) {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    trackEvent("search", { query });
  }, 500);
}
