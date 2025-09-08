"use client"

import * as React from "react"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import "@/styles/payment.css"
import "@/styles/components/paymentsTable.css"

type Shoe = {
  model: string
  services: string[]
  additionals: string[]
  pairs?: number
  rush?: "yes" | "no"
}

export type Request = {
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

type Props = {
  requests: Request[]
  selectedRequest: Request | null
  onSelect: React.Dispatch<React.SetStateAction<Request | null>>
  findServicePrice: (srv: string) => number
  findAddonPrice: (addon: string) => number
  formatCurrency?: (n: number) => string
  RUSH_FEE: number
}

export const PaymentsTable: React.FC<Props> = ({
  requests,
  selectedRequest,
  onSelect,
  findServicePrice,
  findAddonPrice,
  formatCurrency = (n) =>
    n.toLocaleString("en-PH", { style: "currency", currency: "PHP" }),
  RUSH_FEE,
}) => {
  return (
    <Table className="payment-table">
      {/* Header */}
      <TableHeader className="payment-table-header">
        <TableRow>
          <TableHead className="text-center">Receipt ID</TableHead>
          <TableHead className="text-center">Date In</TableHead>
          <TableHead className="text-center">Customer Name</TableHead>
          <TableHead className="text-center">Total</TableHead>
          <TableHead className="text-center hide-below-1220 show-below-1024 hide-below-767">
            # of Pairs
          </TableHead>
          <TableHead className="text-center hide-below-1220 show-below-1024 hide-below-767">
            # Released
          </TableHead>
          <TableHead className="text-center hide-below-1369 show-below-1024 hide-below-899">
            Amount Paid
          </TableHead>
          <TableHead className="text-center hide-below-1369 show-below-1024 hide-below-899">
            Remaining Balance
          </TableHead>
          <TableHead className="text-center">Action</TableHead>
        </TableRow>
      </TableHeader>

      {/* Body */}
      <TableBody className="payment-table-body">
        {requests.map((req) => {
          const isSelected = selectedRequest?.receiptId === req.receiptId

          // 🔹 Compute total dynamically
          const computedTotal =
            req.shoes?.reduce((sum: number, shoe: Shoe) => {
              const serviceTotal = shoe.services.reduce(
                (s, svc) => s + findServicePrice(svc),
                0
              )
              const addonTotal = shoe.additionals.reduce(
                (s, addon) => s + findAddonPrice(addon),
                0
              )
              const rushFee = shoe.rush === "yes" ? RUSH_FEE : 0
              return sum + serviceTotal + addonTotal + rushFee
            }, 0) ?? 0

          const handleRowClick = () => onSelect(isSelected ? null : req)

          const handleButtonClick = (e: React.MouseEvent) => {
            e.stopPropagation()
            handleRowClick()
          }

          return (
            <React.Fragment key={req.receiptId}>
              <TableRow
                className={`cursor-pointer ${
                  isSelected
                    ? "bg-green-100 border-b border-green-100 hover:bg-green-100"
                    : "hover:bg-muted/50"
                }`}
                onClick={handleRowClick}
              >
                <TableCell>{req.receiptId}</TableCell>
                <TableCell>{req.dateIn}</TableCell>
                <TableCell>{req.customerName}</TableCell>
                <TableCell>{formatCurrency(computedTotal)}</TableCell>
                <TableCell className="hide-below-1220 show-below-1024 hide-below-767">
                  {req.pairs}
                </TableCell>
                <TableCell className="hide-below-1220 show-below-1024 hide-below-767">
                  {req.pairsReleased}
                </TableCell>
                <TableCell className="hide-below-1369 show-below-1024 hide-below-899">
                  {formatCurrency(req.amountPaid)}
                </TableCell>
                <TableCell className="hide-below-1369 show-below-1024 hide-below-899">
                  {formatCurrency(req.remainingBalance)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={handleButtonClick}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </Button>
                </TableCell>
              </TableRow>

              {/* Accordion row */}
              {isSelected && (
                <TableRow className="bg-green-100 border-b border-green-100 hover:bg-green-100">
                  <TableCell colSpan={9} className="p-0 text-left">
                    <div className="pl-3 flex flex-col space-y-1">
                      <p className="pl-3 hide show-below-1220 hide-below-1024 show-below-767">
                        <strong># of Pairs:</strong> {req.pairs}
                      </p>
                      <p className="pl-3 hide show-below-1220 hide-below-1024 show-below-767">
                        <strong># Released:</strong> {req.pairsReleased}
                      </p>
                      <p className="pl-3 hide show-below-1369 hide-below-1024 show-below-899">
                        <strong>Amount Paid:</strong>{" "}
                        {formatCurrency(req.amountPaid)}
                      </p>
                      <p className="pl-3 pb-3 hide show-below-1369 hide-below-1024 show-below-899">
                        <strong>Remaining Balance:</strong>{" "}
                        {formatCurrency(req.remainingBalance)}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          )
        })}
      </TableBody>
    </Table>
  )
}
