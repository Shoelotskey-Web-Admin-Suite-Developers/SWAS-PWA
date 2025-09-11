// NotifSheet.tsx
import React from "react"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

type Warning = {
  transactId: string
  daysOverdue: number
}

const WARNINGS: Warning[] = [
  { transactId: "12345", daysOverdue: 2 },
  { transactId: "98765", daysOverdue: 3 },
  { transactId: "24680", daysOverdue: 5 },
  { transactId: "13579", daysOverdue: 7 },
  { transactId: "11223", daysOverdue: 1 },
  { transactId: "99887", daysOverdue: 10 },
  { transactId: "55555", daysOverdue: 4 },
  { transactId: "66666", daysOverdue: 6 },
]

type Branch = "Valenzuela" | "SM Valenzuela" | "SM Grand"

type Appointment = {
  name: string
  date: string
  timeBlock: string
  branch: Branch
}

const APPOINTMENTS: Appointment[] = [
  {
    name: "Juan Dela Cruz",
    date: "Sept 12, 2025",
    timeBlock: "10:00 AM - 11:00 AM",
    branch: "Valenzuela",
  },
  {
    name: "Maria Santos",
    date: "Sept 13, 2025",
    timeBlock: "1:00 PM - 2:00 PM",
    branch: "SM Valenzuela",
  },
  {
    name: "Pedro Ramirez",
    date: "Sept 14, 2025",
    timeBlock: "3:00 PM - 4:00 PM",
    branch: "SM Grand",
  },
  {
    name: "Ana Villanueva",
    date: "Sept 15, 2025",
    timeBlock: "9:00 AM - 10:00 AM",
    branch: "Valenzuela",
  },
  {
    name: "Carlos Dizon",
    date: "Sept 15, 2025",
    timeBlock: "2:00 PM - 3:00 PM",
    branch: "SM Valenzuela",
  },
  {
    name: "Liza Reyes",
    date: "Sept 16, 2025",
    timeBlock: "11:00 AM - 12:00 PM",
    branch: "SM Grand",
  },
  {
    name: "Miguel Santos",
    date: "Sept 17, 2025",
    timeBlock: "4:00 PM - 5:00 PM",
    branch: "Valenzuela",
  },
  {
    name: "Sofia Cruz",
    date: "Sept 18, 2025",
    timeBlock: "1:30 PM - 2:30 PM",
    branch: "SM Valenzuela",
  },
  {
    name: "Daniel Perez",
    date: "Sept 19, 2025",
    timeBlock: "3:30 PM - 4:30 PM",
    branch: "SM Grand",
  },
]


interface NotifSheetProps {
  children: React.ReactNode
}

export function NotifSheet({ children }: NotifSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>
            <h2>Notifications</h2>
          </SheetTitle>
        </SheetHeader>

        {/* Intro */}
        <div className="mt-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            View your notifications here
          </p>
        </div>

        {/* Warnings Section */}
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <h3>Warnings</h3>
          </div>

          <div className="space-y-2 max-h-[33vh] overflow-y-auto pr-2 scrollbar-thin">
            {WARNINGS.length === 0 ? (
              <p className="text-sm text-muted-foreground">No warnings 🎉</p>
            ) : (
              WARNINGS.map((warning) => (
                <div
                  key={warning.transactId}
                  className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-3 cursor-pointer hover:bg-red-100 transition"
                  onClick={() =>
                    console.log("Go to transaction details", warning.transactId)
                  }
                >
                  <div>
                    <h3 className="text-sm font-medium">
                      Transaction #{warning.transactId}
                    </h3>
                    <p className="text-xs text-red-600 font-semibold">
                      +{warning.daysOverdue} days overdue
                    </p>
                  </div>
                  <span className="text-xs text-red-500">View →</span>
                </div>
              ))
            )}
          </div>

          {/* Separator line */}
          <Separator className="my-4" />

          {/* Pending Appointments Section */}
          <div className="flex items-center gap-2">
            <h3>Pending Appointments</h3>
          </div>

          <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2 scrollbar-thin">
            {APPOINTMENTS.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pending appointments 🎉
              </p>
            ) : (
              APPOINTMENTS.map((appt, index) => (
                <div
                  key={index}
                  className="rounded-md border p-3 flex justify-between items-start hover:bg-accent transition"
                >
                  <div>
                    <h3 className="text-sm font-medium">{appt.name}</h3>
                    <p className="text-xs text-muted-foreground">{appt.date}</p>
                    <p className="text-xs text-muted-foreground">{appt.timeBlock}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* Branch in upper right */}
                    <h4 className="text-xs font-medium text-muted-foreground bold">{appt.branch}</h4>

                    <div className="flex gap-2">
                      <button className="px-2 py-1 text-xs rounded-md bg-green-100 text-green-700 hover:bg-green-200">
                        Acknowledge
                      </button>
                      <button className="px-2 py-1 text-xs rounded-md bg-red-100 text-red-700 hover:bg-red-200">
                        Trash
                      </button>
                    </div>
                  </div>
                </div>

              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
