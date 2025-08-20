// src/pages/operations/payment.tsx
"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { SearchBar } from "@/components/ui/searchbar"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import "@/styles/payment.css"

type Shoe = {
  model: string
  services: string[]
  additionals: string[]
  pairs?: number
  rush?: "yes" | "no"
}

// --- Price Config ---
const services = [
  { name: "Basic Cleaning", price: 325 },
  { name: "Minor Reglue", price: 450 },
  { name: "Full Reglue", price: 575 },
]

const addons = [
  { name: "Unyellowing", price: 125 },
  { name: "Minor Retouch", price: 125 },
  { name: "Minor Restoration", price: 225 },
  { name: "Additional Layer", price: 575 },
  { name: "Color Retouch (2 colors)", price: 600 },
  { name: "Color Retouch (3 colors)", price: 700 },
]

const RUSH_FEE = 150

function findServicePrice(serviceName: string) {
  const srv = services.find((s) => s.name === serviceName)
  return srv ? srv.price : 0
}

function findAddonPrice(addonName: string) {
  const add = addons.find((a) => a.name === addonName)
  return add ? add.price : 0
}

function formatCurrency(n: number) {
  return "₱" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function getPaymentStatus(balance: number, totalAmount: number): string {
  if (balance === totalAmount) {
    return "NP" // Not Paid
  } else if (balance > 0 && balance < totalAmount) {
    return "PARTIAL" // Partially Paid
  } else if (balance === 0) {
    return "PAID" // Fully Paid
  }
  return "Unknown"
}

// Dummy table rows
function generateDummyRequests(count: number) {
  const customers = [
    { id: "CUST-0001", name: "Juan Dela Cruz" },
    { id: "CUST-0002", name: "Maria Santos" },
    { id: "CUST-0003", name: "Pedro Reyes" },
    { id: "CUST-0004", name: "Ana Lopez" },
  ]

  const shoeModels = ["Nike Air Force", "Adidas Superstar", "Converse High", "Puma Runner"]
  const serviceOptions = services.map((s) => s.name)

  return Array.from({ length: count }, (_, i) => {
    const cust = customers[Math.floor(Math.random() * customers.length)]
    const pairs = Math.floor(Math.random() * 3) + 1

    const shoes: Shoe[] = Array.from({ length: pairs }, () => ({
      model: shoeModels[Math.floor(Math.random() * shoeModels.length)],
      services: [serviceOptions[Math.floor(Math.random() * serviceOptions.length)]],
      additionals: [],
    }))

    const total = 800 + Math.floor(Math.random() * 500)
    const paid = Math.floor(total * (Math.random() * 0.8)) // paid up to 80%
    const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 100) : null

    return {
      receiptId: `2025-${String(i + 1).padStart(4, "0")}-SMVAL`,
      dateIn: new Date(
        Date.now() - Math.floor(Math.random() * 10000000000)
      ).toLocaleDateString(),
      customerId: cust.id,
      customerName: cust.name,
      total,
      pairs,
      pairsReleased: Math.floor(Math.random() * pairs),
      shoes,
      amountPaid: paid,
      remainingBalance: total - paid,
      discount,
    }
  })
}

export default function Payments() {
  const [dueNow, setDueNow] = useState(0)
  const [customerPaid, setCustomerPaid] = useState(0)
  const [change, setChange] = useState(0)
  const [updatedBalance, setUpdatedBalance] = useState(0)

  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("default") // dateIn, customerName, total
  const [sortOrder, setSortOrder] = useState<"Ascending" | "Descending">("Ascending")

  const dummyRequests = useMemo(() => generateDummyRequests(20), [])
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)

  // Filter + Sort
  const filteredRequests = useMemo(() => {
    let filtered = dummyRequests

    // Search filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.receiptId.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.dateIn.toLowerCase().includes(q)
      )
    }

    // Sort
    if (sortBy !== "default") {
      filtered = [...filtered].sort((a, b) => {
        let valA: any = a[sortBy]
        let valB: any = b[sortBy]

        // For date, parse into Date objects
        if (sortBy === "dateIn") {
          valA = new Date(a.dateIn)
          valB = new Date(b.dateIn)
        }

        if (valA < valB) return sortOrder === "Ascending" ? -1 : 1
        if (valA > valB) return sortOrder === "Ascending" ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [dummyRequests, searchQuery, sortBy, sortOrder])

  const handleCustomerPaid = (value: number) => {
    setCustomerPaid(value)
    if (!selectedRequest) return
    setChange(Math.max(0, value - dueNow))
  }

  const handleDueNow = (value: number) => {
    setDueNow(value)
    if (!selectedRequest) return
    const newTotalPaid = selectedRequest.amountPaid + value
    setUpdatedBalance(Math.max(0, selectedRequest.total - newTotalPaid))
  }

  const handleConfirmPayment = () => {
    if (dueNow <= 0) {
      alert("Please enter an amount due now.")
      return
    }
    if (customerPaid < dueNow) {
      alert("Customer paid is less than due now.")
      return
    }
    console.log("Payment updated:", {
      selectedRequest,
      dueNow,
      customerPaid,
      change,
      updatedBalance,
    })
    alert("Payment updated successfully!")
  }

  return (
    <div className="srm-container">
      {/* Left: Form + Table */}
      <div className="srm-form-container">
        <div className="srm-form">
          <Card>
            <CardContent className="form-card-content">
              <h1>Update Payment</h1>
              <div className="customer-info-grid">
                <div className="customer-info-pair">
                  <div className="w-[70%]">
                    <Label>Search by Receipt ID / Customer Name / Date In</Label>
                    <SearchBar
                      value={searchQuery}
                      onChange={(val) => setSearchQuery(val)}
                    />
                  </div>
                  <div className="w-[20%]">
                    <Label>Sort by</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger id="branch">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">None</SelectItem>
                        <SelectItem value="dateIn">Date In</SelectItem>
                        <SelectItem value="customerName">Customer Name</SelectItem>
                        <SelectItem value="total">Total Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <RadioGroup
                      value={sortOrder}
                      onValueChange={(val) => setSortOrder(val as "Ascending" | "Descending")}
                      className="flex flex-col mt-5"
                    >
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
                </div>
              </div>

              {/* Table */}
              <div className="mt-6 overflow-x-auto payment-table">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt ID</TableHead>
                      <TableHead>Date In</TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead># of Pairs</TableHead>
                      <TableHead># Released</TableHead>
                      <TableHead>Amount Paid</TableHead>
                      <TableHead>Remaining Balance</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((req, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{req.receiptId}</TableCell>
                        <TableCell>{req.dateIn}</TableCell>
                        <TableCell>{req.customerName}</TableCell>
                        <TableCell>{formatCurrency(req.total)}</TableCell>
                        <TableCell>{req.pairs}</TableCell>
                        <TableCell>{req.pairsReleased}</TableCell>
                        <TableCell>{formatCurrency(req.amountPaid)}</TableCell>
                        <TableCell>{formatCurrency(req.remainingBalance)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={selectedRequest?.receiptId === req.receiptId ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(req)
                              setDueNow(0)
                              setCustomerPaid(0)
                              setChange(0)
                              setUpdatedBalance(req.remainingBalance)
                            }}
                          >
                            {selectedRequest?.receiptId === req.receiptId ? "Selected" : "Select"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card className="payment-card">
            <CardContent className="payment-section">
              {selectedRequest ? (
                <div className="payment-summary-section">
                  <div className="summary-grid">
                    <p>Remaining Balance:</p>
                    <p className="text-right pr-3">
                      {formatCurrency(selectedRequest.remainingBalance)}
                    </p>

                    <p>Due Now:</p>
                    <Input
                      className="text-right"
                      type="number"
                      value={dueNow}
                      onChange={(e) => handleDueNow(Number(e.target.value) || 0)}
                    />

                    <p>Customer Paid:</p>
                    <Input
                      className="text-right"
                      type="number"
                      value={customerPaid}
                      onChange={(e) => handleCustomerPaid(Number(e.target.value) || 0)}
                    />

                    <p>Change:</p>
                    <p className="text-right pr-3">{formatCurrency(change)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Select a request to update payment</p>
              )}
            </CardContent>
          </Card>
          
          <hr className="bottom-space" />
        </div>
      </div>

      {/* Right: Request Summary */}
      <div className="srm-summary">
        <Card className="srm-summary-card">
          <CardContent className="srm-summary-content">
            <h1>Request Summary</h1>
            <hr className="section-divider" />
            {selectedRequest ? (
              <div className="srm-summary-body">
                <div className="summary-grid">
                  <p className="bold">Customer ID</p>
                  <p className="text-right">#{selectedRequest.customerId}</p>
                  <p className="bold">Customer Name</p>
                  <p className="text-right">{selectedRequest.customerName}</p>
                </div>

                <div className="summary-date-row">
                  <p className="bold">{selectedRequest.receiptId}</p>
                  <p className="text-right">{selectedRequest.dateIn}</p>
                </div>

                {/* Shoe details */}
                <div className="summary-service-list">
                  {selectedRequest.shoes.map((shoe, i) => (
                    <div className="summary-service-entry mb-5" key={i}>
                      <p className="font-medium">
                        {shoe.model || "Unnamed Shoe"}
                      </p>

                      {shoe.services.map((srv, idx) => (
                        <div key={idx} className="pl-10 flex justify-between">
                          <p>{srv}</p>
                          <p className="text-right">{formatCurrency(findServicePrice(srv))}</p>
                        </div>
                      ))}

                      {shoe.additionals.map((add, idx) => (
                        <div key={idx} className="pl-10 flex justify-between">
                          <p>{add}</p>
                          <p className="text-right">{formatCurrency(findAddonPrice(add))}</p>
                        </div>
                      ))}

                      {shoe.rush === "yes" && (
                        <div className="pl-10 flex justify-between text-red-600">
                          <p>Rush Service</p>
                          <p className="text-right">{formatCurrency(RUSH_FEE)}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="summary-discount-row">
                  <p className="bold">Total Amount</p>
                  <p>{formatCurrency(selectedRequest.total)}</p>
                </div>

                {selectedRequest.discount && (
                  <div className="summary-discount-row">
                    <p className="bold">Discount</p>
                    <p>({formatCurrency(selectedRequest.discount)})</p>
                  </div>
                )}

                <div className="summary-discount-row">
                  <p className="bold">Amount Paid</p>
                  <p>({formatCurrency(selectedRequest.amountPaid)})</p>
                </div>

                <hr className="total" />
                <div className="summary-discount-row">
                  <p className="bold">Balance</p>
                  <p>{formatCurrency(selectedRequest.remainingBalance)}</p>
                </div>

                <div className="summary-discount-row mt-5">
                  <p className="bold">New Amount Paid</p>
                  <p>({formatCurrency(dueNow)})</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Select a request to view summary</p>
            )}

            <hr className="section-divider" />
            {selectedRequest && (
              <div className="summary-footer">
                <div className="summary-balance-row">
                  <h2>Updated Balance:</h2>
                  <h2>{formatCurrency(updatedBalance)}</h2>
                </div>
                <div className="summary-balance-row">
                  <h2>Updated Status:</h2>
                  <h2>{getPaymentStatus(updatedBalance, selectedRequest.total)}</h2>
                </div>
                <Button
                  className="w-full p-8 mt-4 button-lg bg-[#22C55E] hover:bg-[#1E9A50]"
                  onClick={handleConfirmPayment}
                >
                  Confirm Payment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
