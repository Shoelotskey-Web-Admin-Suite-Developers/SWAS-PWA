export async function applyPayment(transactionId: string, payload: {
  dueNow: number;
  customerPaid: number;
  modeOfPayment?: string;
  lineItemId?: string;
  markPickedUp?: boolean;
}) {
  const base = (import.meta.env.VITE_API_BASE as string) || "http://localhost:5000";
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${base}/api/transactions/${encodeURIComponent(transactionId)}/apply-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `applyPayment failed: ${res.status}`);
  }

  return res.json();
}
