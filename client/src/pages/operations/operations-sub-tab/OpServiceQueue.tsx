// src/components/OpServiceQueue.tsx
import React, { useState } from "react";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

type Branch = "Valenzuela" | "SM Valenzuela" | "SM Grand";
type Location = "Branch" | "Hub";

type Row = {
  transactId: string;
  date: Date;
  customer: string;
  shoe: string;
  service: string;
  branch: Branch;
  Location: Location;
  status: string;
  isRush: boolean;
};

const INITIAL_ROWS: Row[] = [
  {
    transactId: "0001-001-VALEN",
    date: new Date("2025-04-01"),
    customer: "Mark Dela Cruz",
    shoe: "Nike Air Max 270",
    service: "Basic Cleaning",
    branch: "Valenzuela",
    Location: "Branch",
    status: "Queued",
    isRush: true,
  },
  {
    transactId: "0001-002-VALEN",
    date: new Date("2025-04-01"),
    customer: "Mark Dela Cruz",
    shoe: "Nike Air Max 270",
    service: "Basic Cleaning",
    branch: "Valenzuela",
    Location: "Branch",
    status: "Queued",
    isRush: true,
  },
  {
    transactId: "0001-003-VALEN",
    date: new Date("2025-04-01"),
    customer: "Mark Dela Cruz",
    shoe: "Nike Air Max 270",
    service: "Basic Cleaning",
    branch: "Valenzuela",
    Location: "Branch",
    status: "Queued",
    isRush: true,
  },
  {
    transactId: "0001-004-VALEN",
    date: new Date("2025-04-01"),
    customer: "Mark Dela Cruz",
    shoe: "Nike Air Max 270",
    service: "Basic Cleaning",
    branch: "Valenzuela",
    Location: "Branch",
    status: "Queued",
    isRush: true,
  },
  {
    transactId: "0001-005-VALEN",
    date: new Date("2025-04-01"),
    customer: "Mark Dela Cruz",
    shoe: "Nike Air Max 270",
    service: "Basic Cleaning",
    branch: "Valenzuela",
    Location: "Branch",
    status: "Queued",
    isRush: true,
  },
  {
    transactId: "0001-006-VALEN",
    date: new Date("2025-04-01"),
    customer: "Mark Dela Cruz",
    shoe: "Nike Air Max 270",
    service: "Basic Cleaning",
    branch: "Valenzuela",
    Location: "Branch",
    status: "Queued",
    isRush: true,
  },
  {
    transactId: "0001-007-VALEN",
    date: new Date("2025-04-01"),
    customer: "Mark Dela Cruz",
    shoe: "Nike Air Max 270",
    service: "Basic Cleaning",
    branch: "Valenzuela",
    Location: "Branch",
    status: "Queued",
    isRush: true,
  },
  {
    transactId: "0001-008-VALEN",
    date: new Date("2025-04-01"),
    customer: "Mark Dela Cruz",
    shoe: "Nike Air Max 270",
    service: "Basic Cleaning",
    branch: "Valenzuela",
    Location: "Branch",
    status: "Queued",
    isRush: true,
  },
  {
    transactId: "0001-009-VALEN",
    date: new Date("2025-04-01"),
    customer: "Mark Dela Cruz",
    shoe: "Nike Air Max 270",
    service: "Basic Cleaning",
    branch: "Valenzuela",
    Location: "Branch",
    status: "Queued",
    isRush: true,
  },
  {
    transactId: "0001-010-VALEN",
    date: new Date("2025-04-01"),
    customer: "Mark Dela Cruz",
    shoe: "Nike Air Max 270",
    service: "Basic Cleaning",
    branch: "Valenzuela",
    Location: "Branch",
    status: "Queued",
    isRush: true,
  },
  {
    transactId: "0001-011-VALEN",
    date: new Date("2025-04-01"),
    customer: "Mark Dela Cruz",
    shoe: "Nike Air Max 270",
    service: "Basic Cleaning",
    branch: "Valenzuela",
    Location: "Branch",
    status: "Queued",
    isRush: true,
  },
  {
    transactId: "0001-012-VALEN",
    date: new Date("2025-04-01"),
    customer: "Mark Dela Cruz",
    shoe: "Nike Air Max 270",
    service: "Basic Cleaning",
    branch: "Valenzuela",
    Location: "Branch",
    status: "Queued",
    isRush: true,
  },
];


export default function OpServiceQueue() {
  const [selected, setSelected] = useState<string[]>([]);
  const [lastIndex, setLastIndex] = useState<number | null>(null);

  const handleRowClick = (
    e: React.MouseEvent,
    rowId: string,
    rowIndex: number
  ) => {
    if (e.shiftKey && lastIndex !== null) {
      // select range
      const start = Math.min(lastIndex, rowIndex);
      const end = Math.max(lastIndex, rowIndex);
      const rangeIds = INITIAL_ROWS.slice(start, end + 1).map(
        (r) => r.transactId
      );

      // replace with range
      setSelected(rangeIds);
    } else {
      // normal toggle
      setSelected((prev) =>
        prev.includes(rowId)
          ? prev.filter((id) => id !== rowId)
          : [...prev, rowId]
      );
      setLastIndex(rowIndex);
    }
  };

  const toggleCheckbox = (rowId: string, rowIndex: number) => {
    setSelected((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
    setLastIndex(rowIndex);
  };

  return (
    <div className="op-sq-container">
      <Table className="op-sq-table">
        <TableHeader className="op-sq-header">
          <TableRow className="op-sq-header-row">
            <TableCell className="op-sq-head-action"></TableCell>
            <TableHead className="op-sq-head-transact">
              <h5>Transaction No</h5>
            </TableHead>
            <TableHead className="op-sq-head-date">
              <h5>Date</h5>
            </TableHead>
            <TableHead className="op-sq-head-customer">
              <h5>Customer</h5>
            </TableHead>
            <TableHead className="op-sq-head-shoe">
              <h5>Shoe</h5>
            </TableHead>
            <TableHead className="op-sq-head-service">
              <h5>Service</h5>
            </TableHead>
            <TableHead className="op-sq-head-branch">
              <h5>Branch</h5>
            </TableHead>
            <TableHead className="op-sq-head-location">
              <h5>Location</h5>
            </TableHead>
            <TableHead className="op-sq-head-status">
              <h5>Status</h5>
            </TableHead>
            <TableHead className="op-sq-head-rush">
              <h5>Rush</h5>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="op-sq-body">
          {INITIAL_ROWS.map((row, index) => (
            <TableRow
              key={row.transactId}
              className={`op-sq-body-row ${
                selected.includes(row.transactId) ? "bg-blue-100" : ""
              }`}
              onClick={(e) => handleRowClick(e, row.transactId, index)}
            >
              <TableCell
                className="op-sq-body-action"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(row.transactId)}
                  onChange={() => toggleCheckbox(row.transactId, index)}
                />
              </TableCell>
              <TableCell className="op-sq-body-transact">
                <h5>{row.transactId}</h5>
              </TableCell>
              <TableCell className="op-sq-body-date">
                <small>{row.date.toLocaleDateString()}</small>
              </TableCell>
              <TableCell className="op-sq-body-customer">
                <small>{row.customer}</small>
              </TableCell>
              <TableCell className="op-sq-body-shoe">
                <small>{row.shoe}</small>
              </TableCell>
              <TableCell className="op-sq-body-service">
                <small>{row.service}</small>
              </TableCell>
              <TableCell className="op-sq-body-branch">
                <small>{row.branch}</small>
              </TableCell>
              <TableCell className="op-sq-body-location">
                <small>{row.Location}</small>
              </TableCell>
              <TableCell className="op-sq-body-status">
                <h5>{row.status}</h5>
              </TableCell>
              <TableCell className="op-sq-body-rush">
                <small>{row.isRush ? "Yes" : "No"}</small>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="op-sq-below-container flex justify-end gap-4 mt-2">
        <p>{selected.length} items selected</p>
        <button
          className="op-sq-btn-delivery text-white bg-[#0E9CFF] button-md"
          disabled={selected.length === 0}
        >
          <h5>Mark as Ready for Delivery</h5>
        </button>
      </div>
    </div>
  );
}


