"use client"
import * as React from "react"
import { MoreVertical } from "lucide-react"
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

/* ----------------------------- dummy data ----------------------------- */
const INITIAL_ROWS: Row[] = [
  {
    id: "2025-0001-VALEN",
    customer: "Mark Dela Cruz",
    customerBirthday: "1990-05-20",
    address: "123 Mabini St, Manila",
    email: "mark.delacruz@example.com",
    contact: "09171234567",

    branch: "Valenzuela",
    branchLocation: "Valenzuela City",
    receivedBy: "staffVALEN @JSantos",
    dateIn: new Date("2025-04-01"),
    dateOut: new Date("2025-04-15"),

    status: "PAID",
    total: 500,
    amountPaid: 500,
    remaining: 0,

    pairs: 2,
    released: 2,

    transactions: [
      {
        id: "0001-VALEN-001",
        shoeModel: "Nike Air Force 1",
        serviceNeeded: ["Basic Cleaning"],
        additional: ["Unyellowing"],
        rush: false,
        status: "In Process",
        statusDates: {
          queued: "2025-04-01",
          readyForDelivery: "2025-04-02",
          toWarehouse: "2025-04-02",
          inProcess: "2025-04-03",
          returnToBranch: null,
          received: null,
          readyForPickup: null,
          pickedUp: null,
        },
        beforeImage: "/images/af1_before.jpg",
        afterImage: "/images/af1_after.jpg",
      },
      {
        id: "0001-VALEN-002",
        shoeModel: "Nike Air Force 1",
        serviceNeeded: ["Basic Cleaning"],
        additional: ["Unyellowing"],
        rush: false,
        status: "In Process",
        statusDates: {
          queued: "2025-04-01",
          readyForDelivery: "2025-04-02",
          toWarehouse: "2025-04-02",
          inProcess: "2025-04-03",
          returnToBranch: null,
          received: null,
          readyForPickup: null,
          pickedUp: null,
        },
        beforeImage: "/images/af1_before.jpg",
        afterImage: "/images/af1_after.jpg",
      },
    ],
  },
  {
    id: "2025-0002-VALEN",
    customer: "Anna Rodriguez",
    customerBirthday: "1990-01-20",
    address: "Guadalupe Nuevo, Makati City",
    email: "anna@yahoo.com",
    contact: "09452368451",

    branch: "Valenzuela",
    branchLocation: "Valenzuela City",
    receivedBy: "staffVALEN @KUy",
    dateIn: new Date("2025-04-05"),
    dateOut: new Date("2025-04-20"),

    status: "PAID",
    total: 250,
    amountPaid: 250,
    remaining: 0,

    pairs: 1,
    released: 1,

    transactions: [
      {
        id: "0002-VALEN-001",
        shoeModel: "Adidas UltraBoost",
        serviceNeeded: ["Basic Cleaning"],
        additional: [],
        rush: true,
        status: "In Process",
        statusDates: {
          queued: "2025-04-05",
          readyForDelivery: "2025-04-05",
          toWarehouse: "2025-04-05",
          inProcess: "2025-04-05",
          returnToBranch: null,
          received: null,
          readyForPickup: null,
          pickedUp: null,
        },
        beforeImage: null,
        afterImage: null,
      },
    ],
  },
  {
    id: "2025-0003-VALEN",
    customer: "Carlo Reyes",
    customerBirthday: "1985-07-15",
    address: "Caloocan City",
    email: "carlo.reyes@example.com",
    contact: "09281234567",

    branch: "Valenzuela",
    branchLocation: "Valenzuela City",
    receivedBy: "staffVALEN @JSantos",
    dateIn: new Date("2025-04-03"),
    dateOut: new Date("2025-04-19"),

    status: "PARTIAL",
    total: 750,
    amountPaid: 500,
    remaining: 250,

    pairs: 3,
    released: 2,

    transactions: [
      {
        id: "0003-VALEN-001",
        shoeModel: "Converse Chuck Taylor",
        serviceNeeded: ["Minor Reglue"],
        additional: ["Minor Retouch"],
        rush: false,
        status: "Queued",
        statusDates: {
          queued: "2025-04-10",
          readyForDelivery: null,
          toWarehouse: null,
          inProcess: null,
          returnToBranch: null,
          received: null,
          readyForPickup: null,
          pickedUp: null,
        },
        beforeImage: null,
        afterImage: null,
      },
    ],
  },
]

/* ----------------------------- component ----------------------------- */
type SortKey =
  | "dateIn"
  | "dateOut"
  | "total"
  | "amountPaid"
  | "remaining"
  | "customer"

export default function CentralView() {
  const [rows] = React.useState<Row[]>(INITIAL_ROWS)

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
        clearDates={() => { setDateIn(undefined); setDateOut(undefined) }}
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
