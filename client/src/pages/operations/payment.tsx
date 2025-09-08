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
  SelectItem,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import "@/styles/payment.css"
import { PaymentsTable } from "@/components/operations/PaymentsTable"
import { Checkbox } from "@/components/ui/checkbox"

type Shoe = {
  model: string
  services: string[]
  additionals: string[]
  pairs?: number
  rush?: "yes" | "no"
}

type Request = {
  receiptId: string
  dateIn: string
  customerId: string
  customerName: string
  total: number
  pairs: number
  pairsReleased: number
  shoes: Shoe[]
  amountPaid: number
  remainingBalance: number
  discount: number | null
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
  if (balance === totalAmount) return "NP"
  else if (balance > 0 && balance < totalAmount) return "PARTIAL"
  else if (balance === 0) return "PAID"
  return "Unknown"
}

// --- Helper: calculate total ---
function calculateTotal(shoes: Shoe[], discount: number | null): number {
  let total = 0

  shoes.forEach((shoe) => {
    const serviceTotal = shoe.services.reduce(
      (sum, srv) => sum + findServicePrice(srv),
      0
    )
    const addonTotal = shoe.additionals.reduce(
      (sum, add) => sum + findAddonPrice(add),
      0
    )
    const rushFee = shoe.rush === "yes" ? RUSH_FEE : 0

    total += serviceTotal + addonTotal + rushFee
  })

  if (discount) total -= discount
  return Math.max(total, 0)
}

// --- Dummy Data ---
function generateDummyRequests(count: number): Request[] {
  const customers = [
    { id: "CUST-0001", name: "Juan Dela Cruz" },
    { id: "CUST-0002", name: "Maria Santos" },
    { id: "CUST-0003", name: "Pedro Reyes" },
    { id: "CUST-0004", name: "Ana Lopez" },
  ]

  const shoeModels = ["Nike Air Force", "Adidas Superstar", "Converse High", "Puma Runner"]
  const serviceOptions = services.map((s) => s.name)
  const addonOptions = addons.map((a) => a.name)

  return Array.from({ length: count }, (_, i) => {
    const cust = customers[Math.floor(Math.random() * customers.length)]
    const pairs = Math.floor(Math.random() * 3) + 1

    const shoes: Shoe[] = Array.from({ length: pairs }, () => ({
      model: shoeModels[Math.floor(Math.random() * shoeModels.length)],
      services: [serviceOptions[Math.floor(Math.random() * serviceOptions.length)]],
      additionals:
        Math.random() > 0.5
          ? [addonOptions[Math.floor(Math.random() * addonOptions.length)]]
          : [],
      rush: Math.random() > 0.7 ? "yes" : "no",
    }))

    const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 100) : null
    const total = calculateTotal(shoes, discount)
    const paid = Math.floor(total * (Math.random() * 0.8))

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
  const [sortBy, setSortBy] = useState<"default" | keyof Request>("default")
  const [sortOrder, setSortOrder] = useState<"Ascending" | "Descending">("Ascending")
  const [modeOfPayment, setModeOfPayment] = useState<'cash' | 'gcash' | 'bank' | 'other'>('cash')
  const [paymentOnly, setPaymentOnly] = useState(false)

  const dummyRequests = useMemo(() => generateDummyRequests(20), [])
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)

  // Filter + Sort
  const filteredRequests = useMemo(() => {
    let filtered = dummyRequests

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.receiptId.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.dateIn.toLowerCase().includes(q)
      )
    }

    if (sortBy !== "default") {
      filtered = [...filtered].sort((a, b) => {
        let valA: unknown = a[sortBy]
        let valB: unknown = b[sortBy]

        if (sortBy === "dateIn") {
          valA = new Date(a.dateIn)
          valB = new Date(b.dateIn)
        }

        if (sortBy === "total") {
          valA = a.total
          valB = b.total
        }

        if (valA instanceof Date && valB instanceof Date) {
          if (valA < valB) return sortOrder === "Ascending" ? -1 : 1
          if (valA > valB) return sortOrder === "Ascending" ? 1 : -1
          return 0
        }

        if (typeof valA === "number" && typeof valB === "number") {
          if (valA < valB) return sortOrder === "Ascending" ? -1 : 1
          if (valA > valB) return sortOrder === "Ascending" ? 1 : -1
          return 0
        }

        if (typeof valA === "string" && typeof valB === "string") {
          return sortOrder === "Ascending"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA)
        }

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

  const handleSavePaymentOnly = () => {
    if (dueNow <= 0) {
      alert("Please enter an amount due now.")
      return
    }
    if (customerPaid < dueNow) {
      alert("Customer paid is less than due now.")
      return
    }
    console.log("Payment only saved:", {
      selectedRequest,
      dueNow,
      customerPaid,
      change,
      updatedBalance,
      modeOfPayment,
    })
    alert("Payment saved successfully!")
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
    console.log("Payment updated & picked up:", {
      selectedRequest,
      dueNow,
      customerPaid,
      change,
      updatedBalance,
      modeOfPayment,
    })
    alert("Payment updated & marked as picked up!")
  }


  return (
    <div className="payment-container">
      {/* Left: Form + Table */}
      <div className="payment-form-container">
        <div className="payment-form">
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
                    <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
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
                      onValueChange={(val) =>
                        setSortOrder(val as "Ascending" | "Descending")
                      }
                      className="flex flex-col mt-5"
                    >
                      <div className="radio-option">
                        <RadioGroupItem value="Ascending" />
                        <Label>Ascending</Label>
                      </div>
                      <div className="radio-option">
                        <RadioGroupItem value="Descending" />
                        <Label>Descending</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="mt-6 overflow-x-auto payment-table">
                     <PaymentsTable
                      requests={filteredRequests}
                      selectedRequest={selectedRequest}
                      onSelect={setSelectedRequest}
                      findServicePrice={findServicePrice}
                      findAddonPrice={findAddonPrice}
                      formatCurrency={formatCurrency}
                      RUSH_FEE={RUSH_FEE}
                    />
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card className="payment-card">
            <CardContent className="payment-section">
              {selectedRequest ? (
                <div className="payment-update-section">
                  <div className="w-[40%]">
                    <div className="flex flex-col gap-5">
                      <p>Mode of Payment</p>
                      <RadioGroup
                        value={modeOfPayment}
                        onValueChange={(val) => setModeOfPayment(val as 'cash' | 'gcash' | 'bank' | 'other')}
                        className="pl-10"
                      >
                        <div className="radio-option">
                          <RadioGroupItem value="cash" id="cash" />
                          <Label htmlFor="cash">Cash</Label>
                        </div>
                        <div className="radio-option">
                          <RadioGroupItem value="gcash" id="gcash" />
                          <Label htmlFor="gcash">GCash</Label>
                        </div>
                        <div className="radio-option">
                          <RadioGroupItem value="bank" id="bank" />
                          <Label htmlFor="bank">Bank</Label>
                        </div>
                        <div className="radio-option">
                          <RadioGroupItem value="other" id="other" />
                          <Label htmlFor="other">Other</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="payment-grid w-[60%]">
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
      <div className="payment-summary">
        <Card className="payment-summary-card">
          <CardContent className="payment-summary-content">
            <h1>Request Summary</h1>
            <hr className="section-divider" />
            {selectedRequest ? (
              <div className="payment-summary-body">
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
                <div className="flex items-center justify-center gap-2 mt-4 w-fullrounded">
                  <Checkbox
                    id="payment-only"
                    checked={paymentOnly}
                    onCheckedChange={(checked) => setPaymentOnly(!!checked)}
                  />
                  <Label htmlFor="payment-only">Payment only</Label>
                </div>
                <Button
                  className="w-full p-8 mt-4 button-lg bg-[#22C55E] hover:bg-[#1E9A50]"
                  onClick={() =>
                    paymentOnly ? handleSavePaymentOnly() : handleConfirmPayment()
                  }
                >
                  {paymentOnly ? "Save Payment" : "Save & Mark as Picked Up"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
