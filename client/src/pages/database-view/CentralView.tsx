"use client"
import * as React from "react"
import { Calendar as CalendarIcon, Search, X, MoreVertical } from "lucide-react"
import { Label } from "@/components/ui/label"
import { SearchBar } from "@/components/ui/searchbar"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import "@/styles/database-view/central-view.css"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Filters } from "@/components/database-view/Filters"
import { CentralTable } from "@/components/database-view/CentralTable"


type PaymentStatus = "PAID" | "PARTIAL" | "NP"
type Branch = "SM Valenzuela" | "Valenzuela" | "SM Grand"
type BranchLocation = "Valenzuela City" | "Caloocan City"

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
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")
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
        let result = 0
        switch (sortKey) {
          case "customer":
            result = a.customer.localeCompare(b.customer)
            break
          case "dateIn":
            result = a.dateIn.getTime() - b.dateIn.getTime()
            break
          case "dateOut":
            result = (a.dateOut?.getTime() ?? 0) - (b.dateOut?.getTime() ?? 0)
            break
          case "total":
            result = a.total - b.total
            break
          case "amountPaid":
            result = a.amountPaid - b.amountPaid
            break
          case "remaining":
            result = a.remaining - b.remaining
            break
          default:
            result = 0
        }
        return sortOrder === "asc" ? result : -result
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
    sortOrder,
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
        <div className="w-[70%] width-full-767">
          <Label>Search by Receipt ID/ Customer Name/ Received by/ Branch/ Location</Label>
          <SearchBar value={search} onChange={setSearch}/>
        </div>

        <div className="sort-kebab w-[30%] width-full-767">
          <div className="w-[100%]">
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
            <RadioGroup
              className="flex flex-col mt-5"
              value={sortOrder}
              onValueChange={(v) => setSortOrder(v as "asc" | "desc")}
            >
              <div className="radio-option">
                <RadioGroupItem value="asc" id="asc"/>
                <Label htmlFor="asc">Ascending</Label>
              </div>
              <div className="radio-option">
                <RadioGroupItem value="desc" id="desc"/>
                <Label htmlFor="desc">Descending</Label>
              </div>
            </RadioGroup>
          </div>

              
          <div className="cv-kebab" aria-hidden>
            <MoreVertical size={50} />
          </div>
        </div>
      </div>

      {/* Date, Filters and Advanced grid */}
      <Filters
        dateIn={dateIn}
        setDateIn={setDateIn}
        dateOut={dateOut}
        setDateOut={setDateOut}
        clearDates={clearDates}
        branch={branch}
        setBranch={setBranch}
        paymentStatus={paymentStatus}
        setPaymentStatus={setPaymentStatus}
        branchLocation={branchLocation}
        setBranchLocation={setBranchLocation}
        receivedBy={receivedBy}
        setReceivedBy={setReceivedBy}
        advanced={advanced}
        setAdvanced={setAdvanced}
      />
      

      <CentralTable rows={filtered} />
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


