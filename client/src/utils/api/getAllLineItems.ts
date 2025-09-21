const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getAllLineItems() {
  const token = sessionStorage.getItem("token");
  const currentBranchId = sessionStorage.getItem("branch_id");

  if (!token || !currentBranchId) throw new Error("No token or branch_id found");

  const res = await fetch(`${API_BASE_URL}/line-items`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText)
    throw new Error(`Failed to fetch line items: ${txt}`)
  }

  const data: any[] = await res.json()

  if (currentBranchId === "SWAS-SUPERADMIN") return data
  return data.filter((d: any) => d.branch_id === currentBranchId)
}
