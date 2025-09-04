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

import ToWarehouseModal from "@/components/operations/modals/OpRDModal"


type Branch = "Valenzuela" | "SM Valenzuela" | "SM Grand";
type Location = "Branch" | "Hub" | "To Branch" | "To Hub";

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
    status: "Ready for Delivery",
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
    status: "Ready for Delivery",
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
    status: "Ready for Delivery",
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
    status: "Ready for Delivery",
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
    status: "Ready for Delivery",
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
    status: "Ready for Delivery",
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
    status: "Ready for Delivery",
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
    status: "Ready for Delivery",
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
    status: "Ready for Delivery",
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
    status: "Ready for Delivery",
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
    status: "Ready for Delivery",
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
    status: "Ready for Delivery",
    isRush: false,
    dueDate: new Date("2025-12-25"),
    updated: new Date("2025-12-19"),
  },
];



export default function OpReadyDelivery() {
  const [selected, setSelected] = useState<string[]>([]);
  const [lastIndex, setLastIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [modalOpen, setModalOpen] = useState(false);

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
    <div className="op-container">
      <Table className="op-table">
        <TableHeader className="op-header">
          <TableRow className="op-header-row">
            <TableCell className="op-head-action"></TableCell>
            <TableHead className="op-head-transact"><h5>Transaction No</h5></TableHead>
            <TableHead className="op-head-date"><h5>Date</h5></TableHead>
            <TableHead className="op-head-customer"><h5>Customer</h5></TableHead>
            <TableHead className="op-head-shoe"><h5>Shoe</h5></TableHead>
            <TableHead className="op-head-service"><h5>Service</h5></TableHead>
            <TableHead className="op-head-branch"><h5>Branch</h5></TableHead>
            <TableHead className="op-head-location"><h5>Location</h5></TableHead>
            <TableHead className="op-head-status"><h5>Status</h5></TableHead>
            <TableHead className="op-head-rush"><h5>Priority</h5></TableHead>
            <TableHead className="op-head-due"><h5>Due Date</h5></TableHead>
            <TableHead className="op-head-mod"><h5>Updated</h5></TableHead>
            {hiddenColumns.length > 0 && (
              <TableHead className="op-head-chevron"></TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody className="op-body">
          {INITIAL_ROWS.map((row, index) => (
            <React.Fragment key={row.transactId}>
              <TableRow
                className={`op-body-row ${selected.includes(row.transactId) ? "selected" : ""}`}
                onClick={(e) => handleRowClick(e, row.transactId, index)}
              >
                <TableCell className="op-body-action" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.includes(row.transactId)}
                    onChange={() => toggleCheckbox(row.transactId, index)}
                  />
                </TableCell>
                <TableCell className="op-body-transact"><h5 className="text-[#000000]">{row.transactId}</h5></TableCell>
                <TableCell className="op-body-date"><small>{row.date.toLocaleDateString()}</small></TableCell>
                <TableCell className="op-body-customer"><small>{row.customer}</small></TableCell>
                <TableCell className="op-body-shoe"><small>{row.shoe}</small></TableCell>
                <TableCell className="op-body-service"><small>{row.service}</small></TableCell>
                <TableCell className="op-body-branch"><small>{row.branch}</small></TableCell>
                <TableCell className="op-body-location"><small>{row.Location}</small></TableCell>
                <TableCell className="op-body-status op-status-rd"><h5>{row.status}</h5></TableCell>
                <TableCell className="op-body-rush">
                  {row.isRush ? (
                    <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-medium">Rush</span>
                  ) : (
                    <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">Normal</span>
                  )}
                </TableCell>
                <TableCell className="op-body-due"><small>{row.dueDate.toLocaleDateString()}</small></TableCell>
                <TableCell className="op-body-mod"><small>{row.updated.toLocaleDateString()}</small></TableCell>
                {hiddenColumns.length > 0 && (
                  <TableCell className="op-body-dropdown-toggle">
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
                <TableRow className="op-body-dropdown-row">
                  <TableCell colSpan={12} className="op-dropdown-cell">
                    <div className="op-dropdown-card">
                      {hiddenColumns.includes("Date") && (
                        <div><h5 className="label">Date</h5> <h5 className="name">{row.date.toLocaleDateString()}</h5></div>
                      )}
                      {hiddenColumns.includes("Customer") && (
                        <div><h5 className="label">Customer</h5> <h5 className="name">{row.customer}</h5></div>
                      )}
                      {hiddenColumns.includes("Shoe") && (
                        <div><h5 className="label">Shoe</h5> <h5 className="name">{row.shoe}</h5></div>
                      )}
                      {hiddenColumns.includes("Service") && (
                        <div><h5 className="label">Service</h5> <h5 className="name">{row.service}</h5></div>
                      )}
                      {hiddenColumns.includes("Branch") && (
                        <div><h5 className="label">Branch</h5> <h5 className="name">{row.branch}</h5></div>
                      )}
                      {hiddenColumns.includes("Location") && (
                        <div><h5 className="label">Location</h5> <h5 className="name">{row.Location}</h5></div>
                      )}
                      {hiddenColumns.includes("Status") && (
                        <div><h5 className="label">Status</h5> <h5 className="name">{row.status}</h5></div>
                      )}
                      {hiddenColumns.includes("Priority") && (
                        <div><h5 className="label">Priority</h5> <h5 className="name">{row.isRush ? "Rush" : "Normal"}</h5></div>
                      )}
                      {hiddenColumns.includes("Due") && (
                        <div><h5 className="label">Due Date</h5> <h5 className="name">{row.dueDate.toLocaleDateString()}</h5></div>
                      )}
                      {hiddenColumns.includes("Mod") && (
                        <div><h5 className="label">Updated</h5> <h5 className="name">{row.updated.toLocaleDateString()}</h5></div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      <div className="op-below-container flex justify-end gap-4 mt-2">
        <p>{selected.length} item(s) selected</p>
        <button
          className="op-btn-rd op-btn text-white bg-[#1447E6] button-md disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={selected.length === 0}
          onClick={() => setModalOpen(true)}
        >
          <h5>Move To Warehouse</h5>
        </button>

        <ToWarehouseModal
              open={modalOpen}
              onOpenChange={setModalOpen}
              selectedCount={selected.length}
              onConfirm={() => {
              console.log("Confirmed for:", selected)
            }}
          />
      </div>
    </div>
  );
}