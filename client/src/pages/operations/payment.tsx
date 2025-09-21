// src/pages/operations/payment.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
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
import { getAllLineItems } from "@/utils/api/getAllLineItems"
import { getTransactionById } from "@/utils/api/getTransactionById"
import { getServices, IService } from "@/utils/api/getServices"
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

// Rush fee constant
const RUSH_FEE = 150

function formatCurrency(n: number) {
  return "₱" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function getPaymentStatus(balance: number, totalAmount: number): string {
  if (balance === totalAmount) return "NP"
  else if (balance > 0 && balance < totalAmount) return "PARTIAL"
  else if (balance === 0) return "PAID"
  return "Unknown"
}

  // --- Helper: calculate total (use only services; additionals treated as services in DB) ---
  function calculateTotal(
    shoes: Shoe[],
    discount: number | null,
    findServicePriceFn: (serviceName: string) => number
  ): number {
    let total = 0

    shoes.forEach((shoe) => {
      const serviceTotal = shoe.services.reduce(
        (sum, srv) => sum + findServicePriceFn(srv),
        0
      )
      const rushFee = shoe.rush === "yes" ? RUSH_FEE : 0

      total += serviceTotal + rushFee
    })

    if (discount) total -= discount
    return Math.max(total, 0)
  }

// --- Dummy Data ---
// (dummy generator removed) real data will be fetched from APIs

export default function Payments() {
  const [dueNow, setDueNow] = useState(0)
  const [customerPaid, setCustomerPaid] = useState(0)
  const [change, setChange] = useState(0)
  const [updatedBalance, setUpdatedBalance] = useState(0)
  const [cashier, setCashier] = useState("")

  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"default" | keyof Request>("default")
  const [sortOrder, setSortOrder] = useState<"Ascending" | "Descending">("Ascending")
  const [modeOfPayment, setModeOfPayment] = useState<'cash' | 'gcash' | 'bank' | 'other'>('cash')
  const [paymentOnly, setPaymentOnly] = useState(false)

  const [servicesList, setServicesList] = useState<IService[]>([])
  const [fetchedRequests, setFetchedRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [selectedLineItemId, setSelectedLineItemId] = useState<string | null>(null)

  // Build lookup maps for service prices (service_id -> price)
  const servicePriceByName = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of servicesList) map.set(s.service_name, s.service_base_price)
    return map
  }, [servicesList])

  // adapt existing findServicePrice/findAddonPrice to consult service list first
  function findServicePriceFromList(serviceName: string) {
    const val = servicePriceByName.get(serviceName)
    // if not found in services list, fall back to 0 (server should provide prices)
    return val ?? 0
  }

  // Fetch services and line items on mount and map to Request[] shape
  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const svc = await getServices()
        if (!mounted) return
        setServicesList(svc)

        // Fetch all relevant line items (backend excludes Picked Up)
        const lineItems = await getAllLineItems()

        // Diagnostic logs to inspect raw line items and transaction ids
        try {
          console.debug("Payments page: raw lineItems count=", Array.isArray(lineItems) ? lineItems.length : 0)
          console.debug("Payments page: currentBranchId=", sessionStorage.getItem("branch_id"))
          console.debug(
            "Payments page: line_item_ids=",
            Array.isArray(lineItems) ? lineItems.map((li: any) => li.line_item_id).slice(0, 20) : []
          )
        } catch (e) {
          /* ignore */
        }

        // For each distinct transaction id in lineItems fetch transaction and map
        const txIds = Array.from(new Set((lineItems || []).map((li: any) => li.transaction_id)))
        console.debug("Payments page: txIds count=", txIds.length, txIds.slice(0, 20))

        const requests: Request[] = []

        for (const txId of txIds) {
          try {
            const txData = await getTransactionById(String(txId))
            const transaction = txData.transaction
            const customer = txData.customer
            const txLineItems = txData.lineItems || []

            // Diagnostic: log raw lineItems for this transaction
            try {
              console.debug('Payments page: txLineItems for', txId, txLineItems.map((li: any) => ({ line_item_id: li.line_item_id, services: li.services })))
            } catch (e) {}

            // Map server line items to local Shoe[] style
            const shoes: Shoe[] = txLineItems.map((li: any) => {
              // li.services is an array of { service_id, quantity }
              const servicesNames: string[] = []
              ;(li.services || []).forEach((s: any) => {
                // try to resolve service_name from services list
                const found = svc.find((x: IService) => x.service_id === s.service_id || x.service_name === s.service_id)
                const name = found ? found.service_name : s.service_id
                const qty = s.quantity || 1
                for (let i = 0; i < qty; i++) servicesNames.push(name)
              })

              // Diagnostic: log mapping per line item (service quantities -> servicesNames)
              try {
                console.debug('Payments page: mapped lineItem', li.line_item_id, { rawServices: li.services, servicesNames })
              } catch (e) {}

              return {
                model: li.shoes || "",
                services: servicesNames,
                additionals: [],
                pairs: 1,
                rush: li.priority === "Rush" ? "yes" : "no",
                lineItemId: li.line_item_id || undefined,
              }
            })

            // Prefer explicit transaction amounts from the server. If missing, fall back to local calculation.
            const totalFromTx =
              transaction.total_amount !== undefined && transaction.total_amount !== null
                ? transaction.total_amount
                : calculateTotal(shoes, transaction.discount_amount ?? null, findServicePriceFromList)
            const amountPaid = transaction.amount_paid ?? 0
            // Balance is defined as total_amount - amount_paid per requirement
            const remaining = Math.max(0, totalFromTx - amountPaid)

            const req: Request = {
              receiptId: transaction.transaction_id,
              dateIn: new Date(transaction.date_in).toLocaleDateString(),
              customerId: customer?.cust_id || transaction.cust_id || "",
              customerName: customer?.cust_name || "",
              // use the explicit transaction total when available
              total: totalFromTx,
              pairs: transaction.no_pairs || shoes.length,
              pairsReleased: transaction.no_released || 0,
              shoes,
              amountPaid: amountPaid,
              // remaining balance = total_amount - amount_paid
              remainingBalance: remaining,
              discount: transaction.discount_amount ?? null,
            }

            requests.push(req)
          } catch (err) {
            console.error("Failed to load transaction", txId, err)
          }
        }

        if (mounted) {
          // Diagnostic log: how many requests and shoes were mapped
          try {
            // keep logs small but useful
            console.debug("Payments page: mapped requests count=", requests.length)
            console.debug(
              "Payments page: shoes per request=",
              requests.map((r) => r.shoes.length)
            )
          } catch (e) {
            /* ignore logging errors */
          }
          setFetchedRequests(requests)
        }
      } catch (err) {
        console.error("Error loading payments data:", err)
      }
      finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // Filter + Sort over fetchedRequests
  const filteredRequests = useMemo(() => {
    let filtered = fetchedRequests

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          // receipt id
          r.receiptId.toLowerCase().includes(q) ||
          // customer name
          r.customerName.toLowerCase().includes(q) ||
          // any shoe model matches
          r.shoes.some((s) => (s.model || "").toLowerCase().includes(q)) ||
          // any shoe lineItemId matches
          r.shoes.some((s) => (s as any).lineItemId && (s as any).lineItemId.toLowerCase().includes(q))
      )
    }

    if (sortBy !== "default") {
      filtered = [...filtered].sort((a, b) => {
        let valA: unknown = a[sortBy]
        let valB: unknown = b[sortBy]

        // Support sorting by receiptId (string) and pairs (number)
        if (sortBy === "dateIn") {
          valA = new Date(a.dateIn)
          valB = new Date(b.dateIn)
        }

        if (sortBy === "total") {
          valA = a.total
          valB = b.total
        }

        if (sortBy === "receiptId") {
          valA = a.receiptId
          valB = b.receiptId
        }

        if (sortBy === "pairs") {
          valA = a.pairs
          valB = b.pairs
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
  }, [fetchedRequests, searchQuery, sortBy, sortOrder])

  const handleCustomerPaid = (value: number) => {
    setCustomerPaid(value)
    if (!selectedRequest) return
    // Validation is enforced at save-time; do not alert while typing
    // Change is customerPaid - dueNow, but never negative
    setChange(Math.max(0, value - dueNow))
  }

  const handleDueNow = (value: number) => {
    // Clamp the due now value to be between 0 and the transaction remaining balance
    const maxDue = selectedRequest ? selectedRequest.remainingBalance : Number.POSITIVE_INFINITY
    const clamped = Math.max(0, Math.min(value, maxDue))
    setDueNow(clamped)
    if (!selectedRequest) return
    const newTotalPaid = selectedRequest.amountPaid + clamped
    setUpdatedBalance(Math.max(0, selectedRequest.total - newTotalPaid))
  // Update change to reflect current customerPaid - dueNow, but never negative
  setChange(Math.max(0, customerPaid - clamped))
    // Validation is enforced at save-time; do not alert while typing
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

  // Derived validation flag for disabling save actions
  const isPaymentInvalid = !!selectedRequest && customerPaid < dueNow


  return (
    <div className="payment-container">
      {/* Left: Form + Table */}
      <div className="payment-form-container">
        <div className="payment-form">
          <Card>
            <CardContent className="form-card-content">
              <h1>Update Payment</h1>
              <div className="customer-info-grid">
                <div className="customer-info-pair flex items-end">
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
                        <SelectItem value="receiptId">Receipt ID</SelectItem>
                        <SelectItem value="dateIn">Date In</SelectItem>
                        <SelectItem value="customerName">Customer Name</SelectItem>
                        <SelectItem value="pairs"># Pairs</SelectItem>
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
                      className="flex flex-col mb-[5px]"
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
                {loading ? (
                  <div className="p-4 text-center text-gray-600">Loading payments...</div>
                ) : (
                  <PaymentsTable
                    requests={filteredRequests}
                    selectedRequest={selectedRequest}
                    selectedLineItemId={selectedLineItemId}
                    onSelect={(req: Request | null, lineItemId?: string | null) => {
                      // If req is null -> deselect everything
                      console.debug('Payments page: onSelect called ->', { reqReceipt: req?.receiptId, lineItemId })
                      try {
                        console.debug('Payments page: previous selectedRequest=', selectedRequest?.receiptId, 'selectedLineItemId=', selectedLineItemId)
                      } catch (e) {}
                      if (!req) {
                        setSelectedRequest(null)
                        setSelectedLineItemId(null)
                        // reset payment inputs
                        setDueNow(0)
                        setCustomerPaid(0)
                        setChange(0)
                        setUpdatedBalance(0)
                        return
                      }

                      // Select the passed request and line-item id (may be null)
                      setSelectedRequest(req)
                      setSelectedLineItemId(lineItemId ?? null)

                      // Prefill payment UI: dueNow/customerPaid reset, and updatedBalance set to
                      // the transaction-level remaining balance (total_amount - amount_paid)
                      setDueNow(0)
                      setCustomerPaid(0)
                      setChange(0)
                      setUpdatedBalance(req.remainingBalance)
                    }}
                    findServicePrice={findServicePriceFromList}
                    formatCurrency={formatCurrency}
                    RUSH_FEE={RUSH_FEE}
                  />
                )}
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
                      <div>
                        <Label>Cashier</Label>
                        <Input
                          value={cashier}
                          onChange={(e) => setCashier(e.target.value)}
                          placeholder="Enter cashier name"
                        />
                      </div>

                      <div>
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
                      max={selectedRequest ? selectedRequest.remainingBalance : undefined}
                      min={0}
                    />

                    <p>Customer Paid:</p>
                    <Input
                      className="text-right"
                      type="number"
                      value={customerPaid}
                      onChange={(e) => handleCustomerPaid(Number(e.target.value) || 0)}
                    />
                    {/* validation now uses alert() instead of inline message */}

                    <p>Change:</p>
                    <p className="text-right pr-3">{formatCurrency(change)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Select a request to update payment</p>
              )}
            </CardContent>
          </Card>

          <hr />
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

                  {cashier && (
                    <div className="summary-grid mt-2">
                      <p className="bold">Cashier</p>
                      <p className="text-right">{cashier}</p>
                    </div>
                  )}

                <div className="summary-date-row">
                  <p className="bold">{selectedRequest.receiptId}</p>
                  <p className="text-right">{selectedRequest.dateIn}</p>
                </div>

                {/* Shoe details */}
                <div className="summary-service-list">
                  {selectedRequest.shoes.map((shoe, i) => (
                    <div className="summary-service-entry mb-5" key={i}>
                      <p className="font-medium">{shoe.model || "Unnamed Shoe"}</p>

                      {/* Group services by name to show quantity as xN when >1 */}
                      {(() => {
                        const counts = new Map<string, number>()
                        for (const s of shoe.services || []) {
                          counts.set(s, (counts.get(s) || 0) + 1)
                        }
                        return Array.from(counts.entries()).map(([srv, qty], idx) => (
                          <div key={idx} className="pl-10 flex justify-between">
                            <p>
                              {srv} {qty > 1 ? <span className="text-sm">x{qty}</span> : null}
                            </p>
                            <p className="text-right">{formatCurrency(findServicePriceFromList(srv) * qty)}</p>
                          </div>
                        ))
                      })()}

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
                  disabled={isPaymentInvalid}
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
