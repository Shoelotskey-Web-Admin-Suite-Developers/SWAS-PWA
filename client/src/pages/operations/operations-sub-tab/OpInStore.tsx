// src/components/OpInStore.tsx
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import MarkAsReadyForPickupModal from "@/components/operations/modals/OpISModal"
import { getLineItems } from "@/utils/api/getLineItems";
import { editLineItemStatus } from "@/utils/api/editLineItemStatus";
import { getUpdateColor } from "@/utils/getUpdateColor";

type Branch = "Valenzuela" | "SM Valenzuela" | "SM Grand";
type Location = "Branch" | "Hub" | "To Branch" | "To Hub";

type Row = {
  lineItemId: string;
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

export default function OpInStore() {
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [lastIndex, setLastIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]); 
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [modalOpen, setModalOpen] = useState(false);

  // --- helpers ---
  const mapItem = (item: any): Row => ({
    lineItemId: item.line_item_id,
    date: new Date(item.latest_update),
    customer: item.cust_id,
    shoe: item.shoes,
    service: item.service_id,
    branch: item.branch_id as Branch,
    Location: item.current_location as Location,
    status: item.current_status,
    isRush: item.priority === "Rush",
    dueDate: item.due_date ? new Date(item.due_date) : new Date(),
    updated: new Date(item.latest_update),
  });

  const mapItems = (items: any[]): Row[] => items.map(mapItem);

  const sortByDueDate = (items: Row[]) =>
    [...items].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  // Fetch line items from API -- Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      const data = await getLineItems("To Pack");
      setRows(sortByDueDate(mapItems(data)));
    };
    fetchData();
  }, []);

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
            <TableHead className="op-head-transact"><h5>Line Item ID</h5></TableHead>
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
          {rows.map((row, index) => (
            <React.Fragment key={row.lineItemId}>
              <TableRow
                className={`op-body-row ${selected.includes(row.lineItemId) ? "selected" : ""}`}
                onClick={(e) => handleRowClick(e, row.lineItemId, index)}
              >
                <TableCell className={`op-body-action ${getUpdateColor(row.updated)}`} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.includes(row.lineItemId)}
                    onChange={() => toggleCheckbox(row.lineItemId, index)}
                  />
                </TableCell>
                <TableCell className={`op-body-transact ${getUpdateColor(row.updated)}`}><h5>{row.lineItemId}</h5></TableCell>
                <TableCell className={`op-body-date ${getUpdateColor(row.updated)}`}><small>{row.date.toLocaleDateString()}</small></TableCell>
                <TableCell className={`op-body-customer ${getUpdateColor(row.updated)}`}><small>{row.customer}</small></TableCell>
                <TableCell className={`op-body-shoe ${getUpdateColor(row.updated)}`}><small>{row.shoe}</small></TableCell>
                <TableCell className={`op-body-service ${getUpdateColor(row.updated)}`}><small>{row.service}</small></TableCell>
                <TableCell className={`op-body-branch ${getUpdateColor(row.updated)}`}><small>{row.branch}</small></TableCell>
                <TableCell className={`op-body-location ${getUpdateColor(row.updated)}`}><small>{row.Location}</small></TableCell>
                <TableCell className={`op-body-status op-status-is ${getUpdateColor(row.updated)}`}><h5>{row.status}</h5></TableCell>
                <TableCell className={`op-body-rush ${getUpdateColor(row.updated)}`}>
                  {row.isRush ? (
                    <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-medium">Rush</span>
                  ) : (
                    <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">Normal</span>
                  )}
                </TableCell>
                <TableCell className={`op-body-due ${getUpdateColor(row.updated)}`}><small>{row.dueDate.toLocaleDateString()}</small></TableCell>
                <TableCell className={`op-body-mod ${getUpdateColor(row.updated)}`}><small>{row.updated.toLocaleDateString()}</small></TableCell>
                {hiddenColumns.length > 0 && (
                  <TableCell className={`op-body-dropdown-toggle ${getUpdateColor(row.updated)}`}>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleExpand(row.lineItemId); }}
                      className={`chevron-btn ${expanded.includes(row.lineItemId) ? "rotate-180" : ""}`}
                    >
                      ▾
                    </button>
                  </TableCell>
                )}
              </TableRow>

              {/* Dropdown card */}
              {expanded.includes(row.lineItemId) && hiddenColumns.length > 0 && (
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
          className="op-btn-is op-btn text-white bg-[#0E9CFF] button-md disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={selected.length === 0}
          onClick={() => setModalOpen(true)}
        >
          <h5>Mark As Ready for Pickup</h5>
        </button>
        <MarkAsReadyForPickupModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          selectedCount={selected.length}
          onConfirm={async () => {
            try {
              // 1. Call API to update status
              await editLineItemStatus(selected, "Ready for Pickup");

              // 2. Remove updated items from local state
              setRows((prevRows) =>
                prevRows.filter((row) => !selected.includes(row.lineItemId))
              );

              // 3. Clear selection
              setSelected([]);

              // 4. Close modal
              setModalOpen(false);

              toast.success("Selected items marked as Ready for Pickup!"); // Success toast
            } catch (error) {
              console.error("Failed to update line items status:", error);
              toast.error("Failed to update items. Please try again."); // Error toast
            }
          }}
        />
      </div>
    </div>
  );
}
