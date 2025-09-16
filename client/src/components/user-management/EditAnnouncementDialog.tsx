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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

// ✅ Match backend fields
export type Announcement = {
  _id: string   // MongoDB ID
  announcement_id: string
  announcement_title: string
  announcement_description: string
  announcement_date: string
}

export function EditAnnouncementDialog({
  open,
  onOpenChange,
  announcement,
  onSave,
  onDelete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  announcement: Announcement
  onSave?: (updated: Announcement) => void
  onDelete?: (id: string) => void
}) {
  const [form, setForm] = React.useState<Announcement>(announcement)

  // Reset form when a different announcement is opened
  React.useEffect(() => {
    setForm(announcement)
  }, [announcement])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-y-auto [&>button]:hidden rounded-xl">
        {/* Delete button */}
        <div className="absolute right-5 top-3 flex gap-2">
          <Button
            className="bg-transparent hover:bg-[#CE1616] active:bg-[#E64040] text-black hover:text-white extra-bold"
            size="icon"
            onClick={() => {
              if (onDelete) onDelete(form._id)
            }}
          >
            <Trash2 className="w-10 h-10" />
          </Button>
        </div>

        <DialogHeader className="items-start text-left">
          <DialogTitle asChild>
            <h1 className="text-xl font-bold">Edit Announcement</h1>
          </DialogTitle>
        </DialogHeader>

        <hr className="my-3 border-gray-300" />

        {/* Announcement Fields */}
        <div className="space-y-4">
          <div>
            <Label>Date Posted</Label>
            <Input
              value={new Date(form.announcement_date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              disabled
            />
          </div>

          <div>
            <Label>Title</Label>
            <Input
              value={form.announcement_title}
              onChange={(e) =>
                setForm({ ...form, announcement_title: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={form.announcement_description}
              onChange={(e) =>
                setForm({ ...form, announcement_description: e.target.value })
              }
              rows={4}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            className="extra-bold border"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-500 text-white extra-bold"
            onClick={() => {
              if (onSave) onSave(form)
              onOpenChange(false)
            }}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
