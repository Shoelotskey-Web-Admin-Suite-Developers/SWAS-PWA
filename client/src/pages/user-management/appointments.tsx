"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

// API imports
import { addUnavailability } from "@/utils/api/addUnavailability"
import { getUnavailabilityWhole } from "@/utils/api/getUnavailabilityFullDay"
import { getUnavailabilityPartial } from "@/utils/api/getUnavailabilityPartialDay"
import { deleteUnavailability } from "@/utils/api/deleteUnavailability"

// Types
interface Appointment {
  id: number
  name: string
  time: string
}

interface Unavailability {
  id: string // 🔹 add id
  date: string
  note: string
  type: "full" | "partial"
  opening?: string
  closing?: string
}

export default function Appointments() {
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date())
  const [inputDate, setInputDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [note, setNote] = useState("")
  const [availabilityType, setAvailabilityType] = useState<"whole" | "custom">("whole")
  const [opening, setOpening] = useState("09:00")
  const [closing, setClosing] = useState("17:00")

  const [appointments] = useState<Record<string, Appointment[]>>({
    "2025-09-07": [
      { id: 1, name: "Angela Dela Peña", time: "09:30" },
      { id: 2, name: "Kevin Tan", time: "10:00" },
      { id: 3, name: "Katrina Bayani", time: "10:30" },
      { id: 4, name: "Bianca Cruz", time: "10:30" },
    ],
    "2025-09-08": [
      { id: 5, name: "Mark Reyes", time: "11:00" },
      { id: 6, name: "Lara Santos", time: "12:00" },
      { id: 7, name: "John Smith", time: "13:30" },
    ],
    "2025-09-09": [
      { id: 8, name: "John Doe", time: "09:00" },
      { id: 9, name: "Alice Lim", time: "14:00" },
    ],
    "2025-09-15": [{ id: 10, name: "Mary Johnson", time: "10:00" }],
    "2025-09-20": [
      { id: 11, name: "David Lee", time: "09:30" },
      { id: 12, name: "Sophia Cruz", time: "11:00" },
      { id: 13, name: "Michael Tan", time: "13:00" },
      { id: 14, name: "Rachel Lim", time: "15:00" },
    ],
    "2025-09-21": [
      { id: 15, name: "John Doe", time: "09:00" },
      { id: 16, name: "Eva Santos", time: "10:30" },
    ],
    "2025-09-22": [{ id: 17, name: "Paul Reyes", time: "11:00" }],
  })

  const [unavailability, setUnavailability] = useState<Unavailability[]>([])

  // Fetch unavailability from API
  const fetchUnavailability = async () => {
    try {
      const whole: Unavailability[] = (await getUnavailabilityWhole()).map((u: any) => ({
      id: u.unavailability_id, // use unavailability_id for delete
      date: u.date_unavailable?.split("T")[0] || "",
      note: u.note || "",
      type: "full" as const,
    }));

    const partial: Unavailability[] = (await getUnavailabilityPartial()).map((u: any) => ({
      id: u.unavailability_id, // use unavailability_id for delete
      date: u.date_unavailable?.split("T")[0] || "",
      note: u.note || "",
      opening: u.time_start || "",
      closing: u.time_end || "",
      type: "partial" as const,
    }));

      setUnavailability([...whole, ...partial])
    } catch (err) {
      console.error("Failed to fetch unavailability:", err)
    }
  }

  useEffect(() => {
    fetchUnavailability()
  }, [])

  // Generate time slots
  const generateTimeSlots = () => {
    const slots: string[] = []
    let start = 10 * 60
    let end = 21 * 60
    while (start < end) {
      const h = Math.floor(start / 60)
      const m = start % 60
      const next = start + 30
      const h2 = Math.floor(next / 60)
      const m2 = next % 60
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} - ${String(h2).padStart(2, "0")}:${String(m2).padStart(2, "0")}`)
      start = next
    }
    return slots
  }
  const timeSlots = generateTimeSlots()

  // Helper to round a time string to nearest 30 minutes
  const roundTo30Min = (time: string) => {
    const [h, m] = time.split(":").map(Number)
    let minutes = h * 60 + m
    minutes = Math.round(minutes / 30) * 30
    const newH = Math.floor(minutes / 60)
    const newM = minutes % 60
    return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`
  }
  
  const toLocalDateString = (d?: Date) => {
    if (!d) return ""; // handle undefined
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const getDayBg = (date: Date) => {
    const dateStr = toLocalDateString(date)
    const hasFull = unavailability.some(u => u.date === dateStr && u.type === "full")
    const hasPartial = unavailability.some(u => u.date === dateStr && u.type === "partial")
    const apptCount = appointments[dateStr]?.length || 0

    if (hasFull) return "bg-gray-300 text-gray-500" // full-day blocks everything

    if (hasPartial) {
      // partial + appointments
      if (apptCount > 0) return "bg-red-500 text-white opacity-60" // red with opacity
      return "bg-white text-gray-500 opacity-60" // partial only
    }

    // normal appointment colors
    if (apptCount === 0) return "bg-white text-black"
    if (apptCount === 1) return "bg-red-100 text-black"
    if (apptCount === 2) return "bg-red-300 text-black"
    return "bg-red-500 text-white"
  }


  const formatDayTitle = (date?: Date) => {
    if (!date) return ""
    const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "short", day: "numeric" }
    return date.toLocaleDateString("en-US", options)
  }

  // Add unavailability handler
  const handleAddUnavailability = async () => {
    if (!inputDate) return;
    const dateStr = new Date(inputDate).toISOString().split("T")[0];
    const type = availabilityType === "whole" ? "Full Day" : "Partial Day";

    // Check if whole day already exists
    const hasFullDay = unavailability.some(u => u.date === dateStr && u.type === "full");
    if (type === "Full Day" && hasFullDay) {
      alert("Cannot add: Whole day unavailability already exists for this date.");
      return;
    }

    // Check if partial overlaps
    if (type === "Partial Day") {
      const newStart = opening;
      const newEnd = closing;

      // If full day exists, block partial too
      if (hasFullDay) {
        alert("Cannot add partial hours: Whole day unavailability already exists for this date.");
        return;
      }

      const overlapping = unavailability
        .filter(u => u.date === dateStr && u.type === "partial")
        .some(u => {
          const existingStart = u.opening || "00:00";
          const existingEnd = u.closing || "23:59";
          return !(newEnd <= existingStart || newStart >= existingEnd); // overlap check
        });

      if (overlapping) {
        alert("Cannot add partial hours: Time range overlaps with existing partial unavailability.");
        return;
      }
    }

    // If all good, proceed to add
    try {
      await addUnavailability(
        dateStr,
        type,
        type === "Partial Day" ? opening : undefined,
        type === "Partial Day" ? closing : undefined,
        note
      );

      setNote("");
      setOpening("09:00");
      setClosing("17:00");
      fetchUnavailability();
    } catch (err) {
      console.error("Failed to add unavailability:", err);
    }
  };

  // Delete unavailability handler
  const handleDeleteUnavailability = async (unv: Unavailability) => {
    try {
      await deleteUnavailability(unv.id);
      // remove from local state instantly
      setUnavailability(prev => prev.filter(u => u.id !== unv.id));
    } catch (err) {
      console.error("Failed to delete unavailability:", err);
      alert("Failed to delete unavailability");
    }
  };


  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 w-full h-full">
      {/* Calendar */}
      <div className="md:col-span-2 w-full h-full">
        <Calendar
          mode="single"
          selected={calendarDate}
          onSelect={setCalendarDate}
          className="rounded-2xl border-[1px] border-[#C7C7C7] h-full w-full p-[2rem]"
          classNames={{
            caption_label: "text-2xl bold text-center mb-2",
            day: "h-[3rem] w-[14.28%] pl-[0.5%] pr-[0.5%] p-0 text-sm",
            day_selected: "border-2 border-[#CE1616]",
            day_today: "bg-gray-200 text-black",
            day_outside: "text-gray-400 opacity-50",
          }}
          components={{
            DayButton: ({ day, modifiers, className, ...props }) => {
              const date = "date" in day ? day.date : day
              const bgClass = getDayBg(date)
              return (
                <button
                  className={cn(
                    "h-full w-full text-sm p-0 flex items-center justify-center rounded relative",
                    bgClass,
                    modifiers.today && !modifiers.selected
                      ? "before:absolute before:-inset-0.5 before:rounded-full before:border-2 before:border-[#FD8989]"
                      : "",
                    modifiers.selected ? "border-2 border-[#CE1616]" : "",
                    className
                  )}
                  {...props}
                >
                  {date.getDate()}
                </button>
              )
            },
          }}
        />
      </div>

      {/* Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between items-center w-full">
              <h1>Time Slot</h1>
              <h3 className="regular text-gray-500">{formatDayTitle(calendarDate)}</h3>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {timeSlots.map((slot) => {
                const todaysAppointments = appointments[toLocalDateString(calendarDate!)]?.filter(a =>
                  slot.startsWith(a.time)
                ) || []
                return (
                  <div
                    key={slot}
                    className={`p-2 rounded-md ${todaysAppointments.length > 0 ? "bg-red-200" : "bg-gray-100"}`}
                  >
                    <div className="flex justify-between text-sm font-medium">
                      <span>{slot}</span>
                      <span>{todaysAppointments.length}/3</span>
                    </div>
                    {todaysAppointments.length > 0 && (
                      <div className="text-xs mt-1">
                        {todaysAppointments.map(a => a.name).join(", ")}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Manage Availability */}
      <Card className="grid-cols-1 md:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle><h1>Manage Availability</h1></CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[0.5fr_0.25fr_0.25fr] gap-4">
          {/* Left Side: Date, Note, Type, Confirm */}
          <div className="grid grid-cols-1 md:col-span-2 lg:col-span-1 gap-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-1">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={inputDate}
                    onChange={(e) => setInputDate(e.target.value)} // update state when user edits
                  />
                </div>
                <div>
                  <Label>Note</Label>
                  <Input value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Type</Label>
                <RadioGroup value={availabilityType} onValueChange={(v: "whole" | "custom") => setAvailabilityType(v)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="whole" id="whole" />
                    <Label htmlFor="whole">Whole Day</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">Custom Hours</Label>
                  </div>
                </RadioGroup>
                {availabilityType === "custom" && (
                  <div className="grid grid-cols-2 gap-2 mt-5">
                    <Input
                      type="time"
                      value={opening}
                      onChange={(e) => setOpening(e.target.value)}
                      onBlur={() => setOpening(roundTo30Min(opening))} // round when losing focus
                    />
                    <Input
                      type="time"
                      value={closing}
                      onChange={(e) => setClosing(e.target.value)}
                      onBlur={() => setClosing(roundTo30Min(closing))} // round when losing focus
                    />
                  </div>
                )}
              </div>
            </div>

            <Button onClick={handleAddUnavailability} className="mt-4 bg-[#CE1616] hover:bg-red-500 text-white extra-bold">
              Confirm
            </Button>
          </div>

          {/* Full Day Table */}
          <div>
            <h3 className="font-semibold mb-2">Full-Day Unv</h3>
            <ScrollArea className="h-32 border rounded-md bg-[#F0F0F0]">
              <div className="p-2 space-y-2">
                {unavailability
                  .filter(u => u.type === "full")
                  .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
                  .map(u => (
                    <div key={u.id} className="grid grid-cols-[1fr_2fr_auto] items-center text-sm bg-[#F0F0F0] border-b-2 border-[#C7C7C7] p-1">
                      <span className="font-medium">{u.date}</span>
                      <span>{u.note}</span>
                      <Trash2 onClick={() => handleDeleteUnavailability(u)} className="w-4 h-4 text-red-600 cursor-pointer justify-self-end" />
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>

          {/* Partial Day Table */}
          <div>
            <h3 className="font-semibold mb-2">Partial-Day Unv</h3>
            <ScrollArea className="h-32 border rounded-md bg-[#F0F0F0]">
              <div className="p-2 space-y-2">
                {unavailability
                  .filter(u => u.type === "partial")
                  .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
                  .map(u => (
                    <div key={u.id} className="grid grid-cols-[1fr_1fr_2fr_auto] items-center text-sm bg-[#F0F0F0] border-b-2 border-[#C7C7C7] p-1">
                      <span className="font-medium">{u.date}</span>
                      <span>{u.opening || "--"} - {u.closing || "--"}</span>
                      <span>{u.note}</span>
                      <Trash2 onClick={() => handleDeleteUnavailability(u)} className="w-4 h-4 text-red-600 cursor-pointer justify-self-end" />
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
