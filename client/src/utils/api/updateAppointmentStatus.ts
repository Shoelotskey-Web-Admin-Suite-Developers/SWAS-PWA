const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const updateAppointmentStatus = async (appointment_id: string, status: "Approved" | "Canceled" | "Cancelled" | "Pending") => {
  try {
    // Normalize to American spelling when sending to server
    const normalizedStatus = status === 'Cancelled' ? 'Canceled' : status;

    const res = await fetch(`${API_BASE_URL}/api/appointments/${appointment_id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: normalizedStatus }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to update appointment status");
    }

    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error("updateAppointmentStatus error:", err);
    throw err;
  }
};
