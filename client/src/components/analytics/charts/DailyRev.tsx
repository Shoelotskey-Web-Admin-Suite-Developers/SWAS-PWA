"use client"

import { useEffect, useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ReferenceArea } from "recharts"
import { format } from "date-fns"
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

import { getPairedRevenueData } from "@/utils/api/getForecastChart"
import { TrendingUp } from "lucide-react"

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
        // ensure chronological ordering by parsing dates (robust to format variations)
        console.debug("getPairedRevenueData returned dates", data.map((d: any) => d.date))
        const sorted = [...data].sort((a: any, b: any) => {
          const ta = Date.parse(a.date)
          const tb = Date.parse(b.date)
          if (!isNaN(ta) && !isNaN(tb)) return ta - tb
          return String(a.date).localeCompare(String(b.date))
        })
        console.debug("sorted paired dates", sorted.map((d: any) => d.date))

        const mapped = sorted.map((item: any) => {
            const hasActual = (item.SMVal != null) || (item.Val != null) || (item.SMGra != null)
            return {
              ...item,
              // mark total only when there's actual data present for that date
              total: hasActual ? (Number(item.SMVal ?? 0) + Number(item.Val ?? 0) + Number(item.SMGra ?? 0)) : null,
              totalFC: Number(item.SMValFC ?? 0) + Number(item.ValFC ?? 0) + Number(item.SMGraFC ?? 0),
            }
          })
        console.debug("mapped chartData dates", mapped.map((d: any) => d.date))
        setChartData(
          mapped
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
    <Card className="rounded-3xl flex-[1_1_85%]">
      <CardHeader className="items-start gap-4 text-sm pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <h2>Daily Revenue Trend</h2>
          </CardTitle>
          
          {/* Chart Legend - moved to header */}
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-4 h-0.5 bg-gray-800 rounded-full"></div>
              <span className="text-gray-600 font-medium">Actual Data</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-4 h-0.5 border-b-2 border-gray-800 border-dashed"></div>
              <span className="text-gray-600 font-medium">Forecasted Data</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer config={chartConfig} style={{ width: "100%", height: "250px" }}>
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
              tick={(props) => {
                const { x, y, payload } = props;
                const raw = payload.value as string // expected YYYY-MM-DD or similar
                let formatted = raw
                try {
                  const d = new Date(raw)
                  formatted = format(d, "MMM d") // e.g. "Sep 20"
                } catch (e) {
                  // fallback: use raw
                }

                if (window.innerWidth < 870) {
                  const [month, day] = formatted.split(" ");
                  return (
                    <g transform={`translate(${x},${y + 10})`}>
                      <text textAnchor="middle" fill="var(--foreground)" fontSize={10}>
                        <tspan x={0} dy={-8}>{month}</tspan>
                        <tspan x={0} dy={14}>{day}</tspan>
                      </text>
                    </g>
                  );
                }

                // default horizontal tick
                return (
                  <g transform={`translate(${x},${y + 10})`}>
                    <text textAnchor="middle" fill="var(--foreground)" fontSize={12}>
                      {formatted}
                    </text>
                  </g>
                );
              }}
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

      <CardFooter className="p-0 mt-4">
        <div className="w-full space-y-6">
          {/* Smart insights - full width */}
          <div className="px-6 pb-6">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-sm font-medium text-blue-700">Loading revenue data...</span>
            </div>
          ) : (
            (() => {
              // compute stats based on selected branches
              const actualRows = chartData.filter(d => d.total != null)
              const branchNames: Record<string, string> = { 
                SMVal: "SM Valenzuela", 
                Val: "Valenzuela", 
                SMGra: "SM Grand", 
                total: "All Branches" 
              }

              // determine context based on selection
              const isAllBranches = selectedBranches.length === 0 || selectedBranches.includes("4")
              const isSingleBranch = selectedBranches.length === 1 && !selectedBranches.includes("4")

              let contextualRevenue = 0
              let contextualForecast = 0
              let contextLabel = ""

              if (isAllBranches) {
                contextualRevenue = actualRows.reduce((s, r) => s + Number(r.total ?? 0), 0)
                contextualForecast = chartData.filter(d => d.total == null).reduce((s, r) => s + Number(r.totalFC ?? 0), 0)
                contextLabel = "across all branches"
              } else if (isSingleBranch) {
                const branchKey = selectedBranches.includes("1") ? "SMVal" : 
                                selectedBranches.includes("2") ? "Val" : "SMGra"
                contextualRevenue = actualRows.reduce((s, r) => s + Number(r[branchKey] ?? 0), 0)
                contextualForecast = chartData.filter(d => d.total == null).reduce((s, r) => s + Number(r[branchKey + "FC"] ?? 0), 0)
                contextLabel = `for ${branchNames[branchKey]}`
              } else {
                // multiple branches
                const keys: string[] = []
                if (selectedBranches.includes("1")) keys.push("SMVal")
                if (selectedBranches.includes("2")) keys.push("Val")
                if (selectedBranches.includes("3")) keys.push("SMGra")
                
                contextualRevenue = actualRows.reduce((s, r) => s + keys.reduce((sum, key) => sum + Number(r[key] ?? 0), 0), 0)
                contextualForecast = chartData.filter(d => d.total == null).reduce((s, r) => s + keys.reduce((sum, key) => sum + Number(r[key + "FC"] ?? 0), 0), 0)
                contextLabel = `for ${keys.map(k => branchNames[k as keyof typeof branchNames]).join(" & ")}`
              }

              const avgDaily = actualRows.length ? Math.round(contextualRevenue / actualRows.length) : 0
              const pctChange = contextualRevenue ? Math.round(((contextualForecast - contextualRevenue) / contextualRevenue) * 100) : 0

              // Enhanced insights with better UX
              const insightCards = []
              
              if (isSingleBranch) {
                insightCards.push({
                  icon: "🏪",
                  title: "Branch Performance",
                  value: `₱${contextualRevenue.toLocaleString()}`,
                  subtitle: `${contextLabel.replace("for ", "")} • ${actualRows.length} days`,
                  bg: "bg-gradient-to-br from-green-50 to-emerald-50",
                  border: "border-green-200",
                  iconBg: "bg-green-100"
                })
                insightCards.push({
                  icon: "💰",
                  title: "Daily Average",
                  value: `₱${avgDaily.toLocaleString()}`,
                  subtitle: "Average per day",
                  bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
                  border: "border-blue-200",
                  iconBg: "bg-blue-100"
                })
              } else if (isAllBranches) {
                insightCards.push({
                  icon: "🏢",
                  title: "Total Revenue",
                  value: `₱${contextualRevenue.toLocaleString()}`,
                  subtitle: `All branches • ${actualRows.length} days`,
                  bg: "bg-gradient-to-br from-purple-50 to-violet-50",
                  border: "border-purple-200",
                  iconBg: "bg-purple-100"
                })
                insightCards.push({
                  icon: "📊",
                  title: "Daily Average",
                  value: `₱${avgDaily.toLocaleString()}`,
                  subtitle: "Combined average",
                  bg: "bg-gradient-to-br from-indigo-50 to-blue-50",
                  border: "border-indigo-200",
                  iconBg: "bg-indigo-100"
                })
              } else {
                insightCards.push({
                  icon: "🎯",
                  title: "Selected Revenue",
                  value: `₱${contextualRevenue.toLocaleString()}`,
                  subtitle: `Multiple branches • ${actualRows.length} days`,
                  bg: "bg-gradient-to-br from-orange-50 to-amber-50",
                  border: "border-orange-200",
                  iconBg: "bg-orange-100"
                })
                insightCards.push({
                  icon: "📈",
                  title: "Daily Average",
                  value: `₱${avgDaily.toLocaleString()}`,
                  subtitle: "Combined average",
                  bg: "bg-gradient-to-br from-teal-50 to-cyan-50",
                  border: "border-teal-200",
                  iconBg: "bg-teal-100"
                })
              }

              if (pctChange !== 0) {
                const isPositive = pctChange > 0
                insightCards.push({
                  icon: isPositive ? "📈" : "📉",
                  title: "Forecast Trend",
                  value: `${isPositive ? "+" : ""}${pctChange}%`,
                  subtitle: `${isPositive ? "Growth" : "Decline"} vs recent performance`,
                  bg: isPositive 
                    ? "bg-gradient-to-br from-green-50 to-lime-50" 
                    : "bg-gradient-to-br from-red-50 to-rose-50",
                  border: isPositive ? "border-green-200" : "border-red-200",
                  iconBg: isPositive ? "bg-green-100" : "bg-red-100"
                })
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {insightCards.map((card, idx) => (
                    <div 
                      key={idx} 
                      className={`
                        ${card.bg} ${card.border} border rounded-xl p-4 
                        hover:shadow-md transition-all duration-200 
                        hover:scale-[1.02] cursor-default
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`${card.iconBg} w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0`}>
                          {card.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                            {card.title}
                          </div>
                          <div className="text-lg font-bold text-gray-900 mb-1 truncate">
                            {card.value}
                          </div>
                          <div className="text-xs text-gray-500 leading-tight">
                            {card.subtitle}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()
          )}
          </div>
          

        </div>
      </CardFooter>
    </Card>
  )
}
