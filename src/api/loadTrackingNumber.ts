/**
 * Loads a tracking number for the given order.
 * Set VITE_TRACKING_LOAD_URL to a POST endpoint that accepts JSON { orderId }
 * and returns JSON { trackingNumber?: string, trackingId?: string }.
 */
export async function loadTrackingNumberFromApi(orderId: string): Promise<string> {
  const endpoint = import.meta.env.VITE_TRACKING_LOAD_URL as string | undefined;

  if (endpoint) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    if (!res.ok) {
      throw new Error(`Tracking load failed: ${res.status}`);
    }
    const data = (await res.json()) as { trackingNumber?: unknown; trackingId?: unknown };
    const id =
      typeof data.trackingNumber === "string"
        ? data.trackingNumber
        : typeof data.trackingId === "string"
          ? data.trackingId
          : null;
    if (!id) {
      throw new Error("Invalid tracking response");
    }
    return id;
  }

  await new Promise((r) => setTimeout(r, 450));
  return `1Z${String(Math.floor(Math.random() * 1_000_000_000)).padStart(9, "0")}`;
}
