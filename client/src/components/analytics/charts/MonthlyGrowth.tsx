"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { getMonthlyRevenue, MonthlyRevenueData } from "@/utils/api/getMonthlyRevenue"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export const description = "Multiple bar chart for branch sales"

interface ChartBarMultipleProps {
  selectedBranches: string[]; // IDs of selected branches
}

interface EnhancedMonthlyData extends MonthlyRevenueData {
  totalGrowth?: number;
  SMValGrowth?: number;
  ValGrowth?: number;
  SMGraGrowth?: number;
}

const branchMap: Record<string, keyof MonthlyRevenueData> = {
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
} as const

export function MonthlyGrowthRate({ selectedBranches }: ChartBarMultipleProps) {
  const [data, setData] = useState<EnhancedMonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper to get current month string
  const getCurrentMonth = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  // Function to calculate growth rates
  const calculateGrowthRates = (data: MonthlyRevenueData[]): EnhancedMonthlyData[] => {
    return data.map((current, index) => {
      if (index === 0) {
        // First month - no previous data to compare
        return {
          ...current,
          totalGrowth: 0,
          SMValGrowth: 0,
          ValGrowth: 0,
          SMGraGrowth: 0,
        }
      }

      const previous = data[index - 1]
      
      const calculateGrowth = (currentVal: number, previousVal: number): number => {
        if (previousVal === 0) return currentVal > 0 ? 100 : 0
        return ((currentVal - previousVal) / previousVal) * 100
      }

      return {
        ...current,
        totalGrowth: calculateGrowth(current.total, previous.total),
        SMValGrowth: calculateGrowth(current.SMVal, previous.SMVal),
        ValGrowth: calculateGrowth(current.Val, previous.Val),
        SMGraGrowth: calculateGrowth(current.SMGra, previous.SMGra),
      }
    })
  }

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        const monthlyData = await getMonthlyRevenue()
        const dataWithGrowth = calculateGrowthRates(monthlyData)
        setData(dataWithGrowth)
      } catch (err) {
        console.error("Error fetching monthly revenue:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch monthly revenue")
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Apply filtering to loaded data
  const filteredData = data.map(item => {
    const newItem = { ...item }
    Object.entries(branchMap).forEach(([branchId, key]) => {
      if (!selectedBranches.includes(branchId) && selectedBranches.length > 0) {
        // Use type assertion to handle the complex typing
        ;(newItem as any)[key] = null
      }
    })
    return newItem
  })
  


  const barsToRender =
    selectedBranches.length > 0
      ? selectedBranches.map(id => branchMap[id])
      : ["total", "SMVal", "Val", "SMGra"] as (keyof MonthlyRevenueData)[]

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <h4 className="font-semibold mb-3 text-gray-900">
            {format(new Date(label + "-01"), "MMMM yyyy")}
          </h4>
          {payload.map((entry: any, index: number) => {
            const branchKey = entry.dataKey as keyof EnhancedMonthlyData
            const growthKey = `${branchKey}Growth` as keyof EnhancedMonthlyData
            const config = (chartConfig as any)[branchKey]
            const revenue = entry.value
            const growth = entry.payload[growthKey] || 0
            
            if (revenue === null || revenue === undefined) return null
            
            // Check if this is current month (might have partial/daily updated data)
            const currentMonth = getCurrentMonth()
            const isCurrentMonth = label === currentMonth
            const isZeroRevenue = revenue === 0 && !isCurrentMonth

            const GrowthIcon = growth > 0 ? TrendingUp : growth < 0 ? TrendingDown : Minus
            const growthColor = growth > 0 ? "text-green-600" : growth < 0 ? "text-red-600" : "text-gray-500"
            
            return (
              <div key={index} className="flex items-center justify-between mb-2 min-w-[280px]">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: config?.color || "#000000" }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {config?.label || branchKey}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {isZeroRevenue ? "No Data" : `₱${(revenue / 1000).toFixed(1)}K`}
                    {isCurrentMonth && revenue === 0 && (
                      <span className="text-xs text-orange-600 block">Updating Daily</span>
                    )}
                  </div>
                  {(!isZeroRevenue || (isCurrentMonth && revenue > 0)) && (
                    <div className={`flex items-center gap-1 text-xs ${growthColor}`}>
                      <GrowthIcon size={12} />
                      <span>{growth >= 0 ? '+' : ''}{growth.toFixed(1)}%</span>
                      {isCurrentMonth && <span className="text-orange-600">*</span>}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card className="rounded-3xl flex-[1_1_70%]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <h3>Monthly Growth Rate</h3>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[210px]">
            <p>Loading monthly revenue data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="rounded-3xl flex-[1_1_70%]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <h3>Monthly Growth Rate</h3>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[210px]">
            <p className="text-red-500">Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-3xl flex-[1_1_70%]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <h3>Monthly Growth Rate</h3>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} style={{ width: "100%", height: "210px" }}>
          <BarChart accessibilityLayer data={filteredData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <YAxis
              tickCount={5}
              width={60}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}K`}
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
              content={<CustomTooltip />}
            />
            {barsToRender.map((key) => (
              <Bar
                key={key as string}
                dataKey={key as string}
                fill={(chartConfig as any)[key]?.color || "#000000"}
                radius={4}
              />
            ))}
          </BarChart>
        </ChartContainer>

        {/* Growth Summary Section */}
        {(() => {
          if (filteredData.length <= 1) return null
          
          // Calculate current month once for the entire section
          const currentMonth = getCurrentMonth()
          
          // Find the latest meaningful month data
          const latestMeaningfulData = [...filteredData]
            .reverse()
            .find(item => {
              if (item.month > currentMonth) return false
              if (item.month === currentMonth) return true
              return item.total > 0
            })
          
          if (!latestMeaningfulData) return null
          

          const isCurrentMonth = latestMeaningfulData.month === currentMonth
          
          return (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Latest Growth Trends 
                <span className="text-xs font-normal text-gray-500 ml-1">
                  ({format(new Date(latestMeaningfulData.month + "-01"), "MMM yyyy")}
                  {isCurrentMonth ? " - Live Data" : ""})
                </span>
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {barsToRender.map((key) => {
                  const latestData = latestMeaningfulData
                
                const growthKey = `${key}Growth` as keyof EnhancedMonthlyData
                const growth = (latestData as any)[growthKey] || 0
                const revenue = (latestData as any)[key]
                const config = (chartConfig as any)[key]
                

                
                if (revenue === null || revenue === undefined) return null

                // Check if this is current month data
                const isCurrentMonthData = latestData.month === currentMonth

                const GrowthIcon = growth > 0 ? TrendingUp : growth < 0 ? TrendingDown : Minus
                const growthColor = growth > 0 ? "text-green-600" : growth < 0 ? "text-red-600" : "text-gray-500"
                const bgColor = growth > 0 ? "bg-green-50" : growth < 0 ? "bg-red-50" : "bg-gray-50"

                return (
                  <div key={key as string} className={`p-2 rounded ${bgColor} border`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: config?.color || "#000000" }}
                      />
                      <span className="text-xs font-medium text-gray-600 truncate">
                        {config?.label?.replace("SM Total of Branches", "Total") || key}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-800 font-semibold">
                        ₱{(revenue / 1000).toFixed(1)}K
                        {isCurrentMonthData && revenue === 0 && (
                          <span className="block text-orange-600 font-normal">Updating...</span>
                        )}
                      </span>
                      {(revenue > 0 || !isCurrentMonthData) && (
                        <div className={`flex items-center gap-1 ${growthColor}`}>
                          <GrowthIcon size={10} />
                          <span className="text-xs font-medium">
                            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                            {isCurrentMonthData && <span className="text-orange-600">*</span>}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }).filter(Boolean)}
            </div>
          </div>
          )
        })()}
      </CardContent>
    </Card>
  )
}
