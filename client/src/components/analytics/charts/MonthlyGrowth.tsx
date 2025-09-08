"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ChartConfig } from "@/components/ui/chart"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import monthlyRevenue from "@/../public/dummy-data/monthly_totals_full.json" 

export const description = "Multiple bar chart for branch sales"

interface ChartBarMultipleProps {
  selectedBranches: string[]; // IDs of selected branches
}

// Structure reference (kept only for typing)
const sampleData = [
  { month: "2025-01", SMVal: 40000, Val: 38000, SMGra: 37000, total: 115000 },
]

const branchMap: Record<string, keyof typeof sampleData[0]> = {
  "1": "SMVal",
  "2": "Val",
  "3": "SMGra",
  "4": "total",
}

const chartConfig = {
  total: {
    label: "SM Total of Branches",
    color: "#CE1616",
  },
  SMVal: {
    label: "SM Valenzuela",
    color: "#22C55E",
  },
  Val: {
    label: "Valenzuela",
    color: "#9747FF",
  },
  SMGra: {
    label: "SM Grand",
    color: "#0D55F1",
  },
} satisfies ChartConfig

export function MonthlyGrowthRate({ selectedBranches }: ChartBarMultipleProps) {
  const [data, setData] = useState<typeof sampleData>([])

  useEffect(() => {
    setData(monthlyRevenue) // load imported JSON
  }, [])

  // Apply filtering to loaded data
  const filteredData = data.map(item => {
    const newItem: typeof item = { ...item }
    Object.entries(branchMap).forEach(([branchId, key]) => {
      if (!selectedBranches.includes(branchId) && selectedBranches.length > 0) {
        newItem[key] = null
      }
    })
    return newItem
  })

  const barsToRender =
    selectedBranches.length > 0
      ? selectedBranches.map(id => branchMap[id])
      : ["total", "SMVal", "Val", "SMGra"]

  return (
    <Card className="rounded-3xl mb-10">
      <CardHeader>
        <CardTitle><h3>Monthly Growth Rate</h3></CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} style={{ width: "620px", height: "210px" }}>
          <BarChart accessibilityLayer data={filteredData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <YAxis
              tickCount={5}
              width={60}
              axisLine={false}
              tickLine={false}
              label={{
                value: "Revenue (₱)",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle", fill: "var(--foreground)", fontSize: 14 }
              }}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => format(new Date(value + "-01"), "MMM")}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            {barsToRender.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                fill={chartConfig[key].color}
                radius={4}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
