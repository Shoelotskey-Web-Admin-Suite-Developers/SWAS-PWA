"use client"
import * as React from "react"
import { Label } from "@/components/ui/label"
import { SearchBar } from "@/components/ui/searchbar"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import "@/styles/database-view/customer-information.css"

import { CustomerTable } from "@/components/database-view/CustomerTable"
import type { CustomerRow as CustomerTableRow } from "@/components/database-view/central-view.types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"

/* ----------------------------- types ----------------------------- */
export type CustomerStatus = "Active" | "Stored"

export type CustomerRow = {
  id: number
  name: string
  birthday: string
  address: string
  email: string
  contact: string
  balance: number
  status: CustomerStatus
  currentServiceCount: number
  totalServices: number
}

/* ----------------------------- dummy data ----------------------------- */
const INITIAL_CUSTOMERS: CustomerRow[] = [
  {
    id: 1,
    name: "John Michael Cruz",
    birthday: "1995-03-21",
    address: "123 Sampaguita St., Manila",
    email: "jmcruz95@gmail.com",
    contact: "09181112233",
    balance: 150,
    status: "Active",
    currentServiceCount: 1,
    totalServices: 3,
  },
  {
    id: 2,
    name: "Angela Dela Peña",
    birthday: "2000-08-15",
    address: "56 Santolan Ave, Quezon City",
    email: "angeladp@gmail.com",
    contact: "09453334444",
    balance: 0,
    status: "Stored",
    currentServiceCount: 0,
    totalServices: 5,
  },
  {
    id: 3,
    name: "Marco Reyes",
    birthday: "1998-12-01",
    address: "87 Mabini St., Caloocan",
    email: "marco.reyes98@yahoo.com",
    contact: "09395556677",
    balance: 600,
    status: "Active",
    currentServiceCount: 2,
    totalServices: 6,
  },
  {
    id: 4,
    name: "Camille Santos",
    birthday: "2002-02-10",
    address: "22 Maginhawa St., Diliman",
    email: "camilles@protonmail.com",
    contact: "09098887766",
    balance: 0,
    status: "Stored",
    currentServiceCount: 1,
    totalServices: 1,
  },
  {
    id: 5,
    name: "Camille Santos",
    birthday: "2002-02-10",
    address: "22 Maginhawa St., Diliman",
    email: "camilles@protonmail.com",
    contact: "09098887766",
    balance: 0,
    status: "Stored",
    currentServiceCount: 1,
    totalServices: 1,
  },
  {
    id: 6,
    name: "Camille Santos",
    birthday: "2002-02-10",
    address: "22 Maginhawa St., Diliman",
    email: "camilles@protonmail.com",
    contact: "09098887766",
    balance: 0,
    status: "Stored",
    currentServiceCount: 1,
    totalServices: 1,
  },
  {
    id: 7,
    name: "Camille Santos",
    birthday: "2002-02-10",
    address: "22 Maginhawa St., Diliman",
    email: "camilles@protonmail.com",
    contact: "09098887766",
    balance: 0,
    status: "Stored",
    currentServiceCount: 1,
    totalServices: 1,
  },
  {
    id: 8,
    name: "Camille Santos",
    birthday: "2002-02-10",
    address: "22 Maginhawa St., Diliman",
    email: "camilles@protonmail.com",
    contact: "09098887766",
    balance: 0,
    status: "Stored",
    currentServiceCount: 1,
    totalServices: 1,
  },
]

/* ----------------------------- component ----------------------------- */
type SortKey = "name" | "birthday" | "balance" | "totalServices"

export default function CustomerInformation() {
  const [rows] = React.useState<CustomerRow[]>(INITIAL_CUSTOMERS)

  // filters
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState<CustomerStatus | "">("")
  const [hasBalance, setHasBalance] = React.useState<"yes" | "no" | "">("")
  const [sortKey, setSortKey] = React.useState<SortKey | "">("")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")
  const [showFilters, setShowFilters] = React.useState(false)

  const filtered = React.useMemo(() => {
    let data = [...rows]

    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.contact.includes(q) ||
          r.address.toLowerCase().includes(q) ||
          r.birthday.includes(q)
      )
    }
    if (status) data = data.filter((r) => r.status === status)
    if (hasBalance === "yes") data = data.filter((r) => r.balance > 0)
    if (hasBalance === "no") data = data.filter((r) => r.balance === 0)

    if (sortKey) {
      data.sort((a, b) => {
        let result = 0
        switch (sortKey) {
          case "name":
            result = a.name.localeCompare(b.name)
            break
          case "birthday":
            result = a.birthday.localeCompare(b.birthday)
            break
          case "balance":
            result = a.balance - b.balance
            break
          case "totalServices":
            result = a.totalServices - b.totalServices
            break
          default:
            result = 0
        }
        return sortOrder === "asc" ? result : -result
      })
    }

    return data
  }, [rows, search, status, hasBalance, sortKey, sortOrder])

  // map into simplified CustomerTableRow
  const tableRows: CustomerTableRow[] = filtered.map((c) => ({
    ...c, // keep all fields
  }))

  return (
    <div className="ci-wrap">
      <div className="ci-header">
        <h1>Customer Information</h1>
      </div>

      {/* Search and Sort grid */}
      <div className="search-sort">
        <div className="w-[70%] width-full-767">
          <Label>Search by Name, Birthday, Email, Contact</Label>
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <div className="flex gap-[1rem] w-[30%] width-full-767 items-end">
          <div className="flex flex-col gap-1 w-[100%]">
            <Label className="w-fit">Sort by</Label>
            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey | "")}>
              <SelectTrigger className="ci-select">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="birthday">Birthday</SelectItem>
                <SelectItem value="balance">Balance</SelectItem>
                <SelectItem value="totalServices">Total Services</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <RadioGroup
            className="flex flex-col"
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
              <DropdownMenuItem onClick={() => console.log("Export clicked")}>
                Export Records
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => console.log("Delete clicked")}
              >
                Delete Records
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>


      </div>

      {/* Filters */}
      <div className="filters-wrapper">
        {/* Desktop: always visible */}
        <div className="filters-row hidden-767">
          <div className="w-[20%] width-half-767 width-full-465">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as CustomerStatus | "")}>
              <SelectTrigger className="ci-select">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Stored">Stored</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[20%] width-half-767 width-full-465">
            <Label>Has Balance</Label>
            <Select value={hasBalance} onValueChange={(v) => setHasBalance(v as "yes" | "no" | "")}>
              <SelectTrigger className="ci-select">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile: collapsible under Advanced Filters */}
        <div className="show-767">
          <div className="flex items-center gap-2">
            <input
              id="advanced-filters"
              type="checkbox"
              checked={showFilters}
              onChange={(e) => setShowFilters(e.target.checked)}
            />
            <Label htmlFor="advanced-filters">Advanced Filters</Label>
          </div>

          {showFilters && (
            <div className="filters-row">
              <div className="w-[20%] width-half-767 width-full-465">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as CustomerStatus | "")}>
                  <SelectTrigger className="ci-select">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Stored">Stored</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[20%] width-half-767 width-full-465">
                <Label>Has Balance</Label>
                <Select value={hasBalance} onValueChange={(v) => setHasBalance(v as "yes" | "no" | "")}>
                  <SelectTrigger className="ci-select">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Use CustomerTable instead of manual <table> */}
      <div className="ci-table">
        <CustomerTable rows={tableRows} />
      </div>
    </div>
  )
}
