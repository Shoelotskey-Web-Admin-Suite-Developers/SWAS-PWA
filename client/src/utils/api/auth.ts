const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function loginUser(userId: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
}

export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("branch_id");
  localStorage.removeItem("position");
}
