import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { format } from "date-fns"
import { Calendar as CalendarIcon, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ChartConfig } from "@/components/ui/chart"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { format as formatDate } from "date-fns"
import { cn } from "@/lib/utils"
import { getDailyRevenue, DailyRevenueItem } from "@/utils/api/getDailyRevenue"

export const description = "A simple area chart"

interface ChartLineLinearProps {
  selectedBranches: string[];
}

const chartConfig = {
  total: { label: "Total of Branches", color: "#CE1616" },
  SMVal: { label: "SM Valenzuela", color: "#22C55E" },
  Val: { label: "Valenzuela", color: "#9747FF" },
  SMGra: { label: "SM Grand", color: "#0D55F1" },
} satisfies ChartConfig

interface DayRevenueData {
  date: string
  totalRevenue: number
  branchBreakdown: {
    SMVal: number
    Val: number
    SMGra: number
  }
  revenueLevel: "low" | "medium" | "high"
}

const getRevenueLevel = (revenue: number, avgRevenue: number): "low" | "medium" | "high" => {
  if (revenue < avgRevenue * 0.7) return "low"
  if (revenue > avgRevenue * 1.3) return "high"
  return "medium"
}

const getRevenueColor = (level: "low" | "medium" | "high") => {
  switch (level) {
    case "low": return "bg-red-100 text-red-800 border-red-200"
    case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "high": return "bg-green-100 text-green-800 border-green-200"
  }
}

export function SalesOverTime({ selectedBranches }: ChartLineLinearProps) {
  const [rawData, setRawData] = useState<DailyRevenueItem[]>([])
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [selectedDayData, setSelectedDayData] = useState<DayRevenueData | null>(null)
  const [avgRevenue, setAvgRevenue] = useState(0)

  // Function to get daily revenue data from API
  const fetchDailyRevenue = async () => {
    try {
      setLoading(true)
      setError("")
      
      const sortedData = await getDailyRevenue()
      setRawData(sortedData)
      
      // Debug: Log some sample data to verify totals
      console.debug("SalesOverTime: Sample data with totals", sortedData.slice(0, 5))
      
      // Set initial date range to show all data
      if (sortedData.length > 0) {
        setStartDate(sortedData[0].date)
        setEndDate(sortedData[sortedData.length - 1].date)
      }
      
    } catch (err) {
      console.error("Error loading revenue data:", err)
      setError(err instanceof Error ? err.message : "Failed to load revenue data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDailyRevenue()
  }, [])



  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  const filteredByDate = rawData.filter(item => {
    return (!startDate || item.date >= startDate) &&
           (!endDate || item.date <= endDate)
  })

  const filteredData = filteredByDate.map(item => {
    const visibleSMVal = selectedBranches.includes("1") || selectedBranches.length === 0 ? item.SMVal : null
    const visibleVal = selectedBranches.includes("2") || selectedBranches.length === 0 ? item.Val : null
    const visibleSMGra = selectedBranches.includes("3") || selectedBranches.length === 0 ? item.SMGra : null
    
    // Show total from API data (not calculated) when total is selected or no branches selected
    const showTotal = selectedBranches.includes("4") || selectedBranches.length === 0
    
    return {
      date: item.date,
      SMVal: visibleSMVal,
      Val: visibleVal,
      SMGra: visibleSMGra,
      total: showTotal ? item.total : null,
    }
  })

  // Debug: Log filtered data to verify totals are present
  console.debug("SalesOverTime: Filtered data sample", filteredData.slice(0, 3))
  console.debug("SalesOverTime: Selected branches", selectedBranches)

  // Helper function to calculate revenue total for selected branches
  const calculateSelectedBranchTotal = (item: DailyRevenueItem): number => {
    let total = 0;
    
    if (selectedBranches.length === 0) {
      // If no branches selected, show overall total
      return item.total || 0;
    }
    
    if (selectedBranches.includes("1") && item.SMVal) {
      total += item.SMVal;
    }
    if (selectedBranches.includes("2") && item.Val) {
      total += item.Val;
    }
    if (selectedBranches.includes("3") && item.SMGra) {
      total += item.SMGra;
    }
    if (selectedBranches.includes("4")) {
      // If "total" branch is selected, add the overall total
      total = item.total || 0;
    }
    
    return total;
  };

  // Helper function to get revenue for analysis (branch-specific for single, combined for multiple/all)
  const getBranchSpecificRevenue = (item: DailyRevenueItem): number => {
    // If no branches selected or "Total of Branches" is selected (type "A"), use API total
    if (selectedBranches.length === 0 || selectedBranches.includes("4")) {
      return item.total || 0;
    }
    
    // For single branch selection, return ONLY that branch's revenue (no totals)
    if (selectedBranches.length === 1) {
      if (selectedBranches.includes("1")) return item.SMVal || 0;
      if (selectedBranches.includes("2")) return item.Val || 0;
      if (selectedBranches.includes("3")) return item.SMGra || 0;
    }
    
    // For multiple specific branches (not including total), sum only those branches
    let total = 0;
    if (selectedBranches.includes("1")) total += item.SMVal || 0;
    if (selectedBranches.includes("2")) total += item.Val || 0;
    if (selectedBranches.includes("3")) total += item.SMGra || 0;
    
    return total;
  };

  // Calculate average revenue whenever rawData or selectedBranches changes
  useEffect(() => {
    if (rawData.length > 0) {
      const validData = rawData.filter(item => {
        const revenueForAnalysis = getBranchSpecificRevenue(item)
        return revenueForAnalysis > 0
      })
      if (validData.length > 0) {
        const totalRevenue = validData.reduce((sum, item) => sum + getBranchSpecificRevenue(item), 0)
        const average = totalRevenue / validData.length
        setAvgRevenue(average)
        console.debug("SalesOverTime: Calculated average for branches", selectedBranches, "=", average, "from", validData.length, "valid days")
      }
    }
  }, [rawData, selectedBranches])

  // Clear selected day data when branches change
  useEffect(() => {
    setSelectedDayData(null)
  }, [selectedBranches])

  const maxTicks = 6

  if (loading) {
    return (
      <Card className="rounded-3xl flex-1">
        <CardHeader className="items-start gap-2 text-sm">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <h2>Sales Over Time</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-sm text-gray-500">Loading revenue data...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="rounded-3xl flex-1">
        <CardHeader className="items-start gap-2 text-sm">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <h2>Sales Over Time</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-sm text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <Card className="rounded-3xl flex-1">
        <CardHeader className="items-start gap-2 text-sm">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <h2>Sales Over Time</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
        <ChartContainer
          config={chartConfig}
          style={{ width: "100%", height: "250px", overflow: "hidden" }}
        >
          <AreaChart
            accessibilityLayer
            data={filteredData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <YAxis
              tickCount={5}
              width={40}
              axisLine={false}
              tickLine={false}
              label={{
                value: "Sales",
                angle: -90,
                position: "insideLeft",
                 dx: -12,
                style: {
                  textAnchor: "middle",
                  fill: "var(--foreground)",
                  fontSize: "14px",
                  fontFamily: "'Inter Regular', sans-serif",
                },
              }}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              tickFormatter={(value, index) => {
                const shouldShow = index % Math.ceil(filteredData.length / maxTicks) === 0
                return shouldShow ? value.slice(5) : ""
              }}
            />
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent indicator="line" />}
            />

            <defs>
              <clipPath id="chartClip">
                <rect width="100%" height="100%" />
              </clipPath>
              <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#CE1616" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#CE1616" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="smValGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="valGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9747FF" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#9747FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="smGrandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0D55F1" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#0D55F1" stopOpacity={0} />
              </linearGradient>
            </defs>

            <Area dataKey="total" type="natural" fill="url(#totalGradient)" stroke="#CE1616" strokeWidth={2} clipPath="url(#chartClip)" />
            <Area dataKey="SMGra" type="natural" fill="url(#smGrandGradient)" stroke="#0D55F1" strokeWidth={2} clipPath="url(#chartClip)" />
            <Area dataKey="Val" type="natural" fill="url(#valGradient)" stroke="#9747FF" strokeWidth={2} clipPath="url(#chartClip)" />
            <Area dataKey="SMVal" type="natural" fill="url(#smValGradient)" stroke="#22C55E" strokeWidth={2} clipPath="url(#chartClip)" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="w-full space-y-4 lg:space-y-0 lg:flex lg:gap-8">
          {/* Date Range Selection */}
          <div className="flex w-full lg:w-1/2 items-center justify-between pl-8 text-sm">
            <h6>Date Range:</h6>
            <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[260px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate && endDate
                  ? `${format(new Date(startDate), "MMM d, yyyy")} - ${format(
                      new Date(endDate),
                      "MMM d, yyyy"
                    )}`
                  : "Pick a date range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 border-b bg-gray-50">
                <h4 className="font-semibold text-sm mb-2">Date Range Selection</h4>
                {startDate && endDate && (
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>From: {format(new Date(startDate), "MMM d, yyyy")}</div>
                    <div>To: {format(new Date(endDate), "MMM d, yyyy")}</div>
                    <div className="font-medium">
                      Total Days: {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}
                    </div>
                    {(() => {
                      const rangeData = rawData.filter(item => item.date >= startDate && item.date <= endDate)
                      const totalRevenue = rangeData.reduce((sum, item) => sum + calculateSelectedBranchTotal(item), 0)
                      return totalRevenue > 0 && (
                        <div className="font-medium text-green-600">
                          Range Total: ₱{(totalRevenue / 1000).toFixed(1)}K
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
              <Calendar
                mode="range"
                selected={{
                  from: startDate ? new Date(startDate) : undefined,
                  to: endDate ? new Date(endDate) : undefined,
                }}
                onSelect={(range) => {
                  setStartDate(range?.from ? formatDate(range.from, "yyyy-MM-dd") : "")
                  setEndDate(range?.to ? formatDate(range.to, "yyyy-MM-dd") : "")
                }}
                numberOfMonths={1}
                fixedWeeks
                className="[--cell-size:1.8rem] p-2"
                disabled={(date) => {
                  const dateStr = formatDate(date, "yyyy-MM-dd")
                  return !rawData.some((d) => d.date === dateStr)
                }}
                components={{
                  DayButton: ({ day, modifiers, className, ...props }) => {
                    const date = "date" in day ? day.date : day
                    const formatted = formatDate(date, "yyyy-MM-dd")

                    const isStart = startDate && formatted === startDate
                    const isEnd = endDate && formatted === endDate
                    const inRange =
                      startDate && endDate && formatted > startDate && formatted < endDate

                    const isOutside = modifiers.outside || day.outside

                    // Find revenue data for this date
                    const revenueData = rawData.find((d) => d.date === formatted)
                    const totalRevenue = revenueData ? calculateSelectedBranchTotal(revenueData) : 0

                    return (
                      <button
                        className={cn(
                          "h-full w-full text-xs p-1 flex flex-col items-center justify-center rounded relative min-h-[2.5rem]",
                          className,
                          isOutside ? "opacity-70" : "opacity-100",
                          isStart || isEnd
                            ? "bg-[#CE1616] text-white" // start/end
                            : inRange
                            ? "bg-red-200 text-black" // in-between range
                            : "bg-white text-black"
                        )}
                        {...props}
                      >
                        <span className="font-medium">{date.getDate()}</span>
                        {totalRevenue && !isOutside && (
                          <span className={cn(
                            "text-xs leading-tight",
                            isStart || isEnd ? "text-white" : "text-gray-600"
                          )}>
                            ₱{(totalRevenue / 1000).toFixed(0)}K
                          </span>
                        )}
                      </button>
                    )
                  },
                }}
              />
            </PopoverContent>
          </Popover>
          </div>
          
          {/* Day Selection for Details */}
          <div className="flex w-full lg:w-1/2 items-center justify-between pl-8 text-sm">
            <h6>Select Day for Details:</h6>
            <select
              className="w-[260px] px-3 py-2 border rounded-md text-sm"
              onChange={(e) => {
                const selectedDate = e.target.value
                if (selectedDate) {
                  const dayData = rawData.find(item => item.date === selectedDate)
                  if (dayData) {
                    // Use branch-specific revenue for analysis
                    const revenueForComparison = getBranchSpecificRevenue(dayData)
                    
                    const dayDetails: DayRevenueData = {
                      date: dayData.date,
                      totalRevenue: revenueForComparison,
                      branchBreakdown: {
                        SMVal: dayData.SMVal || 0,
                        Val: dayData.Val || 0,
                        SMGra: dayData.SMGra || 0,
                      },
                      revenueLevel: getRevenueLevel(revenueForComparison, avgRevenue),
                    }
                    setSelectedDayData(dayDetails)
                  }
                } else {
                  setSelectedDayData(null)
                }
              }}
              value={selectedDayData?.date || ""}
            >
              <option value="">Choose a date...</option>
              {filteredByDate
                .filter(item => {
                  const revenueForAnalysis = getBranchSpecificRevenue(item)
                  return revenueForAnalysis > 0
                })
                .map(item => {
                  const revenueForAnalysis = getBranchSpecificRevenue(item)
                  return (
                    <option key={item.date} value={item.date}>
                      {format(new Date(item.date), "MMM dd, yyyy")} - {formatCurrency(revenueForAnalysis)}
                    </option>
                  )
                })
              }
            </select>
          </div>
        </div>
      </CardFooter>
    </Card>

    {/* Day Details Panel */}
    {selectedDayData ? (
      <Card className="rounded-3xl w-full lg:w-80 lg:flex-shrink-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            {format(new Date(selectedDayData.date), "EEEE, MMMM d, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total/Branch Revenue */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-medium">
              {(selectedBranches.length === 0 || selectedBranches.includes("4")) 
                ? "Total Revenue" 
                : "Branch Revenue"
              }
            </span>
            <span className="text-lg font-bold">
              {formatCurrency(selectedDayData.totalRevenue)}
            </span>
          </div>

          {/* Revenue Level */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Performance</span>
            <Badge className={getRevenueColor(selectedDayData.revenueLevel)}>
              {selectedDayData.revenueLevel.charAt(0).toUpperCase() + selectedDayData.revenueLevel.slice(1)}
            </Badge>
          </div>

          {/* Branch Breakdown */}
          {(selectedBranches.length === 0 || selectedBranches.includes("4")) ? (
            // Show all branches when "All" is selected
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Branch Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm">SM Valenzuela</span>
                  <span className="font-medium">{formatCurrency(selectedDayData.branchBreakdown.SMVal)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                  <span className="text-sm">Valenzuela</span>
                  <span className="font-medium">{formatCurrency(selectedDayData.branchBreakdown.Val)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm">SM Grand</span>
                  <span className="font-medium">{formatCurrency(selectedDayData.branchBreakdown.SMGra)}</span>
                </div>
              </div>
            </div>
          ) : (
            // Show only selected branch when specific branch is selected
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Branch Performance</h4>
              <div className="grid gap-3">
                {selectedBranches.includes("1") && (
                  <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="font-medium text-sm mb-1">SM Valenzuela</div>
                    <div className="text-lg font-bold text-green-700">
                      {formatCurrency(selectedDayData.branchBreakdown.SMVal)}
                    </div>
                  </div>
                )}
                {selectedBranches.includes("2") && (
                  <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <div className="font-medium text-sm mb-1">Valenzuela</div>
                    <div className="text-lg font-bold text-purple-700">
                      {formatCurrency(selectedDayData.branchBreakdown.Val)}
                    </div>
                  </div>
                )}
                {selectedBranches.includes("3") && (
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="font-medium text-sm mb-1">SM Grand</div>
                    <div className="text-lg font-bold text-blue-700">
                      {formatCurrency(selectedDayData.branchBreakdown.SMGra)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comparison to Average */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {(selectedBranches.length === 0 || selectedBranches.includes("4")) 
                ? "vs Daily Average" 
                : "vs Branch Average"
              }
            </span>
            <span className={`font-medium ${
              selectedDayData.totalRevenue > avgRevenue ? "text-green-600" : "text-red-600"
            }`}>
              {selectedDayData.totalRevenue > avgRevenue ? "+" : ""}
              {((selectedDayData.totalRevenue - avgRevenue) / avgRevenue * 100).toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>
    ) : (
      <Card className="rounded-3xl w-full lg:w-80 lg:flex-shrink-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Day Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-center">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">📊 Select a date from the dropdown</p>
              <p>to view detailed performance breakdown</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
  )
}
