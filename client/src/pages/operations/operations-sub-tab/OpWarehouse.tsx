// src/components/OpWarehouse.tsx
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCustomerName } from "@/utils/api/getCustomerName";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import ReturnToBranchModal from "@/components/operations/modals/OpWHModal"
import OpAfrImg from "@/components/operations/modals/OpAfrImg";
import { getLineItems } from "@/utils/api/getLineItems";
import { editLineItemStatus } from "@/utils/api/editLineItemStatus";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { getUpdateColor } from "@/utils/getUpdateColor";
import { updateDates } from "@/utils/api/updateDates";

type Branch = "Valenzuela" | "SM Valenzuela" | "SM Grand";
type Location = "Branch" | "Hub" | "To Branch" | "To Hub";

type Row = {
  lineItemId: string;
  date: Date;
  customerId: string; // changed from customer
  customerName: string | null; // added
  shoe: string;
  service: string;
  branch: Branch;
  Location: Location;
  status: string;
  isRush: boolean;
  dueDate: Date;  
  updated: Date;
  before_img?: string | null;
  after_img?: string | null;
};

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
}

export default function OpWarehouse() {
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [lastIndex, setLastIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeLineItemId, setActiveLineItemId] = useState<string | null>(null);
  const [customerNames, setCustomerNames] = useState<Record<string, string | null>>({});

  // --- helpers ---
  const mapItem = (item: any): Row => ({
    lineItemId: item.line_item_id,
    date: new Date(item.latest_update),
    customerId: item.cust_id,
    customerName: customerNames[item.cust_id] || null,
    shoe: item.shoes,
    service: item.services?.map((s: any) => SERVICE_ID_TO_NAME[s.service_id] || s.service_id).join(", ") || "",
    branch: item.branch_id as Branch,
    Location: item.current_location as Location,
    status: item.current_status,
    isRush: item.priority === "Rush",
    dueDate: item.due_date ? new Date(item.due_date) : new Date(),
    updated: new Date(item.latest_update),
    before_img: item.before_img || null,
    after_img: item.after_img || null,
  });

  const mapItems = (items: any[]): Row[] => items.map(mapItem);

  const sortByDueDate = (items: Row[]) =>
    [...items].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

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

  // Fetch line items from API -- Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      const data = await getLineItems("In Process");
      const mappedItems = mapItems(data);
      setRows(sortByDueDate(mappedItems));
      
      // Fetch customer names
      fetchCustomerNames(mappedItems);
    };
    fetchData();
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

  const getHiddenColumns = () => {
    if (windowWidth <= 899) return ["Action", "Customer", "Due", "Branch", "Mod", "Shoe", "Date", "Location", "Status"];
    if (windowWidth <= 1124) return ["Mod", "Shoe", "Date", "Location", "Status"];
    if (windowWidth <= 1312) return ["Location", "Status"];
    return [];
  };

  const hiddenColumns = getHiddenColumns();

  const handleUploadAfterImage = (lineItemId: string) => {
    setTimeout(() => {
      setActiveLineItemId(lineItemId);
      setUploadModalOpen(true);
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, 50);
  };

  const handleCloseUploadModal = () => {
    setUploadModalOpen(false);
    setActiveLineItemId(null);
    (document.activeElement instanceof HTMLElement) && document.activeElement.blur();
  };

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
              <ContextMenu>
                <ContextMenuTrigger asChild>
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
                    <TableCell className={`op-body-transact ${getUpdateColor(row.updated)}`}><h5 className="text-[#000000]">{row.lineItemId}</h5></TableCell>
                    <TableCell className={`op-body-date ${getUpdateColor(row.updated)}`}><small>{row.date.toLocaleDateString()}</small></TableCell>
                    <TableCell className={`op-body-customer ${getUpdateColor(row.updated)}`}>
                      <small>{row.customerName || row.customerId}</small>
                    </TableCell>
                    <TableCell className={`op-body-shoe ${getUpdateColor(row.updated)}`}><small>{row.shoe}</small></TableCell>
                    <TableCell className={`op-body-service ${getUpdateColor(row.updated)}`}><small>{row.service}</small></TableCell>
                    <TableCell className={`op-body-branch ${getUpdateColor(row.updated)}`}><small>{row.branch}</small></TableCell>
                    <TableCell className={`op-body-location ${getUpdateColor(row.updated)}`}><small>{row.Location}</small></TableCell>
                    <TableCell className={`op-body-status op-status-wh ${getUpdateColor(row.updated)}`}><h5>{row.status}</h5></TableCell>
                    <TableCell className={`op-body-rush ${getUpdateColor(row.updated)}`}>
                      {row.isRush ? (
                        <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-medium">Rush</span>
                      ) : (
                        <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">Normal</span>
                      )}
                    </TableCell>
                    <TableCell className={`op-body-due ${getUpdateColor(row.updated)}`}><small>{row.dueDate.toLocaleDateString()}</small></TableCell>
                    <TableCell className={`op-body-mod ${getUpdateColor(row.updated)}`}>
                      <small>
                        {row.updated.toLocaleDateString()}
                        {row.after_img
                          ? <span title="After image uploaded"><h6>A_IMG ✓</h6></span>
                          : <span title="No after image"></span>
                        }
                        {row.before_img
                          ? <span title="Before image uploaded"><h6>B_IMG ✓</h6></span>
                          : <span title="No before image"></span>
                        }
                      </small>
                    </TableCell>
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
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuLabel>Actions</ContextMenuLabel>
                  <ContextMenuSeparator />
                  <ContextMenuItem onSelect={() => handleUploadAfterImage(row.lineItemId)}>
                    Upload After Image
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>

              {expanded.includes(row.lineItemId) && hiddenColumns.length > 0 && (
                <TableRow className="op-body-dropdown-row">
                  <TableCell colSpan={12} className="op-dropdown-cell">
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
          className="op-btn-wh op-btn text-white bg-[#0E9CFF] button-md disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={selected.length === 0}
          onClick={() => setModalOpen(true)}
        >
          <h5>Return to Branch</h5>
        </button>

        <ReturnToBranchModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          selectedCount={selected.length}
          onConfirm={async () => {
            try {
              // Update Dates for each selected line item
              const now = new Date().toISOString();
              await Promise.all(
                selected.map(async (lineItemId) => {
                  try {
                    await updateDates(lineItemId, {
                      rb_date: now,
                      current_status: 5,
                    });
                  } catch (err) {
                    console.error(`Failed to update Dates for ${lineItemId}:`, err);
                  }
                })
              );

              await editLineItemStatus(selected, "Returning to Branch");
              setRows((prevRows) =>
                prevRows.filter((row) => !selected.includes(row.lineItemId))
              );
              setSelected([]);
              setModalOpen(false);
              toast.success("Selected items returned to branch!");
            } catch (error) {
              console.error("Failed to update line items status:", error);
              toast.error("Failed to update items. Please try again.");
            }
          }}
        />

        <OpAfrImg
          open={uploadModalOpen}
          onOpenChange={handleCloseUploadModal}
          lineItemId={activeLineItemId}
          onImageUploaded={(lineItemId, url) => {
            setRows(prevRows =>
              prevRows.map(row =>
                row.lineItemId === lineItemId
                  ? { ...row, after_img: url }
                  : row
              )
            );
          }}
        />
      </div>
    </div>
  );
}
