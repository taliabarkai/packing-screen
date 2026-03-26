/**
 * Reserves a new shipment id for a split operation.
 * Set VITE_SPLIT_SHIPMENT_NEW_ID_URL to a POST endpoint that accepts JSON
 * { shipmentId: string } (current shipment) and returns JSON
 * { newShipmentId?: string, shipmentId?: string }.
 */
export async function loadNewSplitShipmentIdFromApi(currentShipmentId: string): Promise<string> {
  const endpoint = import.meta.env.VITE_SPLIT_SHIPMENT_NEW_ID_URL as string | undefined;

  if (endpoint) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipmentId: currentShipmentId }),
    });
    if (!res.ok) {
      throw new Error(`Split shipment id request failed: ${res.status}`);
    }
    const data = (await res.json()) as { newShipmentId?: unknown; shipmentId?: unknown };
    const id =
      typeof data.newShipmentId === "string"
        ? data.newShipmentId
        : typeof data.shipmentId === "string"
          ? data.shipmentId
          : null;
    if (!id) {
      throw new Error("Invalid split shipment response");
    }
    return id;
  }

  await new Promise((r) => setTimeout(r, 400));
  return String(Math.floor(100_000_000 + Math.random() * 900_000_000));
}
