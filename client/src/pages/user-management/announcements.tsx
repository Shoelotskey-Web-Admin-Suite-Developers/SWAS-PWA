"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, isBefore, isAfter, isSameDay, eachDayOfInterval } from "date-fns"
import type { DateRange } from "react-day-picker"

type Announcement = {
  id: number
  title: string
  description: string
  date: string
}

type Promo = {
  id: number
  title: string
  description: string
  duration: string
}

export default function Announcements() {
  // Dummy data
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 1,
      title: "📦 New Drop-off Hours for Warehouse",
      description: "We've updated our warehouse drop-off times.",
      date: "June 8, 2025",
    },
    {
      id: 2,
      title: "⏰ Early Closing Notice",
      description: "Branches will close earlier than usual.",
      date: "June 7, 2025",
    },
  ])

  const [promos, setPromos] = useState<Promo[]>([
    {
      id: 1,
      title: "🔥 Promo Alert – Rainy Day Discount",
      description: "Enjoy discounts during rainy days.",
      duration: "June 1–15, 2025",
    },
  ])

  // Form states
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [promoTitle, setPromoTitle] = useState("")
  const [promoDescription, setPromoDescription] = useState("")
  const [promoDates, setPromoDates] = useState<Date[]>([]) // included dates
  const [promoRange, setPromoRange] = useState<DateRange | undefined>()

  // 🔹 Group continuous dates into ranges
  const groupContinuousDays = (dates: Date[]): string => {
    if (dates.length === 0) return ""
    const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime())

    const groups: Date[][] = []
    let currentGroup: Date[] = [sorted[0]]

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const curr = sorted[i]
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)

      if (diff === 1) {
        currentGroup.push(curr)
      } else {
        groups.push(currentGroup)
        currentGroup = [curr]
      }
    }
    groups.push(currentGroup)

    return groups
      .map((g) => {
        if (g.length === 1) {
          return format(g[0], "MMM d, yyyy")
        } else {
          return `${format(g[0], "MMM d")}–${format(
            g[g.length - 1],
            g[0].getFullYear() !== g[g.length - 1].getFullYear()
              ? "MMM d, yyyy"
              : "d, yyyy"
          )}`
        }
      })
      .join(", ")
  }

  // Add announcement
  const handleAddAnnouncement = () => {
    if (!newTitle || !newDescription) return alert("Fill out all fields")
    setAnnouncements([
      {
        id: Date.now(),
        title: newTitle,
        description: newDescription,
        date: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      },
      ...announcements,
    ])
    setNewTitle("")
    setNewDescription("")
  }

  // Handle calendar clicks
  const handleDayClick = (day: Date) => {
    const from = promoRange?.from
    const to = promoRange?.to

    if (!from) {
      setPromoRange({ from: day, to: undefined })
      setPromoDates([day])
      return
    }

    if (from && !to) {
      if (isSameDay(day, from)) {
        setPromoRange(undefined)
        setPromoDates([])
        return
      }
      if (isBefore(day, from)) {
        setPromoRange({ from: day, to: undefined })
        setPromoDates([day])
        return
      }
      const days = eachDayOfInterval({ start: from, end: day })
      setPromoRange({ from, to: day })
      setPromoDates(days)
      return
    }

    if (from && to) {
      if (isSameDay(day, from) || isSameDay(day, to)) {
        setPromoRange(undefined)
        setPromoDates([])
        return
      }
      if (isBefore(day, from) || isAfter(day, to)) {
        setPromoRange({ from: day, to: undefined })
        setPromoDates([day])
        return
      }
      setPromoDates((prev) => {
        const exists = prev.some((d) => isSameDay(d, day))
        if (exists) {
          return prev.filter((d) => !isSameDay(d, day))
        } else {
          return [...prev, day].sort((a, b) => a.getTime() - b.getTime())
        }
      })
      return
    }
  }

  // Add promo
  const handleAddPromo = () => {
    if (!promoTitle || promoDates.length === 0 || !promoDescription)
      return alert("Fill out all fields")

    setPromos([
      {
        id: Date.now(),
        title: promoTitle,
        description: promoDescription,
        duration: groupContinuousDays(promoDates),
      },
      ...promos,
    ])
    setPromoTitle("")
    setPromoDescription("")
    setPromoDates([])
    setPromoRange(undefined)
  }

  return (
    <div className="min-h-screen p-6 flex flex-col justify-between gap-8">
      {/* Announcements Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {/* Create first on mobile */}
        <Card className="order-1 md:order-2 h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-bold"><h1>Create Announcement</h1></CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>Title</Label>
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <Label>Description</Label>
            <Input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <Button
              className="bg-[#CE1616] hover:bg-red-500 text-white w-full mt-5 extra-bold"
              onClick={handleAddAnnouncement}
            >
              Post Announcement
            </Button>
          </CardContent>
        </Card>

        <Card className="order-2 md:order-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold"><h1>Current Announcements</h1></CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {announcements.map((a) => (
              <Card
                key={a.id}
                className="rounded-xl p-4 flex flex-col justify-between shadow-sm border"
              >
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-gray-500">{a.date}</span>
                  <h3 className="font-semibold text-base">{a.title}</h3>
                  <p className="text-sm text-gray-700">{a.description}</p>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    size="sm"
                    className="border-2 border-[#CE1616] bg-white hover:bg-red-200 text-[#CE1616] extra-bold"
                    onClick={() => alert(`Edit announcement: ${a.id}`)}
                  >
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Promos Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {/* Create first on mobile */}
        <Card className="order-1 md:order-2 h-fit">
          <CardHeader>
            <CardTitle><h1>Create Promo Notice</h1></CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>Title</Label>
            <Input value={promoTitle} onChange={(e) => setPromoTitle(e.target.value)} />

            <Label>Duration</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal border-1 border-black rounded-full">
                  {promoDates.length > 0
                    ? groupContinuousDays(promoDates)
                    : "Select dates"}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-2 space-y-3">
                <Calendar
                  mode="single"
                  selected={promoRange?.from ?? undefined}
                  onDayClick={handleDayClick}
                  modifiers={{
                    inRange: (d: Date) => {
                      if (!promoRange?.from || !promoRange?.to) return false
                      return (
                        !isBefore(d, promoRange.from) &&
                        !isAfter(d, promoRange.to) &&
                        promoDates.some((pd) => isSameDay(pd, d))
                      )
                    },
                    rangeStart: (d: Date) =>
                      !!promoRange?.from && isSameDay(d, promoRange.from),
                    rangeEnd: (d: Date) =>
                      !!promoRange?.to && isSameDay(d, promoRange.to),
                  }}
                  modifiersStyles={{ 
                    inRange: { border: "2px dashed #FD8989", borderRadius: "6px", }, 
                    rangeStart: { border: "2px solid #e3342f", color: "white", borderRadius: "6px", zIndex: "999", }, 
                    rangeEnd: { border: "2px solid #e3342f", color: "white", borderRadius: "6px", }, 
                  }}
                />
                <p className="text-xs text-gray-500">
                  Click start, then end. Click inside to remove/add days.
                  Click outside or on start/end to reset.
                </p>
              </PopoverContent>
            </Popover>

            <Label>Description</Label>
            <Input
              value={promoDescription}
              onChange={(e) => setPromoDescription(e.target.value)}
            />

            <Button
              className="bg-[#CE1616] hover:bg-red-500 text-white w-full mt-5 extra-bold"
              onClick={handleAddPromo}
            >
              Post Promo Notice
            </Button>
          </CardContent>
        </Card>

        <Card className="order-2 md:order-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold"><h1>Current Promo Notices</h1></CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {promos.map((p) => (
              <Card
                key={p.id}
                className="rounded-xl p-4 flex flex-col justify-between shadow-sm border"
              >
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-gray-500">{p.duration}</span>
                  <h3 className="font-semibold text-base">{p.title}</h3>
                  <p className="text-sm text-gray-700">{p.description}</p>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    size="sm"
                    className="border-2 border-[#CE1616] bg-white hover:bg-red-200 text-[#CE1616] extra-bold"
                    onClick={() => alert(`Edit promo: ${p.id}`)}
                  >
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
