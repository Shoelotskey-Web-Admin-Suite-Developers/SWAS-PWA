"use client"

import React from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import "@/styles/components/paymentsTable.css"

type Shoe = {
  model: string
  services: string[]
  additionals: string[]
  pairs?: number
  rush?: "yes" | "no"
}

type Props = {
  req: {
    receiptId: string
    dateIn: string
    customerName: string
    shoes: Shoe[]
    pairs: number
    pairsReleased: number
    amountPaid: number
    remainingBalance: number
  }
  isSelected: boolean
  onSelect: (req: any | null) => void
  findServicePrice: (name: string) => number
  findAddonPrice: (name: string) => number
  formatCurrency?: (n: number) => string
  RUSH_FEE: number
}

export const SelectableTableRow: React.FC<Props> = ({
  req,
  isSelected,
  onSelect,
  findServicePrice,
  findAddonPrice,
  formatCurrency = (n) =>
    n.toLocaleString("en-PH", { style: "currency", currency: "PHP" }),
  RUSH_FEE,
}) => {
  const handleRowClick = () => {
    onSelect(isSelected ? null : req)
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleRowClick()
  }

  // 🔹 Compute total dynamically from shoes, services, addons, rush fee
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

  return (
    <React.Fragment>
      {/* Main table row */}
      <TableRow
        className={`cursor-pointer ${
          isSelected
            ? "bg-green-100 border-b border-green-100 hover:bg-green-100" // lock background, disable hover animation
            : "hover:bg-muted/50" // keep hover for unselected rows
        }`}
        onClick={handleRowClick}
      >
        <TableCell>{req.receiptId}</TableCell>
        <TableCell>{req.dateIn}</TableCell>
        <TableCell>{req.customerName}</TableCell>
        <TableCell>{formatCurrency(computedTotal)}</TableCell>

        {/* Columns hidden on small screens */}
        <TableCell className="hide-below-1220 show-below-1024 hide-below-767 ">
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

        {/* Select button always visible */}
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

      {/* Accordion for small screens */}
      {isSelected && (
        <TableRow className="bg-green-100 border-b border-green-100 hover:bg-green-100 ">
          <TableCell colSpan={9} className="p-0 text-left">
            <div className="pl-3 flex flex-col space-y-1">
              <p className="pl-3 hide show-below-1220 hide-below-1024 show-below-767 ">
                <strong className="bold"># of Pairs:</strong> {req.pairs}
              </p>
              <p className="pl-3 hide show-below-1220 hide-below-1024 show-below-767">
                <strong className="bold"># Released:</strong> {req.pairsReleased}
              </p>
              <p className="pl-3 hide show-below-1369 hide-below-1024 show-below-899">
                <strong className="bold">Amount Paid:</strong>{" "}
                {formatCurrency(req.amountPaid)}
              </p>
              <p className="pl-3 pb-3 hide show-below-1369 hide-below-1024 show-below-899">
                <strong className="bold">Remaining Balance:</strong>{" "}
                {formatCurrency(req.remainingBalance)}
              </p>
            </div>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  )
}
