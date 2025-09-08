"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

type Announcement = {
  id: number
  title: string
  message: string
  date: string
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")

  const handleAdd = () => {
    if (!title || !message) {
      alert("Please fill out all fields")
      return
    }

    const newAnnouncement: Announcement = {
      id: Date.now(),
      title,
      message,
      date: format(new Date(), "PPP"),
    }

    setAnnouncements([newAnnouncement, ...announcements])
    setTitle("")
    setMessage("")
  }

  const handleDelete = (id: number) => {
    setAnnouncements(announcements.filter((a) => a.id !== id))
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Add Announcement Form */}
      <Card className="shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Create Announcement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter announcement title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
          </div>

          <Button className="w-full" onClick={handleAdd}>
            Post Announcement
          </Button>
        </CardContent>
      </Card>

      {/* List of Announcements */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <p className="text-gray-500 text-center">No announcements yet</p>
        ) : (
          announcements.map((a) => (
            <Card key={a.id} className="shadow-sm rounded-xl">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-lg font-semibold">{a.title}</CardTitle>
                <span className="text-sm text-gray-500">{a.date}</span>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-gray-700">{a.message}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert("Edit feature coming soon")}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(a.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
