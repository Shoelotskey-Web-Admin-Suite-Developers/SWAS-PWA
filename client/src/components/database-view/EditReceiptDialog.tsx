"use client"
import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Trash2, X } from "lucide-react"

// ✅ Import shared types
import { ReceiptRow, Branch, TxStatusDates, PaymentStatus} from "./central-view.types"


export function EditReceiptDialog({
  open,
  onOpenChange,
  receipt,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  receipt: ReceiptRow
}) {
  const [form, setForm] = React.useState<ReceiptRow>(receipt)

  React.useEffect(() => {
    setForm(receipt)
  }, [receipt])

  const remainingBalance = (form?.total ?? 0) - (form?.amountPaid ?? 0)

  const fmtDateInput = (d?: Date | null) => {
    if (!d) return ""
    try {
      const date = typeof d === "string" ? new Date(d) : d
      if (Number.isNaN(date.getTime())) return ""
      return date.toISOString().slice(0, 10)
    } catch {
      return ""
    }
  }

  const SERVICE_OPTIONS = ["Basic Cleaning", "Minor Reglue", "Full Reglue"]
  const ADDITIONAL_OPTIONS = [
    "Unyellowing",
    "Minor Retouch",
    "Minor Restoration",
    "Additional Layer",
    "Color Retouch (2 colors)",
    "Color Retouch (3 colors)",
  ]

  const STATUS_LABELS: Array<{ key: keyof TxStatusDates; label: string }> = [
    { key: "queued", label: "Queued" },
    { key: "readyForDelivery", label: "Ready for delivery" },
    { key: "toWarehouse", label: "To warehouse" },
    { key: "inProcess", label: "In process" },
    { key: "returnToBranch", label: "Return to branch" },
    { key: "received", label: "Received" },
    { key: "readyForPickup", label: "Ready for pickup" },
    { key: "pickedUp", label: "Picked up" },
  ]

  const includesIgnoreCase = (arr: string[] | undefined, value: string) =>
    !!arr?.some((s) => s.toLowerCase().trim() === value.toLowerCase().trim())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh] mt-[50px] overflow-y-auto [&>button]:hidden">
        {/* Delete button */}
        <div className="absolute right-5 top-3 flex gap-2">
          <Button
            variant="destructive"
            size="icon"
            onClick={() => {
              console.log("Delete receipt", form.id)
            }}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>

        <DialogHeader className="items-start text-left">
          <DialogTitle asChild>
            <h1>Edit Receipt {form.id}</h1>
          </DialogTitle>
        </DialogHeader>

        {/* Customer Section */}
        <hr className="section-divider p-0 m-0" />
        <div>
          <h3 className="font-semibold">Customer</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-5">
            <div>
              <Label>Name</Label>
              <Input
                value={form.customer}
                onChange={(e) =>
                  setForm({ ...form, customer: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Birthday</Label>
              <Input
                type="date"
                value={form.customerBirthday ?? ""}
                onChange={(e) =>
                  setForm({ ...form, customerBirthday: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={form.address ?? ""} disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email ?? ""} disabled />
            </div>
            <div>
              <Label>Contact</Label>
              <Input value={form.contact ?? ""} disabled />
            </div>
          </div>
        </div>

        {/* Branch Section */}
        <hr className="section-divider p-0 m-0" />
        <div>
          <h3 className="font-semibold">Branch</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-5">
            <div>
              <Label>Branch</Label>
              <Select
                value={form.branch}
                onValueChange={(v) =>
                  setForm({ ...form, branch: v as Branch })
                }
                disabled
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SM Valenzuela">SM Valenzuela</SelectItem>
                  <SelectItem value="Valenzuela">Valenzuela</SelectItem>
                  <SelectItem value="SM Grand">SM Grand</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.branchLocation} disabled />
            </div>
            <div>
              <Label>Received By</Label>
              <Input
                value={form.receivedBy}
                onChange={(e) =>
                  setForm({ ...form, receivedBy: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Date In</Label>
              <Input
                type="date"
                value={fmtDateInput(form.dateIn)}
                onChange={(e) =>
                  setForm({ ...form, dateIn: new Date(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>Date Out</Label>
              <Input
                type="date"
                value={fmtDateInput(form.dateOut ?? null)}
                onChange={(e) =>
                  setForm({ ...form, dateOut: new Date(e.target.value) })
                }
              />
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <hr className="section-divider p-0 m-0" />
        <div>
          <h3 className="font-semibold">Payment</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-4">
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({ ...form, status: v as PaymentStatus })
                }
                disabled
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">PAID</SelectItem>
                  <SelectItem value="PARTIAL">PARTIAL</SelectItem>
                  <SelectItem value="NP">NP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Total</Label>
              <Input
                type="number"
                value={form.total}
                onChange={(e) =>
                  setForm({ ...form, total: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>Amount Paid</Label>
              <Input
                type="number"
                value={form.amountPaid}
                onChange={(e) =>
                  setForm({ ...form, amountPaid: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>Remaining Balance</Label>
              <Input value={remainingBalance} disabled />
            </div>
          </div>
        </div>

        {/* Transactions */}
        <hr className="section-divider p-0 m-0" />
        <div className="space-y-4">
          <h3 className="font-semibold">Transactions</h3>
          {form.transactions?.map((t, idx) => (
            <div key={t.id} className="p-3 border rounded-md space-y-3">
              {/* Shoe model + transaction ID */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Transaction ID</Label>
                  <Input value={t.id} disabled />
                </div>
                <div>
                  <Label>Shoe Model</Label>
                  <Input
                    value={t.shoeModel}
                    onChange={(e) =>
                      setForm((prev) => {
                        const newTx = [...(prev.transactions ?? [])]
                        newTx[idx].shoeModel = e.target.value
                        return { ...prev, transactions: newTx }
                      })
                    }
                  />
                </div>
              </div>

              {/* Services / Additional / Rush / Status */}
              <div className="grid gap-4 grid-cols-3 sm:grid-cols-[1fr_1fr_0.5fr_2fr]">
                {/* Services */}
                <div>
                  <Label>Services</Label>
                  <div className="flex flex-col flex-wrap gap-1 mt-1">
                    {SERVICE_OPTIONS.map((opt) => (
                      <label key={opt} className="flex items-center space-x-2">
                        <Checkbox
                          checked={includesIgnoreCase(t.serviceNeeded, opt)}
                          onCheckedChange={(checked) =>
                            setForm((prev) => {
                              const newTx = [...(prev.transactions ?? [])]
                              const arr = newTx[idx].serviceNeeded
                              if (checked) {
                                if (!arr.includes(opt)) arr.push(opt)
                              } else {
                                const i = arr.indexOf(opt)
                                if (i > -1) arr.splice(i, 1)
                              }
                              return { ...prev, transactions: newTx }
                            })
                          }
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Additional */}
                <div>
                  <Label>Additional</Label>
                  <div className="flex flex-col flex-wrap gap-1 mt-1">
                    {ADDITIONAL_OPTIONS.map((opt) => (
                      <label key={opt} className="flex items-center space-x-2">
                        <Checkbox
                          checked={includesIgnoreCase(t.additional, opt)}
                          onCheckedChange={(checked) =>
                            setForm((prev) => {
                              const newTx = [...(prev.transactions ?? [])]
                              const arr = newTx[idx].additional
                              if (checked) {
                                if (!arr.includes(opt)) arr.push(opt)
                              } else {
                                const i = arr.indexOf(opt)
                                if (i > -1) arr.splice(i, 1)
                              }
                              return { ...prev, transactions: newTx }
                            })
                          }
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rush */}
                <div>
                  <Label>Rush</Label>
                  <RadioGroup
                    value={t.rush ? "yes" : "no"}
                    className="mt-1"
                    onValueChange={(v) =>
                      setForm((prev) => {
                        const newTx = [...(prev.transactions ?? [])]
                        newTx[idx].rush = v === "yes"
                        return { ...prev, transactions: newTx }
                      })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id={`rush-yes-${idx}`} />
                      <Label htmlFor={`rush-yes-${idx}`}>Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id={`rush-no-${idx}`} />
                      <Label htmlFor={`rush-no-${idx}`}>No</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Status timeline */}
                <div>
                  <Label>Status: {t.status || "—"}</Label>
                  <div className="mt-1 space-y-1 text-sm">
                    {(() => {
                      const statusEntries = STATUS_LABELS.map(({ key, label }) => ({
                        key,
                        label,
                        value: t.statusDates?.[key],
                      }))
                      const lastFilledIndex = statusEntries
                        .map((e) => !!e.value)
                        .lastIndexOf(true)

                      return statusEntries.slice(0, lastFilledIndex + 1).map(({ key, label, value }, i) => {
                        const isCurrent = i === lastFilledIndex
                        return (
                          <div key={key} className="relative flex items-center gap-2">
                            {/* Remove last status */}
                            {isCurrent && (
                              <Button
                                type="button"
                                variant="unselected"
                                size="icon"
                                className="absolute -left-3"
                                onClick={() => {
                                  setForm((prev) => {
                                    const newTx = [...(prev.transactions ?? [])]
                                    newTx[idx].statusDates = {
                                      ...newTx[idx].statusDates,
                                      [key]: null,
                                    }
                                    const prevKey = statusEntries[lastFilledIndex - 1]?.key
                                    newTx[idx].status = prevKey ? prevKey : ""
                                    return { ...prev, transactions: newTx }
                                  })
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}

                            <span className="ml-8 min-w-[120px]">{label}:</span>
                            <Input
                              type="date"
                              value={value ?? ""}
                              onChange={(e) => {
                                const updatedDate = e.target.value
                                setForm((prev) => {
                                  const newTx = [...(prev.transactions ?? [])]
                                  newTx[idx].statusDates = {
                                    ...newTx[idx].statusDates,
                                    [key]: updatedDate,
                                  }
                                  newTx[idx].status = key
                                  return { ...prev, transactions: newTx }
                                })
                              }}
                            />
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="flex items-center gap-2">
                <Label className="min-w-[120px]">Before Image</Label>
                <Input
                  value={t.beforeImage ?? ""}
                  onChange={(e) => {
                    const val = e.target.value
                    setForm((prev) => {
                      const newTx = [...(prev.transactions ?? [])]
                      newTx[idx].beforeImage = val
                      return { ...prev, transactions: newTx }
                    })
                  }}
                />
                <Button variant="outline" size="icon">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Label className="min-w-[120px]">After Image</Label>
                <Input
                  value={t.afterImage ?? ""}
                  onChange={(e) => {
                    const val = e.target.value
                    setForm((prev) => {
                      const newTx = [...(prev.transactions ?? [])]
                      newTx[idx].afterImage = val
                      return { ...prev, transactions: newTx }
                    })
                  }}
                />
                <Button variant="outline" size="icon">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button className="bg-[#CE1616] hover:bg-[#E64040] text-white">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
