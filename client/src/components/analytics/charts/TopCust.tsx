"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const description = "Top customers leaderboard"

const customers = [
  { rank: 1, name: "Juan Dela Cruz", spent: 5000 },
  { rank: 2, name: "Maria Santos", spent: 4800 },
  { rank: 3, name: "Pedro Reyes", spent: 4600 },
  { rank: 4, name: "Ana Lopez", spent: 4400 },
  { rank: 5, name: "Jose Rizal", spent: 4200 },
  { rank: 6, name: "Carla Mendoza", spent: 4000 },
  { rank: 7, name: "Mark Dizon", spent: 3800 },
  { rank: 8, name: "Liza Villanueva", spent: 3600 },
  { rank: 9, name: "Ramon Cruz", spent: 3400 },
  { rank: 10, name: "Ella Santos", spent: 3200 },
]

export function TopCustomers() {
  return (
    <Card className="flex flex-col" style={{ width: "320px", height: "290px" }}>
      <CardHeader className="pb-2">
        <CardTitle><h3>Top Customers</h3></CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="p-0 max-h-[270px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <ul>
          {customers.map((c, i) => (
            <li
              key={i}
              className="flex justify-between items-center px-4 py-2 border-b last:border-b-0 text-sm"
            >
              <span className="w-6">{c.rank}</span>
              <span className="flex-1 truncate">{c.name}</span>
              <span className="font-semibold">₱{c.spent.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
