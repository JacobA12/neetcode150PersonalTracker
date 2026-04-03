function jsonHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

export function createApiSource(baseUrl = "/api/tracker") {
  return {
    async load() {
      const response = await fetch(baseUrl, { method: "GET" });
      if (!response.ok) throw new Error("Failed to load tracker data");
      const payload = await response.json();
      return payload?.data && typeof payload.data === "object"
        ? payload.data
        : {};
    },

    async save(data) {
      const response = await fetch(baseUrl, {
        method: "PUT",
        headers: jsonHeaders(),
        body: JSON.stringify({ data }),
      });
      if (!response.ok) throw new Error("Failed to save tracker data");
    },

    async clear() {
      const response = await fetch(baseUrl, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to clear tracker data");
    },
  };
}
