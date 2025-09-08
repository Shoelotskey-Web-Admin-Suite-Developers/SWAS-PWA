import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
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

export function SalesOverTime({ selectedBranches }: ChartLineLinearProps) {
  const [rawData, setRawData] = useState<any[]>([])
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  useEffect(() => {
    fetch("/dummy-data/sales_over_time.json")
      .then((res) => res.json())
      .then((data) => {
        setRawData(data)
        if (data.length > 0) {
          setStartDate(data[0].date)
          setEndDate(data[data.length - 1].date)
        }
      })
      .catch((err) => console.error("Error loading revenue data:", err))
  }, [])

  const filteredByDate = rawData.filter(item => {
    return (!startDate || item.date >= startDate) &&
           (!endDate || item.date <= endDate)
  })

  const filteredData = filteredByDate.map(item => ({
    date: item.date,
    SMVal: selectedBranches.includes("1") || selectedBranches.length === 0 ? item.SMVal : null,
    Val: selectedBranches.includes("2") || selectedBranches.length === 0 ? item.Val : null,
    SMGra: selectedBranches.includes("3") || selectedBranches.length === 0 ? item.SMGra : null,
    total: selectedBranches.includes("4") || selectedBranches.length === 0 ? item.total : null,
  }))

  const maxTicks = 6

  return (
    <Card className="rounded-3xl">
      <CardHeader className="items-start gap-2 text-sm">
        <CardTitle><h2>Sales Over Time</h2></CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          style={{ width: "100%", height: "200px" }}
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
              <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#CE1616" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#CE1616" stopOpacity={0} />
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

            <Area dataKey="total" type="natural" fill="url(#totalGradient)" stroke="#CE1616" strokeWidth={2} />
            <Area dataKey="SMVal" type="natural" fill="url(#smValGradient)" stroke="#22C55E" strokeWidth={2} />
            <Area dataKey="Val" type="natural" fill="url(#valGradient)" stroke="#9747FF" strokeWidth={2} />
            <Area dataKey="SMGra" type="natural" fill="url(#smGrandGradient)" stroke="#0D55F1" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center justify-between pl-8 text-sm">
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
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardFooter>
    </Card>
  )
}
