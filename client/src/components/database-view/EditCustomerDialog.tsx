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
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

// ✅ Import the shared type instead of redefining
import type { CustomerRow } from "@/components/database-view/central-view.types"

export function EditCustomerDialog({
  open,
  onOpenChange,
  customer,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: CustomerRow
}) {
  const [form, setForm] = React.useState<CustomerRow>(customer)

  React.useEffect(() => {
    setForm(customer)
  }, [customer])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl mt-[50px] overflow-y-auto [&>button]:hidden">
        {/* Delete button */}
        <div className="absolute right-5 top-3 flex gap-2">
          <Button
            className="bg-transparent hover:bg-[#CE1616] active:bg-[#E64040] text-black hover:text-white extra-bold"
            size="icon"
            onClick={() => {
              console.log("Delete customer", form.id)
            }}
          >
            <Trash2 className="w-10 h-10" />
          </Button>
        </div>

        <DialogHeader className="items-start text-left">
          <DialogTitle asChild>
            <h1>Edit Customer {form.id}</h1>
          </DialogTitle>
        </DialogHeader>

        {/* Customer Fields */}
        <hr className="section-divider p-0 m-0" />
        <div>
          <h3 className="font-semibold">Customer</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-[25%_25%_1fr]">
            <div>
              <Label>Customer Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Birthday</Label>
              <Input
                type="date"
                value={form.birthday ?? ""}
                onChange={(e) => setForm({ ...form, birthday: e.target.value })}
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={form.address ?? ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div>
              <Label>Contact</Label>
              <Input
                type="tel"
                value={form.contact ?? ""}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email ?? ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <Button className="extra-bold" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-[#CE1616] hover:bg-[#E64040] text-white extra-bold"
            onClick={() => {
              console.log("Save customer", form)
              onOpenChange(false)
            }}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
