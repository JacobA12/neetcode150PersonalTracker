import { createApiSource } from "./sources/apiSource";
import { createLocalStorageSource } from "./sources/localStorageSource";

export function createTrackerRepository() {
  const mode = import.meta.env.VITE_TRACKER_DATA_SOURCE || "local";

  if (mode === "api") {
    const baseUrl = import.meta.env.VITE_TRACKER_API_BASE_URL || "/api/tracker";
    return createApiSource(baseUrl);
  }

  return createLocalStorageSource();
}
