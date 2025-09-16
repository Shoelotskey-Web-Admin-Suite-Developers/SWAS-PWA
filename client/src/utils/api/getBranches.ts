// utils/api/getBranches.ts
export async function getBranches() {
  const token = sessionStorage.getItem("token")

  const res = await fetch("http://localhost:5000/api/branches", {
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
