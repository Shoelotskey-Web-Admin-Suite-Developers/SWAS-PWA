"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

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

export const description = "A simple pie chart"

const chartData = [
  { service: "Basic Cleaning", transactions: 1875, fill: '#FF2056' },
  { service: "Minor Reglue", transactions: 800, fill: '#FACC15' },
  { service: "Full Reglue", transactions: 587, fill: '#FB923C' },
]

const chartConfig = {
  service: {
    label: "Service",
  },
  bc: {
    label: "Basic Cleaning",
    color: "var(--chart-1)",
  },
  mr: {
    label: "Minor Reglue",
    color: "var(--chart-2)",
  },
  fr: {
    label: "Full Reglue",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function TopServices() {
  return (
    <Card className="flex" style={{ width: "360px", height: "140px" }}>
      <CardHeader className="items-left pb-0">
        <CardTitle><h3>Top Services</h3></CardTitle>
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
          className="mx-auto aspect-square max-h-[130px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={chartData} dataKey="transactions" nameKey="service" />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
