"use client"
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Search, X, MoreVertical } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SearchBar } from "@/components/ui/searchbar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import "@/styles/database-view/central-view.css"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type PaymentStatus = "PAID" | "PARTIAL" | "NP"
type Branch = "Valenzuela" | "Makati" | "Quezon City"
type BranchLocation = "Valenzuela City" | "Makati City" | "Quezon City"

type Row = {
  id: string
  dateIn: Date
  receivedBy: string
  dateOut?: Date | null
  customer: string
  pairs: number
  released: number
  branch: Branch
  branchLocation: BranchLocation
  total: number
  amountPaid: number
  remaining: number
  status: PaymentStatus
}

const INITIAL_ROWS: Row[] = [
  {
    id: "2025-0001-VALEN",
    dateIn: new Date("2025-04-01"),
    receivedBy: "staffVALEN @JSantos",
    dateOut: new Date("2025-04-15"),
    customer: "Mark Dela Cruz",
    pairs: 2,
    released: 2,
    branch: "Valenzuela",
    branchLocation: "Valenzuela City",
    total: 500,
    amountPaid: 500,
    remaining: 0,
    status: "PAID",
  },
  {
    id: "2025-0002-VALEN",
    dateIn: new Date("2025-04-05"),
    receivedBy: "staffVALEN @KUy",
    dateOut: new Date("2025-04-20"),
    customer: "Anna Rodriguez",
    pairs: 1,
    released: 1,
    branch: "Valenzuela",
    branchLocation: "Valenzuela City",
    total: 250,
    amountPaid: 250,
    remaining: 0,
    status: "PAID",
  },
  {
    id: "2025-0003-VALEN",
    dateIn: new Date("2025-04-03"),
    receivedBy: "staffVALEN @JSantos",
    dateOut: new Date("2025-04-19"),
    customer: "Carlo Reyes",
    pairs: 3,
    released: 2,
    branch: "Valenzuela",
    branchLocation: "Valenzuela City",
    total: 750,
    amountPaid: 500,
    remaining: 250,
    status: "PARTIAL",
  },
  {
    id: "2025-0004-VALEN",
    dateIn: new Date("2025-03-28"),
    receivedBy: "staffVALEN @JSantos",
    dateOut: new Date("2025-04-10"),
    customer: "Joyce Lim",
    pairs: 1,
    released: 1,
    branch: "Valenzuela",
    branchLocation: "Valenzuela City",
    total: 300,
    amountPaid: 300,
    remaining: 0,
    status: "PAID",
  },
  {
    id: "2025-0005-VALEN",
    dateIn: new Date("2025-04-10"),
    receivedBy: "staffVALEN @JSantos",
    dateOut: new Date("2025-04-21"),
    customer: "Joshua Santos",
    pairs: 2,
    released: 1,
    branch: "Valenzuela",
    branchLocation: "Valenzuela City",
    total: 600,
    amountPaid: 400,
    remaining: 200,
    status: "PARTIAL",
  },
  {
    id: "2025-0006-VALEN",
    dateIn: new Date("2025-04-12"),
    receivedBy: "staffVALEN @KUy",
    dateOut: null,
    customer: "Katrina Bayani",
    pairs: 1,
    released: 0,
    branch: "Valenzuela",
    branchLocation: "Valenzuela City",
    total: 300,
    amountPaid: 0,
    remaining: 300,
    status: "NP",
  },
  {
    id: "2025-0007-VALEN",
    dateIn: new Date("2025-04-08"),
    receivedBy: "staffVALEN @VRamos",
    dateOut: new Date("2025-04-28"),
    customer: "Nathaniel Ramos",
    pairs: 2,
    released: 2,
    branch: "Valenzuela",
    branchLocation: "Valenzuela City",
    total: 550,
    amountPaid: 550,
    remaining: 0,
    status: "PAID",
  },
  {
    id: "2025-0008-VALEN",
    dateIn: new Date("2025-04-15"),
    receivedBy: "staffVALEN @JSantos",
    dateOut: null,
    customer: "Bianca Cruz",
    pairs: 4,
    released: 0,
    branch: "Valenzuela",
    branchLocation: "Valenzuela City",
    total: 980,
    amountPaid: 300,
    remaining: 680,
    status: "PARTIAL",
  },
]

type SortKey =
  | "dateIn"
  | "dateOut"
  | "total"
  | "amountPaid"
  | "remaining"
  | "customer"

export default function CentralView() {
  const [rows] = React.useState<Row[]>(INITIAL_ROWS)

  // Filters
  const [search, setSearch] = React.useState("")
  const [dateIn, setDateIn] = React.useState<Date | undefined>()
  const [dateOut, setDateOut] = React.useState<Date | undefined>()
  const [branch, setBranch] = React.useState<Branch | "">("")
  const [paymentStatus, setPaymentStatus] = React.useState<PaymentStatus | "">(
    ""
  )
  const [branchLocation, setBranchLocation] = React.useState<
    BranchLocation | ""
  >("")
  const [receivedBy, setReceivedBy] = React.useState<string>("")

  const [sortKey, setSortKey] = React.useState<SortKey | "">("")
  const [advanced, setAdvanced] = React.useState<boolean>(false)

  const filtered = React.useMemo(() => {
    let data = [...rows]

    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.receivedBy.toLowerCase().includes(q) ||
          r.branch.toLowerCase().includes(q) ||
          r.branchLocation.toLowerCase().includes(q)
      )
    }
    if (dateIn) data = data.filter((r) => sameDay(r.dateIn, dateIn))
    if (dateOut) data = data.filter((r) => r.dateOut && sameDay(r.dateOut, dateOut))
    if (branch) data = data.filter((r) => r.branch === branch)
    if (paymentStatus) data = data.filter((r) => r.status === paymentStatus)
    if (advanced) {
      if (branchLocation) data = data.filter((r) => r.branchLocation === branchLocation)
      if (receivedBy.trim())
        data = data.filter((r) =>
          r.receivedBy.toLowerCase().includes(receivedBy.toLowerCase())
        )
    }
    if (sortKey) {
      data.sort((a, b) => {
        switch (sortKey) {
          case "customer":
            return a.customer.localeCompare(b.customer)
          case "dateIn":
            return a.dateIn.getTime() - b.dateIn.getTime()
          case "dateOut":
            return (a.dateOut?.getTime() ?? 0) - (b.dateOut?.getTime() ?? 0)
          case "total":
            return a.total - b.total
          case "amountPaid":
            return a.amountPaid - b.amountPaid
          case "remaining":
            return a.remaining - b.remaining
          default:
            return 0
        }
      })
    }
    return data
  }, [
    rows,
    search,
    dateIn,
    dateOut,
    branch,
    paymentStatus,
    branchLocation,
    receivedBy,
    sortKey,
    advanced,
  ])

  const clearSearch = () => setSearch("")
  const clearDates = () => {
    setDateIn(undefined)
    setDateOut(undefined)
  }

  return (
    <div className="cv-wrap">
      <div className="cv-header">
        <h1>Central View</h1>
      </div>


      {/* Search and Sort grid */}
      <div className="search-sort">
        <div className="w-[70%]">
          <Label>Search by Receipt ID/ Customer Name/ Received by/ Branch/ Location</Label>
          <SearchBar value={search} onChange={setSearch}/>
        </div>

        <div className="w-[30%]">
          <Label>Sort by</Label>
          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey | "")}>
            <SelectTrigger className="cv-select">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="dateIn">Date In</SelectItem>
              <SelectItem value="dateOut">Date Out</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="total">Total</SelectItem>
              <SelectItem value="amountPaid">Amount Paid</SelectItem>
              <SelectItem value="remaining">Remaining Balance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      
        <div>
          <RadioGroup className="flex flex-col mt-5">
            <div className="radio-option">
              <RadioGroupItem value="Ascending"/>
              <Label>Ascending</Label>
            </div>
            <div className="radio-option">
              <RadioGroupItem value="Descending"/>
              <Label>Descending</Label>
            </div>
          </RadioGroup>
        </div>

            
        <div className="cv-kebab" aria-hidden>
          <MoreVertical size={50} />
        </div>
      </div>

      {/* Date and Filters grid */}
      <div className="date-filter">

        <div className="cv-date">
          <div className="w-[40%]">
            <Label>Date In</Label>
            <DatePicker date={dateIn} onChange={setDateIn} />
          </div>

          <div className="w-[40%]">
            <Label>Date Out</Label>
            <DatePicker date={dateOut} onChange={setDateOut} />
          </div>

          <div className="w-[20%]">
            <Button variant="outline" onClick={clearDates} className="rounded-full w-full">Clear dates</Button>
          </div> 
        </div>

        <div className="cv-filters">
          <div className="w-[100%]">
            <Label>Branch</Label>
            <Select value={branch} onValueChange={(v) => setBranch(v as Branch | "")}>
              <SelectTrigger className="cv-select">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All</SelectItem>
                <SelectItem value="Valenzuela">Valenzuela</SelectItem>
                <SelectItem value="Makati">Makati</SelectItem>
                <SelectItem value="Quezon City">Quezon City</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[100%]">
            <Label>Payment Status</Label>
            <Select
              value={paymentStatus}
              onValueChange={(v) => setPaymentStatus(v as PaymentStatus | "")}
            >
              <SelectTrigger className="cv-select">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All</SelectItem>
                <SelectItem value="PAID">PAID</SelectItem>
                <SelectItem value="PARTIAL">PARTIAL</SelectItem>
                <SelectItem value="NP">NP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          

          <div className="cv-filter cv-advanced-toggle">
            <div className="cv-advanced">
              <Checkbox
                id="advanced"
                checked={advanced}
                onCheckedChange={(v) => setAdvanced(!!v)}
              />
              <Label htmlFor="advanced" className="cv-advanced-label">
                Advanced Filters
              </Label>
            </div>
          </div>

          {advanced && (
            <>
              <div className="w-[100%]">
                <Label>Branch Location</Label>
                <Select
                  value={branchLocation}
                  onValueChange={(v) => setBranchLocation(v as BranchLocation | "")}
                >
                  <SelectTrigger className="cv-select">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All</SelectItem>
                    <SelectItem value="Valenzuela City">Valenzuela City</SelectItem>
                    <SelectItem value="Makati City">Makati City</SelectItem>
                    <SelectItem value="Quezon City">Quezon City</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[100%]">
                <Label>Received by</Label>
                <Select
                  value={receivedBy}
                  onValueChange={(v) => setReceivedBy(v)}
                >
                  <SelectTrigger className="cv-select">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All</SelectItem>
                    <SelectItem value="JSantos">@JSantos</SelectItem>
                    <SelectItem value="KUy">@KUy</SelectItem>
                    <SelectItem value="VRamos">@VRamos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table */}
        <Table className="mt-5">
          <TableHeader className="cv-thead">
            <TableRow className="cv-head-row">
              <TableHead>Receipt ID</TableHead>
              <TableHead>Date In</TableHead>
              <TableHead>Received by</TableHead>
              <TableHead>Date Out</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead># of Pairs</TableHead>
              <TableHead># of Rlsd</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Branch Location</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Amount Paid</TableHead>
              <TableHead>Remaining Balance</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead className="cv-action-col">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id} className="cv-row">
                <TableCell className="cv-id">{r.id}</TableCell>
                <TableCell>{format(r.dateIn, "yyyy-MM-dd")}</TableCell>
                <TableCell className="cv-received">{r.receivedBy}</TableCell>
                <TableCell>
                  {r.dateOut ? format(r.dateOut, "yyyy-MM-dd") : "—"}
                </TableCell>
                <TableCell>{r.customer}</TableCell>
                <TableCell className="cv-num">{r.pairs}</TableCell>
                <TableCell className="cv-num">{r.released}</TableCell>
                <TableCell>{r.branch}</TableCell>
                <TableCell>{r.branchLocation}</TableCell>
                <TableCell className="cv-num">{r.total}</TableCell>
                <TableCell className="cv-num">{r.amountPaid}</TableCell>
                <TableCell className="cv-num">{r.remaining}</TableCell>
                <TableCell className={`cv-status cv-status-${r.status.toLowerCase()}`}>
                  {r.status}
                </TableCell>
                <TableCell className="cv-action">
                  <Button className="cv-edit-btn">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  )
}

/* ----------------------------- helpers ----------------------------- */

function sameDay(a?: Date | null, b?: Date | null) {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function DatePicker({
  date,
  onChange,
}: {
  date?: Date
  onChange: (d?: Date) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="selected" className="cv-date-btn rounded-full">
          <CalendarIcon className="cv-date-icon" size={16} />
          {date ? format(date, "yyyy-MM-dd") : "Select a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
