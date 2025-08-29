// src/components/OpServiceQueue.tsx
import React from "react";

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
];

export default function OpServiceQueue() {
  return (
    <div className="op-sq-container">
      <Table className="op-sq-table">

        <TableHeader className="op-sq-header">
          <TableRow className="op-sq-header-row">
            <TableHead className="op-sq-head-transact"><h5>Transaction No</h5></TableHead>
            <TableHead className="op-sq-head-date"><h5>Date</h5></TableHead>
            <TableHead className="op-sq-head-customer"><h5>Customer</h5></TableHead>
            <TableHead className="op-sq-head-shoe"><h5>Shoe</h5></TableHead>
            <TableHead className="op-sq-head-service"><h5>Service</h5></TableHead>
            <TableHead className="op-sq-head-branch"><h5>Branch</h5></TableHead>
            <TableHead className="op-sq-head-location"><h5>Location</h5></TableHead>
            <TableHead className="op-sq-head-status"><h5>Status</h5></TableHead>
            <TableHead className="op-sq-head-rush"><h5>Rush</h5></TableHead>
            <TableHead className="op-sq-head-action"><h5>Action</h5></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="op-sq-body">
          {INITIAL_ROWS.map((row) => (
            <TableRow key={row.transactId} className="op-sq-body-row">
              <TableCell className="op-sq-body-transact"><h5>{row.transactId}</h5></TableCell>
              <TableCell className="op-sq-body-date"><small>{row.date.toLocaleDateString()}</small></TableCell>
              <TableCell className="op-sq-body-customer"><small>{row.customer}</small></TableCell>
              <TableCell className="op-sq-body-shoe"><small>{row.shoe}</small></TableCell>
              <TableCell className="op-sq-body-service"><small>{row.service}</small></TableCell>
              <TableCell className="op-sq-body-branch"><small>{row.branch}</small></TableCell>
              <TableCell className="op-sq-body-location"><small>{row.Location}</small></TableCell>
              <TableCell className="op-sq-body-status"><small>{row.status}</small></TableCell>
              <TableCell className="op-sq-body-rush"><small>{row.isRush ? "Yes" : "No"}</small></TableCell>
              <TableCell className="op-sq-body-action">
                <button className="op-sq-btn-delivery text-white bg-[#0E9CFF] button-md">
                  Ready for Delivery
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
