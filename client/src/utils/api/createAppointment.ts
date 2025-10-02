// src/utils/api/createAppointment.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface CreateAppointmentPayload {
  cust_id: string;
  branch_id: string;
  date_for_inquiry: string | Date; // ISO or Date
  time_start: string; // HH:mm
  time_end: string;   // HH:mm
  appointment_id?: string; // optional client-provided id
}

export interface CreateAppointmentResponse {
  success: boolean;
  data?: any;
  code?: string;
  message?: string;
}

export async function createAppointment(payload: CreateAppointmentPayload): Promise<CreateAppointmentResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(()=>({}));

    if (!res.ok) {
      return {
        success: false,
        code: data.code,
        message: data.message || `Failed to create appointment (HTTP ${res.status})`,
      };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('createAppointment error:', error);
    return { success: false, message: 'Network or server error' };
  }
}
