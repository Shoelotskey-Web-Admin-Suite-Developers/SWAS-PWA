"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  { status: "Unpaid", customers: 1875, fill: '#FF2056' },
  { status: "Partially Paid", customers: 800, fill: '#78e8a1ff' },
  { status: "Paid", customers: 800, fill: '#FACC15' },
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
    <Card className="flex" style={{ width: "560px", height: "140px" }}>
      <CardHeader className="items-center pb-0">
        <CardTitle><h3>Sales Breakdown</h3></CardTitle>
        <CardDescription>January - June 2024</CardDescription>
        <CardDescription>
          <ul className="space-y-0">
            <li className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#FF2056] rounded-sm"></div>
              Basic Cleaning
            </li>
            <li className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#FACC15] rounded-sm"></div>
              Minor Reglue
            </li>
            <li className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#FB923C] rounded-sm"></div>
              Full Reglue
            </li>
          </ul>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="customers"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
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
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalCustomers.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
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
