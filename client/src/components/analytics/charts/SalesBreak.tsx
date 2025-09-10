"use client"

import * as React from "react"
import { Pie, PieChart, Label } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A donut chart with text"

const chartData = [
  { status: "Unpaid", customers: 1875, fill: "#FF2056" },
  { status: "Partially Paid", customers: 800, fill: "#78e8a1ff" },
  { status: "Paid", customers: 800, fill: "#FACC15" },
]

const chartConfig = {
  customers: {
    label: "Customers",
  },
  up: {
    label: "Unpaid",
    color: "var(--chart-1)",
  },
  pp: {
    label: "Partially Paid",
    color: "var(--chart-2)",
  },
  p: {
    label: "Paid",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function SalesBreakdown() {
  const totalCustomers = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.customers, 0)
  }, [])

  return (
    <Card className="flex" style={{ width: "100%", height: "140px" }}>
      <CardHeader className="items-left pb-0">
        <CardTitle>
          <h3>Sales Breakdown</h3>
        </CardTitle>
        <CardDescription>January - June 2024</CardDescription>
        <CardDescription>
          <ul className="space-y-0">
            <li className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#FF2056] rounded-sm"></div>
              Unpaid
            </li>
            <li className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#78e8a1ff] rounded-sm"></div>
              Partially Paid
            </li>
            <li className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#FACC15] rounded-sm"></div>
              Paid
            </li>
          </ul>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex justify-center items-center pb-0">
        <ChartContainer config={chartConfig} className="flex justify-center items-center w-[100px] h-[100px]">
          <PieChart width={150} height={150}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="customers"
              nameKey="status"
              innerRadius={30}
              outerRadius={50}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 4}
                          className="fill-foreground text-lg font-bold"
                        >
                          {totalCustomers.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 8}
                          className="fill-muted-foreground text-[10px]"
                        >
                          Customers
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
