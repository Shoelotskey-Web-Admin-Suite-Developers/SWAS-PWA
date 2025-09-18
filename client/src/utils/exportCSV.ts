// utils/exportCSV.ts
import type { CustomerRow } from "@/pages/database-view/CustomerInformation"

export function exportCSV(rows: CustomerRow[], fileName = "customers.csv") {
  if (!rows || rows.length === 0) return

  // 1️⃣ Convert rows to CSV
  const header = Object.keys(rows[0]).join(",") // "id,name,birthday,..."
  const csv = [
    header,
    ...rows.map((r) =>
      Object.values(r)
        .map((v) => `"${v?.toString().replace(/"/g, '""')}"`) // escape quotes
        .join(",")
    ),
  ].join("\r\n")

  // 2️⃣ Create a blob
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })

  // 3️⃣ Create temporary link and trigger download
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", fileName)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
