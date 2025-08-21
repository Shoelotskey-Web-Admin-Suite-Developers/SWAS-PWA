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
  req: any
  isSelected: boolean
  onSelect: (req: any | null) => void
  findServicePrice?: (name: string) => number
  findAddonPrice?: (name: string) => number
}

export const SelectableTableRow: React.FC<Props> = ({
  req,
  isSelected,
  onSelect,
  findServicePrice = () => 0,
  findAddonPrice = () => 0,
}) => {
  const handleRowClick = () => {
    onSelect(isSelected ? null : req)
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleRowClick()
  }

  return (
    <React.Fragment>
      {/* Main table row */}
      <TableRow
        className={`cursor-pointer ${
          isSelected 
            ? "bg-green-100 border-b border-green-100 hover:bg-green-100" // lock background, disable hover animation
            : "hover:bg-muted/50"               // keep hover for unselected rows
        }`}
        onClick={handleRowClick}
      >
        <TableCell>{req.receiptId}</TableCell>
        <TableCell>{req.dateIn}</TableCell>
        <TableCell>{req.customerName}</TableCell>
        <TableCell>{req.total.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}</TableCell>

        {/* Columns hidden on small screens */}
        <TableCell className="hide-below-1220 show-below-1024 hide-below-767 ">{req.pairs}</TableCell>
        <TableCell className="hide-below-1220 show-below-1024 hide-below-767">{req.pairsReleased}</TableCell>
        <TableCell className="hide-below-1369 show-below-1024 hide-below-899">
          {req.amountPaid.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}
        </TableCell>
        <TableCell className="hide-below-1369 show-below-1024 hide-below-899">
          {req.remainingBalance.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}
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
              <p className="pl-3 hide show-below-1220 hide-below-1024 show-below-767 "><strong className="bold"># of Pairs:</strong> {req.pairs}</p>
              <p className="pl-3 hide show-below-1220 hide-below-1024 show-below-767"><strong className="bold"># Released:</strong> {req.pairsReleased}</p>
              <p className="pl-3 hide show-below-1369 hide-below-1024 show-below-899"><strong className="bold">Amount Paid:</strong> {req.amountPaid.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}</p>
              <p className="pl-3 pb-3 hide show-below-1369 hide-below-1024 show-below-899"><strong className="bold">Remaining Balance:</strong> {req.remainingBalance.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}</p>
            </div>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  )
}
