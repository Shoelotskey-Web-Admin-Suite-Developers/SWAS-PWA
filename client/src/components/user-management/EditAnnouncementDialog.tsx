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

export type Announcement = {
  id: number
  title: string
  description: string
  date: string
}

export function EditAnnouncementDialog({
  open,
  onOpenChange,
  announcement,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  announcement: Announcement
}) {
  const [form, setForm] = React.useState<Announcement>(announcement)

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
              console.log("Delete Announcement", form.id)
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
            <Input value={form.date} disabled />
          </div>

          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
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
              console.log("Save announcement", form)
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
