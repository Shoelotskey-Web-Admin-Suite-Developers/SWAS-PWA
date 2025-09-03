"use client"

import { TableHead, TableHeader, TableRow } from "@/components/ui/table"
import "@/styles/payment.css"
import "@/styles/components/paymentsTable.css"

export function PaymentsTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        {/* --- Match responsive rules in SelectableTableRow --- */}
        <TableHead className="text-center">Receipt ID</TableHead>
        <TableHead className="text-center">Date In</TableHead>
        <TableHead className="text-center">Customer Name</TableHead>
        <TableHead className="text-center">Total</TableHead>
        <TableHead className="text-center hide-below-1220 show-below-1024 hide-below-767"># of Pairs</TableHead>
        <TableHead className="text-center hide-below-1220 show-below-1024 hide-below-767"># Released</TableHead>
        <TableHead className="text-center hide-below-1369 show-below-1024 hide-below-899">Amount Paid</TableHead>
        <TableHead className="text-center hide-below-1369 show-below-1024 hide-below-899">Remaining Balance</TableHead>
        <TableHead className="text-center">Action</TableHead>
      </TableRow>
    </TableHeader>
  )
}
