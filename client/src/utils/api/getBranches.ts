// utils/api/getBranches.ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function getBranches() {
  const token = sessionStorage.getItem("token")

  const res = await fetch(`${BASE_URL}/api/branches`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch branches")
  }

  return res.json()
}
