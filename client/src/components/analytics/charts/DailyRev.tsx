"use client"

import { useEffect, useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ReferenceArea } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import type { ChartConfig } from "@/components/ui/chart"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { getPairedRevenueData } from "@/pages/analytics/getForecastChart"

interface ChartLineLinearProps {
  selectedBranches: string[]
}

export const description = "A linear line chart"

const chartConfig = {
  total: { label: "Total of Branches", color: "#CE1616" },
  totalFC: { label: "Total of Branches Forecasted", color: "#CE1616" },
  SMVal: { label: "SM Valenzuela", color: "#22C55E" },
  SMValFC: { label: "SM Valenzuela Forecasted", color: "#22C55E" },
  Val: { label: "Valenzuela", color: "#9747FF" },
  ValFC: { label: "Valenzuela Forecasted", color: "#9747FF" },
  SMGra: { label: "SM Grand", color: "#0D55F1" },
  SMGraFC: { label: "SM Grand Forecasted", color: "#0D55F1" },
} satisfies ChartConfig

const hollowDot = (color: string) => (props: any) => {
  if (props.value === null || props.value === undefined) return null as unknown as React.ReactElement
  const { cx, cy } = props
  return (
    <circle cx={cx} cy={cy} r={3} fill="white" stroke={color} strokeWidth={2} opacity={0.5} />
  )
}

export function DailyRevenueTrend({ selectedBranches }: ChartLineLinearProps) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getPairedRevenueData()
        setChartData(
          data.map((item: any, index: number) => ({
            ...item,
            total: index < 7
              ? (item.SMVal ?? 0) + (item.Val ?? 0) + (item.SMGra ?? 0)
              : null,
            totalFC: (item.SMValFC ?? 0) + (item.ValFC ?? 0) + (item.SMGraFC ?? 0),
          }))
        )
      } catch (err) {
        console.error("Error fetching chart data:", err)
      }
    }
    fetchData()
  }, [])

  const filteredData = chartData.map(item => {
    const filteredItem: any = { date: item.date }
    if (selectedBranches.includes("1") || selectedBranches.length === 0) {
      filteredItem.SMVal = item.SMVal
      filteredItem.SMValFC = item.SMValFC
    }
    if (selectedBranches.includes("2") || selectedBranches.length === 0) {
      filteredItem.Val = item.Val
      filteredItem.ValFC = item.ValFC
    }
    if (selectedBranches.includes("3") || selectedBranches.length === 0) {
      filteredItem.SMGra = item.SMGra
      filteredItem.SMGraFC = item.SMGraFC
    }
    if (selectedBranches.includes("4") || selectedBranches.length === 0) {
      filteredItem.total = item.total
      filteredItem.totalFC = item.totalFC
    }
    return filteredItem
  })

  const solidPct = 7 / (chartData.length - 1)

  const forecastStartIndex = chartData.findIndex(item => item.total === null)
  const forecastStart = chartData[forecastStartIndex]?.date
  const forecastEnd = chartData[chartData.length - 1]?.date

  const highlightStart = chartData[6]?.date
  const highlightEnd = chartData[8]?.date

  return (
    <Card className="rounded-3xl">
      <CardHeader className="items-start gap-2 text-sm">
        <CardTitle><h2>Daily Revenue Trend</h2></CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} style={{ width: "900px", height: "250px" }}>
          <LineChart data={filteredData} margin={{ top: 12, right: 12, bottom: 25, left: 12 }}>
            <defs>
              <linearGradient id="lineUntilDash" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" />
                <stop offset={`${solidPct * 100}%`} stopColor="hsl(var(--chart-1))" />
                <stop offset={`${solidPct * 100}%`} stopColor="transparent" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <pattern id="yellowStripes" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                <rect width="8" height="8" fill="#FFDB58" />
                <line x1="0" y1="0" x2="0" y2="8" stroke="white" strokeWidth="4" />
              </pattern>
            </defs>

            <CartesianGrid vertical stroke="#CCCCCC" strokeDasharray="3 3" />
            <YAxis 
              tickFormatter={(value) => (value === 0 ? "0" : `${value / 1000}k`)}
              tickCount={5}
              width={40}
              axisLine={false}
              tickLine={false}
              label={{ value: "Revenue", angle: -90, position: "insideLeft", style: { textAnchor: "middle", fill: "var(--foreground)", fontSize: 14 } }}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              tickFormatter={(value) => value.replace(" ", "")}
              label={{ value: "Date", position: "insideBottom", offset: -20, style: { textAnchor: "middle", fill: "var(--foreground)", fontSize: 14 } }}
            />
            
            <ReferenceArea x1={forecastStart} x2={forecastEnd} strokeOpacity={0} fill="#F0F0F0" />
            <ReferenceArea x1={highlightStart} x2={highlightEnd} strokeOpacity={0} fill="url(#yellowStripes)" />

            <ChartTooltip cursor content={<ChartTooltipContent indicator="line" />} />

            <Line dataKey="total" strokeWidth={2} stroke={chartConfig.total.color} dot />
            <Line dataKey="SMVal" strokeWidth={2} stroke={chartConfig.SMVal.color} dot />
            <Line dataKey="Val" strokeWidth={2} stroke={chartConfig.Val.color} dot />
            <Line dataKey="SMGra" strokeWidth={2} stroke={chartConfig.SMGra.color} dot />

            <Line dataKey="totalFC" strokeWidth={2} strokeDasharray="5 5" stroke={chartConfig.totalFC.color} dot={hollowDot(chartConfig.totalFC.color)} opacity={0.5}/>
            <Line dataKey="SMValFC" strokeWidth={2} strokeDasharray="5 5" stroke={chartConfig.SMValFC.color} dot={hollowDot(chartConfig.SMValFC.color)} opacity={0.5}/>
            <Line dataKey="ValFC" strokeWidth={2} strokeDasharray="5 5" stroke={chartConfig.ValFC.color} dot={hollowDot(chartConfig.ValFC.color)} opacity={0.5}/>
            <Line dataKey="SMGraFC" strokeWidth={2} strokeDasharray="5 5" stroke={chartConfig.SMGraFC.color} dot={hollowDot(chartConfig.SMGraFC.color)} opacity={0.5}/>
            
          </LineChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="justify-end gap-6 -mt-10">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="inline-block w-6 h-[2px] bg-black"></span>
          <span>Actual Data</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="inline-block w-6 h-[2px] border-b-2 border-black border-dashed"></span>
          <span>Forecasted Data</span>
        </div>
      </CardFooter>
    </Card>
  )
}
