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


type Branch = "Valenzuela" | "SM Valenzuela" | "SM Grand";
type Location = "Branch" | "Hub" | "To Branch" | "To Hub";

type Row = {
  transactId: string;
  date: Date;
  customer: string;
  shoe: string;
  service: string;
  branch: Branch;
  pickupNotice?: { notifiedAt?: Date; allowanceDays: number };
  paymentStatus: "Paid" | "Unpaid" | "Partial";
  contact: string;
};


const INITIAL_ROWS: Row[] = [
  {
    transactId: "0001-001-VALEN",
    date: new Date("2025-01-15"),
    customer: "Juan Dela Cruz",
    shoe: "Nike Air Force 1",
    service: "Basic Cleaning",
    branch: "Valenzuela",
    pickupNotice: { notifiedAt: new Date("2025-01-16"), allowanceDays: 5 }, // 5 days left
    paymentStatus: "Paid",
    contact: "09171234567",
  },
  {
    transactId: "0001-002-SMVAL",
    date: new Date("2025-02-03"),
    customer: "Maria Santos",
    shoe: "Adidas Ultraboost",
    service: "Deep Cleaning",
    branch: "SM Valenzuela",
    pickupNotice: { notifiedAt: new Date("2025-02-01"), allowanceDays: -2 }, // 2 days overdue
    paymentStatus: "Unpaid",
    contact: "09179876543",
  },
  {
    transactId: "0001-003-GRAND",
    date: new Date("2025-03-22"),
    customer: "Carlo Mendoza",
    shoe: "Converse Chuck Taylor",
    service: "Basic Cleaning",
    branch: "SM Grand",
    pickupNotice: { notifiedAt: new Date("2025-03-20"), allowanceDays: 3 }, // 3 days left
    paymentStatus: "Partial",
    contact: "09221234567",
  },
  {
    transactId: "0001-004-VALEN",
    date: new Date("2025-04-10"),
    customer: "Ana Reyes",
    shoe: "Vans Old Skool",
    service: "Deep Cleaning",
    branch: "Valenzuela",
    pickupNotice: { notifiedAt: new Date("2025-04-08"), allowanceDays: -1 }, // 1 day overdue
    paymentStatus: "Paid",
    contact: "09174561234",
  },
  {
    transactId: "0001-005-SMVAL",
    date: new Date("2025-05-05"),
    customer: "Mark Lopez",
    shoe: "Puma RS-X",
    service: "Basic Cleaning",
    branch: "SM Valenzuela",
    pickupNotice: { notifiedAt: new Date("2025-05-03"), allowanceDays: 7 }, // 7 days left
    paymentStatus: "Partial",
    contact: "09221239876",
  },
];





export default function OpPickup() {
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

  const handleRowClick = (e: React.MouseEvent, rowId: string, rowIndex: number) => {
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
  if (windowWidth <= 899) return ["Date", "Service", "Shoe", "Customer", "Contact"];
  if (windowWidth <= 1124) return ["Date", "Service", "Shoe", "Customer", "Contact"];
  if (windowWidth <= 1312) return ["Date", "Service"];
  return [];
};


  const hiddenColumns = getHiddenColumns();

  return (
    <div className="op-container">
      <Table className="op-table">
        <TableHeader className="op-header">
          <TableRow className="op-header-row">
            <TableHead className="op-pu-head-transact"><h5>Transaction No</h5></TableHead>
            <TableHead className="op-pu-head-date"><h5>Date</h5></TableHead>
            <TableHead className="op-pu-head-customer"><h5>Customer</h5></TableHead>
            <TableHead className="op-pu-head-shoe"><h5>Shoe</h5></TableHead>
            <TableHead className="op-pu-head-service"><h5>Service</h5></TableHead>
            <TableHead className="op-pu-head-branch"><h5>Branch</h5></TableHead>
            <TableHead className="op-pu-head-pickup-notice"><h5>Pickup Notice</h5></TableHead>
            <TableHead className="op-pu-head-payment-status"><h5>Payment Status</h5></TableHead>
            <TableHead className="op-pu-head-contact"><h5>Contact</h5></TableHead>
            {hiddenColumns.length > 0 && <TableHead className="op-pu-head-chevron"></TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody className="op-body">
          {INITIAL_ROWS.map((row, index) => (
            <React.Fragment key={row.transactId}>
              <TableRow
                className={`op-body-row ${selected.includes(row.transactId) ? "selected" : ""}`}
              >
                <TableCell className="op-pu-body-transact"><h5>{row.transactId}</h5></TableCell>
                <TableCell className="op-pu-body-date"><small>{row.date.toLocaleDateString()}</small></TableCell>
                <TableCell className="op-pu-body-customer"><small>{row.customer}</small></TableCell>
                <TableCell className="op-pu-body-shoe"><small>{row.shoe}</small></TableCell>
                <TableCell className="op-pu-body-service"><small>{row.service}</small></TableCell>
                <TableCell className="op-pu-body-branch"><small>{row.branch}</small></TableCell>

                {/* Pickup Notice */}
                <TableCell className="op-pu-body-pickup-notice">
                  {row.pickupNotice?.notifiedAt && (
                    <>
                      <div>📢 <small>{row.pickupNotice.notifiedAt.toLocaleDateString()}</small></div>
                      <div className={
                        row.pickupNotice.allowanceDays <= 0
                          ? "text-red-600"
                          : row.pickupNotice.allowanceDays <= 3
                          ? "text-yellow-600"
                          : "text-green-600"
                      }>
                        <small>
                          {row.pickupNotice.allowanceDays > 0
                            ? `${row.pickupNotice.allowanceDays} days left`
                            : `+${Math.abs(row.pickupNotice.allowanceDays)} days overdue`}
                        </small>
                      </div>
                    </>
                  )}
                </TableCell>


                {/* Payment Status */}
                <TableCell className="op-pu-body-payment-status">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      row.paymentStatus === "Paid"
                        ? "bg-green-200 text-green-800"
                        : row.paymentStatus === "Partial"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {row.paymentStatus}
                  </span>
                </TableCell>

                {/* Contact */}
                <TableCell className="op-pu-body-contact"><small>{row.contact}</small></TableCell>

                {/* Chevron for dropdown */}
                {hiddenColumns.length > 0 && (
                  <TableCell className="op-pu-body-dropdown-toggle">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleExpand(row.transactId); }}
                      className={`chevron-btn ${expanded.includes(row.transactId) ? "rotate-180" : ""}`}
                    >
                      ▾
                    </button>
                  </TableCell>
                )}
              </TableRow>

              {/* Dropdown card for hidden columns */}
              {expanded.includes(row.transactId) && hiddenColumns.length > 0 && (
                <TableRow className="op-body-dropdown-row">
                  <TableCell colSpan={9} className="op-dropdown-cell">
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
                      {hiddenColumns.includes("PickupNotice") && row.pickupNotice?.notifiedAt && (
                        <div>
                          <h5 className="label">Pickup Notice</h5>
                          <div>{row.pickupNotice.notifiedAt.toLocaleDateString()}</div>
                          <div className={row.pickupNotice.allowanceDays < 0 ? "text-red-600" : ""}>
                            {row.pickupNotice.allowanceDays >= 0
                              ? `${row.pickupNotice.allowanceDays} days left`
                              : `+${Math.abs(row.pickupNotice.allowanceDays)} days overdue`}
                          </div>
                        </div>
                      )}
                      {hiddenColumns.includes("Payment") && (
                        <div>
                          <h5 className="label">Payment Status</h5>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              row.paymentStatus === "Paid"
                                ? "bg-green-200 text-green-800"
                                : row.paymentStatus === "Partial"
                                ? "bg-yellow-200 text-yellow-800"
                                : "bg-red-200 text-red-800"
                            }`}
                          >
                            {row.paymentStatus}
                          </span>
                        </div>
                      )}
                      {hiddenColumns.includes("Contact") && (
                        <div><h5 className="label">Contact</h5> <h5 className="name">{row.contact}</h5></div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
