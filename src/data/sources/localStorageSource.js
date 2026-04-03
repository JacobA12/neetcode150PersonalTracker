import { TRACKER_STORAGE_KEY } from "../constants";

export function createLocalStorageSource(storageKey = TRACKER_STORAGE_KEY) {
  return {
    async load() {
      try {
        const parsed = JSON.parse(localStorage.getItem(storageKey) || "{}");
        return typeof parsed === "object" && parsed ? parsed : {};
      } catch {
        return {};
      }
    },

    async save(data) {
      localStorage.setItem(storageKey, JSON.stringify(data));
    },

    async clear() {
      localStorage.removeItem(storageKey);
    },
  };
}
