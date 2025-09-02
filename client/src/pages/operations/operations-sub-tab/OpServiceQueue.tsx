// src/components/OpServiceQueue.tsx
import React, { useEffect, useState } from "react";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import IconRD from "@/assets/icons/op-ready-delivery.svg?react";


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
  dueDate: Date;  
  updated: Date;
};

const INITIAL_ROWS: Row[] = [
  {
    transactId: "0001-001-VALEN",
    date: new Date("2025-01-15"),
    customer: "Juan Dela Cruz",
    shoe: "Nike Air Force 1",
    service: "Basic Cleaning",
    branch: "Valenzuela",
    Location: "Branch",
    status: "Queued",
    isRush: true,
    dueDate: new Date("2025-01-22"),
    updated: new Date("2025-01-16"),
  },
  {
    transactId: "0001-002-SMVAL",
    date: new Date("2025-02-03"),
    customer: "Maria Santos",
    shoe: "Adidas Ultraboost",
    service: "Deep Cleaning",
    branch: "SM Valenzuela",
    Location: "Branch",
    status: "Queued",
    isRush: false,
    dueDate: new Date("2025-02-12"),
    updated: new Date("2025-02-05"),
  },
  {
    transactId: "0001-003-GRAND",
    date: new Date("2025-03-22"),
    customer: "Carlo Mendoza",
    shoe: "Converse Chuck Taylor",
    service: "Basic Cleaning",
    branch: "SM Grand",
    Location: "Branch",
    status: "Queued",
    isRush: true,
    dueDate: new Date("2025-03-29"),
    updated: new Date("2025-03-23"),
  },
  {
    transactId: "0001-004-VALEN",
    date: new Date("2025-04-11"),
    customer: "Angela Reyes",
    shoe: "Puma Suede Classic",
    service: "Sole Repaint",
    branch: "Valenzuela",
    Location: "Branch",
    status: "Queued",
    isRush: false,
    dueDate: new Date("2025-04-21"),
    updated: new Date("2025-04-13"),
  },
  {
    transactId: "0001-005-SMVAL",
    date: new Date("2025-05-07"),
    customer: "Mark Tan",
    shoe: "New Balance 550",
    service: "Basic Cleaning",
    branch: "SM Valenzuela",
    Location: "Branch",
    status: "Queued",
    isRush: true,
    dueDate: new Date("2025-05-14"),
    updated: new Date("2025-05-08"),
  },
  {
    transactId: "0001-006-GRAND",
    date: new Date("2025-06-19"),
    customer: "Sofia Cruz",
    shoe: "Vans Old Skool",
    service: "Deep Cleaning",
    branch: "SM Grand",
    Location: "Branch",
    status: "Queued",
    isRush: false,
    dueDate: new Date("2025-06-29"),
    updated: new Date("2025-06-20"),
  },
  {
    transactId: "0001-007-VALEN",
    date: new Date("2025-07-08"),
    customer: "Daniel Chua",
    shoe: "Asics Gel-Lyte III",
    service: "Basic Cleaning",
    branch: "Valenzuela",
    Location: "Branch",
    status: "Queued",
    isRush: true,
    dueDate: new Date("2025-07-15"),
    updated: new Date("2025-07-09"),
  },
  {
    transactId: "0001-008-SMVAL",
    date: new Date("2025-08-14"),
    customer: "Grace Lim",
    shoe: "Nike Dunk Low",
    service: "Deep Cleaning",
    branch: "SM Valenzuela",
    Location: "Branch",
    status: "Queued",
    isRush: false,
    dueDate: new Date("2025-08-24"),
    updated: new Date("2025-08-16"),
  },
  {
    transactId: "0001-009-GRAND",
    date: new Date("2025-09-02"),
    customer: "Jose Ramirez",
    shoe: "Reebok Classic",
    service: "Basic Cleaning",
    branch: "SM Grand",
    Location: "Branch",
    status: "Queued",
    isRush: true,
    dueDate: new Date("2025-09-09"),
    updated: new Date("2025-09-03"),
  },
  {
    transactId: "0001-010-VALEN",
    date: new Date("2025-10-21"),
    customer: "Patricia Gomez",
    shoe: "Fila Disruptor",
    service: "Sole Repaint",
    branch: "Valenzuela",
    Location: "Branch",
    status: "Queued",
    isRush: false,
    dueDate: new Date("2025-10-31"),
    updated: new Date("2025-10-22"),
  },
  {
    transactId: "0001-011-SMVAL",
    date: new Date("2025-11-05"),
    customer: "Michael Lee",
    shoe: "Onitsuka Tiger Mexico 66",
    service: "Deep Cleaning",
    branch: "SM Valenzuela",
    Location: "Branch",
    status: "Queued",
    isRush: true,
    dueDate: new Date("2025-11-15"),
    updated: new Date("2025-11-07"),
  },
  {
    transactId: "0001-012-GRAND",
    date: new Date("2025-12-18"),
    customer: "Hannah Uy",
    shoe: "Jordan 1 Mid",
    service: "Basic Cleaning",
    branch: "SM Grand",
    Location: "Branch",
    status: "Queued",
    isRush: false,
    dueDate: new Date("2025-12-25"),
    updated: new Date("2025-12-19"),
  },
];


export default function OpServiceQueue() {
  const [selected, setSelected] = useState<string[]>([]);
  const [lastIndex, setLastIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  // update windowWidth on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleRowClick = (
    e: React.MouseEvent,
    rowId: string,
    rowIndex: number
  ) => {
    if (e.shiftKey && lastIndex !== null) {
      const start = Math.min(lastIndex, rowIndex);
      const end = Math.max(lastIndex, rowIndex);
      const rangeIds = INITIAL_ROWS.slice(start, end + 1).map((r) => r.transactId);
      setSelected(rangeIds);
    } else {
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

  const toggleExpand = (rowId: string) => {
    setExpanded((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  // determine hidden columns per breakpoint
  const getHiddenColumns = () => {
    if (windowWidth <= 899) return ["Action", "Customer", "Due", "Branch", "Mod", "Shoe", "Date", "Location", "Status"];
    if (windowWidth <= 1124) return ["Mod", "Shoe", "Date", "Location", "Status"];
    if (windowWidth <= 1312) return ["Location", "Status"];
    return [];
  };

  const hiddenColumns = getHiddenColumns();

  return (
    <div className="op-sq-container">
      <Table className="op-sq-table">
        <TableHeader className="op-sq-header">
          <TableRow className="op-sq-header-row">
            <TableCell className="op-sq-head-action"></TableCell>
            <TableHead className="op-sq-head-transact"><h5>Transaction No</h5></TableHead>
            <TableHead className="op-sq-head-date"><h5>Date</h5></TableHead>
            <TableHead className="op-sq-head-customer"><h5>Customer</h5></TableHead>
            <TableHead className="op-sq-head-shoe"><h5>Shoe</h5></TableHead>
            <TableHead className="op-sq-head-service"><h5>Service</h5></TableHead>
            <TableHead className="op-sq-head-branch"><h5>Branch</h5></TableHead>
            <TableHead className="op-sq-head-location"><h5>Location</h5></TableHead>
            <TableHead className="op-sq-head-status"><h5>Status</h5></TableHead>
            <TableHead className="op-sq-head-rush"><h5>Priority</h5></TableHead>
            <TableHead className="op-sq-head-due"><h5>Due Date</h5></TableHead>
            <TableHead className="op-sq-head-mod"><h5>Updated</h5></TableHead>
            {hiddenColumns.length > 0 && (
            <TableHead className="op-sq-head-chevron"></TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody className="op-sq-body">
          {INITIAL_ROWS.map((row, index) => (
            <React.Fragment key={row.transactId}>
              <TableRow
                className={`op-sq-body-row ${selected.includes(row.transactId) ? "selected" : ""}`}
                onClick={(e) => handleRowClick(e, row.transactId, index)}
              >
                <TableCell className="op-sq-body-action" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.includes(row.transactId)}
                    onChange={() => toggleCheckbox(row.transactId, index)}
                  />
                </TableCell>
                <TableCell className="op-sq-body-transact"><h5>{row.transactId}</h5></TableCell>
                <TableCell className="op-sq-body-date"><small>{row.date.toLocaleDateString()}</small></TableCell>
                <TableCell className="op-sq-body-customer"><small>{row.customer}</small></TableCell>
                <TableCell className="op-sq-body-shoe"><small>{row.shoe}</small></TableCell>
                <TableCell className="op-sq-body-service"><small>{row.service}</small></TableCell>
                <TableCell className="op-sq-body-branch"><small>{row.branch}</small></TableCell>
                <TableCell className="op-sq-body-location"><small>{row.Location}</small></TableCell>
                <TableCell className="op-sq-body-status"><h5>{row.status}</h5></TableCell>
                <TableCell className="op-sq-body-rush">
                  {row.isRush ? <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-medium">Rush</span> :
                  <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">Normal</span>}
                </TableCell>
                <TableCell className="op-sq-body-due"><small>{row.dueDate.toLocaleDateString()}</small></TableCell>
                <TableCell className="op-sq-body-mod"><small>{row.updated.toLocaleDateString()}</small></TableCell>
                {hiddenColumns.length > 0 && (
                  <TableCell className="op-sq-body-dropdown-toggle">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleExpand(row.transactId); }}
                      className={`chevron-btn ${expanded.includes(row.transactId) ? "rotate-180" : ""}`}
                    >
                      ▾
                    </button>
                  </TableCell>
                )}
              </TableRow>

              {/* Dropdown card */}
              {expanded.includes(row.transactId) && hiddenColumns.length > 0 && (
                <TableRow className="op-sq-body-dropdown-row">
                  <TableCell colSpan={12}>
                    <div className="op-sq-dropdown-card">
                      {hiddenColumns.includes("Date") && <div><h5>Date:</h5> {row.date.toLocaleDateString()}</div>}
                      {hiddenColumns.includes("Customer") && <div><h5>Customer:</h5> {row.customer}</div>}
                      {hiddenColumns.includes("Shoe") && <div><h5>Shoe:</h5> {row.shoe}</div>}
                      {hiddenColumns.includes("Service") && <div><h5>Service:</h5> {row.service}</div>}
                      {hiddenColumns.includes("Branch") && <div><h5>Branch:</h5> {row.branch}</div>}
                      {hiddenColumns.includes("Location") && <div><h5>Location:</h5> {row.Location}</div>}
                      {hiddenColumns.includes("Status") && <div><h5>Status:</h5> {row.status}</div>}
                      {hiddenColumns.includes("Priority") && <div><h5>Priority:</h5> {row.isRush ? "Rush" : "Normal"}</div>}
                      {hiddenColumns.includes("Due") && <div><h5>Due Date:</h5> {row.dueDate.toLocaleDateString()}</div>}
                      {hiddenColumns.includes("Mod") && <div><h5>Updated:</h5> {row.updated.toLocaleDateString()}</div>}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      <div className="op-sq-below-container flex justify-end gap-4 mt-2">
        <p>{selected.length} item(s) selected</p>
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