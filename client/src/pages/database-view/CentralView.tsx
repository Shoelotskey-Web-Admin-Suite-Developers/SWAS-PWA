"use client"
import * as React from "react"
import { MoreVertical } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getTransactions } from "@/utils/api/getTransactions"
import { exportRecordsToCSV } from "@/utils/exportToCSV"

/* ----------------------------- types ----------------------------- */
export type PaymentStatus = "PAID" | "PARTIAL" | "NP"
export type Branch = "SM Valenzuela" | "Valenzuela" | "SM Grand"
export type BranchLocation = "Valenzuela City" | "Caloocan City"

export type Transaction = {
  id: string
  shoeModel: string
  serviceNeeded: string[]
  additional: string[]
  rush: boolean
  status: string
  statusDates: {
    queued: string | null
    readyForDelivery: string | null
    toWarehouse: string | null
    inProcess: string | null
    returnToBranch: string | null
    received: string | null
    readyForPickup: string | null
    pickedUp: string | null
  }
  beforeImage?: string | null
  afterImage?: string | null
}

export type Row = {
  id: string // receiptId
  customerId: string // Added to match ReceiptRow
  customer: string
  customerBirthday?: string
  address?: string
  email?: string
  contact?: string

  branch: Branch
  branchLocation: BranchLocation
  receivedBy: string
  dateIn: Date
  dateOut?: Date | null

  status: PaymentStatus
  total: number
  amountPaid: number
  remaining: number

  pairs: number
  released: number
  transactions: Transaction[]
}

/* ----------------------------- component ----------------------------- */
type SortKey =
  | "dateIn"
  | "dateOut"
  | "total"
  | "amountPaid"
  | "remaining"
  | "customer"

export default function CentralView() {
  const [rows, setRows] = React.useState<Row[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // filters
  const [search, setSearch] = React.useState("")
  const [dateIn, setDateIn] = React.useState<Date | undefined>()
  const [dateOut, setDateOut] = React.useState<Date | undefined>()
  const [branch, setBranch] = React.useState<Branch | "">("")
  const [paymentStatus, setPaymentStatus] = React.useState<PaymentStatus | "">("")
  const [branchLocation, setBranchLocation] = React.useState<BranchLocation | "">("")
  const [receivedBy, setReceivedBy] = React.useState<string>("")

  const [sortKey, setSortKey] = React.useState<SortKey | "">("")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")
  const [advanced, setAdvanced] = React.useState<boolean>(false)

  React.useEffect(() => {
    setLoading(true)
    getTransactions()
      .then((data) => {
        // Map backend transactions to Row[]
        const mapped: Row[] = data.map((tx: any) => {
          const legend = BRANCH_LEGEND[tx.branch_id] || { branch: tx.branch_id, location: "" }
          return {
            id: tx.transaction_id,
            customerId: tx.cust_id,  // Store the raw customer ID
            customer: tx.cust_id,    // Will be replaced with name once fetched
            customerBirthday: undefined,
            address: undefined,
            email: undefined,
            contact: undefined,

            branch: legend.branch,
            branchLocation: legend.location,
            receivedBy: tx.received_by,
            dateIn: new Date(tx.date_in),
            dateOut: tx.date_out ? new Date(tx.date_out) : null,

            status: tx.payment_status,
            total: tx.total_amount,
            amountPaid: tx.amount_paid,
            remaining: (tx.total_amount || 0) - (tx.amount_paid || 0),

            pairs: tx.no_pairs,
            released: tx.no_released,

            transactions: [],
          }
        })
        setRows(mapped)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch transactions")
        setLoading(false)
      })
  }, [])

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

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="cv-wrap">
      <div className="cv-header">
        <h1>Central View</h1>
      </div>

      {/* Search and Sort grid */}
      <div className="search-sort">
        <div className="w-[70%] width-full-767">
          <Label>Search by Receipt ID/ Customer Name/ Received by/ Branch/ Location</Label>
          <SearchBar value={search} onChange={setSearch} />
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
                <RadioGroupItem value="asc" id="asc" />
                <Label htmlFor="asc">Ascending</Label>
              </div>
              <div className="radio-option">
                <RadioGroupItem value="desc" id="desc" />
                <Label htmlFor="desc">Descending</Label>
              </div>
            </RadioGroup>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-10 w-10 p-0 flex items-center justify-center"
                variant="unselected"
                aria-label="Options"
              >
                <MoreVertical size={80} className="!w-10 !h-10" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => exportRecordsToCSV(filtered)}>
                Export Records
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => exportRecordsToCSV(filtered)}
              >
                Archive Records
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Date, Filters and Advanced grid */}
      <Filters
        dateIn={dateIn}
        setDateIn={setDateIn}
        dateOut={dateOut}
        setDateOut={setDateOut}
        clearDates={() => {
          setDateIn(undefined)
          setDateOut(undefined)
        }}
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

/* ----------------------------- constants ----------------------------- */
const BRANCH_LEGEND: Record<
  string,
  { branch: string; location: string }
> = {
  "VAL-B-NCR": { branch: "Valenzuela Branch", location: "Valenzuela" },
  "SMVAL-B-NCR": { branch: "SM Valenzuela Branch", location: "Valenzuela" },
  "SMGRA-B-NCR": { branch: "SM Grand Branch", location: "Caloocan" },
  "SWAS-SUPERADMIN": { branch: "Super Admin", location: "N/A" },
  "HUBV-W-NCR": { branch: "Valenzuela Hub", location: "Valenzuela City" },
}
