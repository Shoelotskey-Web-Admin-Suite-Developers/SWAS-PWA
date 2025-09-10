import '@/styles/analytics.css'
import { DailyRevenueTrend } from "@/components/analytics/charts/DailyRev"
import { SalesOverTime } from "@/components/analytics/charts/SalesOv"
import { MonthlyGrowthRate } from '@/components/analytics/charts/MonthlyGrowth'
import { TopServices } from '@/components/analytics/charts/TopServices'
import { SalesBreakdown } from '@/components/analytics/charts/SalesBreak'
import { TopCustomers } from '@/components/analytics/charts/TopCust'
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import Navbar from '@/components/Navbar'
import { useState } from 'react'

// shadcn components
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

const branchOptions = [
  { value: "1", label: "SM Valenzuela" },
  { value: "2", label: "Valenzuela" },
  { value: "3", label: "SM Grand" },
  { value: "4", label: "Total of Branches" },
]

function Analytics() {
  const [branchOpen, setBranchOpen] = useState(false)
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])

  const toggleBranch = (value: string) => {
    setSelectedBranches((prev) => {
      if (value === "4") {
        // If "Total of Branches" is clicked, deselect others
        return prev.includes("4") ? [] : ["4"];
      } else {
        // If any other branch is clicked, remove "Total of Branches"
        const newSelection = prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev.filter((v) => v !== "4"), value];
        return newSelection;
      }
    });
  };

  return (
    <>

      <div className='analyticsContent'>
        <div className='header'>
          <Card className="rounded-3xl flex-1">
            <CardContent>
              <div className='branch-select-card'>
                <h2>Branch Selector</h2>
                
                {/* Multi-select dropdown */}
                <Popover open={branchOpen} onOpenChange={setBranchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={branchOpen}
                      className="w-[200px] justify-between"
                    >
                      {selectedBranches.length > 0
                        ? `${selectedBranches.length} selected`
                        : "Select branches"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search..." />
                      <CommandEmpty>No branch found.</CommandEmpty>
                      <CommandGroup>
                        {branchOptions.map((branch) => (
                          <CommandItem
                            key={branch.value}
                            onSelect={() => toggleBranch(branch.value)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedBranches.includes(branch.value)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {branch.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>

                <button className='refresh-button'>Refresh</button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl flex-1">
            <CardContent>
              <div className='branches-card'>
                <h2>Branches</h2>
                <ul>
                  <li style={{ '--bullet-color': '#22C55E' } as React.CSSProperties}>SM Valenzuela</li>
                  <li style={{ '--bullet-color': '#9747FF' } as React.CSSProperties}>Valenzuela</li>
                </ul>
                <ul>
                  <li style={{ '--bullet-color': '#0D55F1' } as React.CSSProperties}>SM Grand</li>
                  <li style={{ '--bullet-color': '#CE1616' } as React.CSSProperties}>Total of Branches</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='line-div'>
          <svg width="100%" height="7">
            <line x1="0" y1="5" x2="100%" y2="5" stroke="#797979" strokeWidth="1" />
          </svg>
        </div>

        <div className="upper-part">
          <DailyRevenueTrend selectedBranches={selectedBranches}/>
          <SalesOverTime selectedBranches={selectedBranches}/>
        </div>

        <div className='lower-part'>
          <div className='lower-part-1'>
            <TopServices />
            <SalesBreakdown />
          </div>
          <div className='lower-part-2'>
            <MonthlyGrowthRate selectedBranches={selectedBranches}/>
            <TopCustomers />
          </div>
        </div>

      </div>
    </>
  )
}

export default Analytics