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
import { getLineItems } from "@/utils/api/getLineItems";
import { getCustomerContact } from "@/utils/api/getCustomerContact";
import { getPaymentStatus } from "@/utils/api/getPaymentStatus";
import { computePickupAllowance } from "@/utils/computePickupAllowance";
import { getUpdateColor } from "@/utils/getUpdateColor";
import { getCustomerName } from "@/utils/api/getCustomerName";

const SERVICE_ID_TO_NAME: Record<string, string> = {
  "SERVICE-1": "Basic Cleaning",
  "SERVICE-2": "Minor Reglue",
  "SERVICE-3": "Full Reglue",
  "SERVICE-4": "Unyellowing",
  "SERVICE-5": "Minor Retouch",
  "SERVICE-6": "Minor Restoration",
  "SERVICE-7": "Additional Layer",
  "SERVICE-8": "Color Renewal (2 colors)",
  "SERVICE-9": "Color Renewal (3 colors)",
};

type Branch = "Valenzuela" | "SM Valenzuela" | "SM Grand";
type Location = "Branch" | "Hub" | "To Branch" | "To Hub";

type Row = {
  lineItemId: string;
  date: Date;
  customerId: string; // Changed from customer
  customerName: string | null; // Added
  shoe: string;
  service: string;
  branch: Branch;
  pickupNotice?: Date | null;
  allowanceDays: number;
  paymentStatus: "Paid" | "Unpaid" | "Partial";
  contact: string;
};

export default function OpPickup() {
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [lastIndex, setLastIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [customerNames, setCustomerNames] = useState<Record<string, string | null>>({});

  // Fetch customer names for all displayed rows
  const fetchCustomerNames = async (items: Row[]) => {
    const uniqueCustomerIds = [...new Set(items.map(item => item.customerId))];
    const newCustomerNames: Record<string, string | null> = {...customerNames};
    
    await Promise.all(uniqueCustomerIds.map(async (custId) => {
      // Skip already fetched names
      if (newCustomerNames[custId] !== undefined) return;
      
      const name = await getCustomerName(custId);
      newCustomerNames[custId] = name;
    }));
    
    setCustomerNames(newCustomerNames);
  };

  useEffect(() => {
    const fetchRows = async () => {
      const items = await getLineItems("Ready for Pickup");
      const mappedRows: Row[] = await Promise.all(
        items.map(async (item: any) => {
          // Fetch customer contact and payment status
          const contact = await getCustomerContact(item.cust_id) ?? "";
          const paymentStatusRaw = await getPaymentStatus(item.transaction_id);
          console.log("paymentStatusRaw:", paymentStatusRaw);
          let paymentStatus: "Paid" | "Unpaid" | "Partial" = "Unpaid";
          if (paymentStatusRaw === "PAID") paymentStatus = "Paid";
          else if (paymentStatusRaw === "PARTIAL") paymentStatus = "Partial";

          // Compute pickup notice and allowance
          const pickupNotice = item.pickUpNotice ? new Date(item.pickUpNotice) : null;
          const allowanceDays = computePickupAllowance(pickupNotice);

          return {
            lineItemId: item.line_item_id,
            date: new Date(item.latest_update),
            customerId: item.cust_id, // Changed from customer to customerId
            customerName: null, // Will be populated later
            shoe: item.shoes,
            // Updated service mapping to use friendly names
            service: Array.isArray(item.services) && item.services.length > 0
              ? item.services.map((s: any) => SERVICE_ID_TO_NAME[s.service_id] || s.service_id).join(", ")
              : "",
            branch: item.branch_id as Branch,
            pickupNotice,
            allowanceDays,
            paymentStatus,
            contact,
          };
        })
      );
      setRows(mappedRows);
      
      // Fetch customer names
      fetchCustomerNames(mappedRows);
    };
    fetchRows();
  }, []);
  
  // Update rows when customer names are fetched
  useEffect(() => {
    setRows(prev => prev.map(row => ({
      ...row,
      customerName: customerNames[row.customerId] || null
    })));
  }, [customerNames]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleRowClick = (e: React.MouseEvent, rowId: string, rowIndex: number) => {
    if (e.shiftKey && lastIndex !== null) {
      const start = Math.min(lastIndex, rowIndex);
      const end = Math.max(lastIndex, rowIndex);
      const rangeIds = rows.slice(start, end + 1).map((r) => r.lineItemId);
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
            <TableHead className="op-pu-head-transact"><h5>Line Item ID</h5></TableHead>
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
          {rows.map((row, index) => (
            <React.Fragment key={row.lineItemId}>
              <TableRow
                className={`op-body-row ${selected.includes(row.lineItemId) ? "selected" : ""}`}
                onClick={(e) => handleRowClick(e, row.lineItemId, index)}
              >
                <TableCell className={`op-pu-body-transact ${getUpdateColor(row.date)}`}><h5>{row.lineItemId}</h5></TableCell>
                <TableCell className={`op-pu-body-date ${getUpdateColor(row.date)}`}><small>{row.date.toLocaleDateString()}</small></TableCell>
                <TableCell className={`op-pu-body-customer ${getUpdateColor(row.date)}`}>
                  <small>{row.customerName || row.customerId}</small>
                </TableCell>
                <TableCell className={`op-pu-body-shoe ${getUpdateColor(row.date)}`}><small>{row.shoe}</small></TableCell>
                <TableCell className={`op-pu-body-service ${getUpdateColor(row.date)}`}><small>{row.service}</small></TableCell>
                <TableCell className={`op-pu-body-branch ${getUpdateColor(row.date)}`}><small>{row.branch}</small></TableCell>
                <TableCell className={`op-pu-body-pickup-notice ${getUpdateColor(row.date)}`}>
                  {row.pickupNotice && (
                    <>
                      <div>📢 <small>{row.pickupNotice.toLocaleDateString()}</small></div>
                      <div className={
                        row.allowanceDays <= 0
                          ? "text-red-600"
                          : row.allowanceDays <= 3
                          ? "text-yellow-600"
                          : "text-green-600"
                      }>
                        <small>
                          {row.allowanceDays > 0
                            ? `${row.allowanceDays} days left`
                            : `+${Math.abs(row.allowanceDays)} days overdue`}
                        </small>
                      </div>
                    </>
                  )}
                </TableCell>
                <TableCell className={`op-pu-body-payment-status ${getUpdateColor(row.date)}`}>
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
                <TableCell className={`op-pu-body-contact ${getUpdateColor(row.date)}`}><small>{row.contact}</small></TableCell>
                {hiddenColumns.length > 0 && (
                  <TableCell className={`op-pu-body-dropdown-toggle ${getUpdateColor(row.date)}`}>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleExpand(row.lineItemId); }}
                      className={`chevron-btn ${expanded.includes(row.lineItemId) ? "rotate-180" : ""}`}
                    >
                      ▾
                    </button>
                  </TableCell>
                )}
              </TableRow>
              {/* Dropdown card for hidden columns */}
              {expanded.includes(row.lineItemId) && hiddenColumns.length > 0 && (
                <TableRow className="op-body-dropdown-row">
                  <TableCell colSpan={9} className="op-dropdown-cell">
                    <div className="op-dropdown-card">
                      {hiddenColumns.includes("Date") && (
                        <div><h5 className="label">Date</h5> <h5 className="name">{row.date.toLocaleDateString()}</h5></div>
                      )}
                      {hiddenColumns.includes("Customer") && (
                        <div><h5 className="label">Customer</h5> <h5 className="name">{row.customerName || row.customerId}</h5></div>
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
                      {hiddenColumns.includes("PickupNotice") && row.pickupNotice && (
                        <div>
                          <h5 className="label">Pickup Notice</h5>
                          <div>{row.pickupNotice.toLocaleDateString()}</div>
                          <div className={row.allowanceDays < 0 ? "text-red-600" : ""}>
                            {row.allowanceDays >= 0
                              ? `${row.allowanceDays} days left`
                              : `+${Math.abs(row.allowanceDays)} days overdue`}
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
