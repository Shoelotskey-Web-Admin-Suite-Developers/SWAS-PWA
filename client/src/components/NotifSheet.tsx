// NotifSheet.tsx
import React, { useEffect, useState } from "react"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { getAppointmentsPending } from "@/utils/api/getAppointmentsPending"
import { updateAppointmentStatus } from "@/utils/api/updateAppointmentStatus"
import { getCustomerName } from "@/utils/api/getCustomerName"
import { getBranchByBranchId } from "@/utils/api/getBranchByBranchId"
import { useAppointmentUpdates } from "@/hooks/useAppointmentUpdates"

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

type Appointment = {
  appointment_id: string
  cust_id?: string
  date_for_inquiry?: string
  time_start?: string
  time_end?: string
  branch_id?: string
  status?: string
  // display fields
  name?: string
}


interface NotifSheetProps {
  children: React.ReactNode
}

export function NotifSheet({ children }: NotifSheetProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])

  const fetchPending = async () => {
    try {
      const data = await getAppointmentsPending();
      const items = data || []
      // filter to keep present and future only
      const today = new Date()
      today.setHours(0,0,0,0)
      const upcoming = items.filter((appt: any) => {
        if (!appt.date_for_inquiry) return true // keep if no date
        const d = new Date(appt.date_for_inquiry)
        d.setHours(0,0,0,0)
        return d >= today
      })

      // enrich with customer name and branch name (batched)
      const enriched = await Promise.all(
        upcoming.map(async (appt: any) => {
          const name = await resolveCustomerName(appt.cust_id)
          const branch_name = await resolveBranchName(appt.branch_id)
          return {
            ...appt,
            name: name || appt.cust_id,
            branch_name: branch_name || appt.branch_id,
          }
        })
      )

      setAppointments(enriched)
    } catch (err) {
      console.error("Failed to fetch pending appointments:", err)
    }
  }

  useEffect(() => {
    fetchPending()
  }, [])

  // subscribe to real-time appointment changes and refresh when they occur
  const { changes: appointmentChanges } = useAppointmentUpdates()
  useEffect(() => {
    if (appointmentChanges) {
      // small debounce to avoid rapid repeated fetches
      const t = setTimeout(() => fetchPending(), 300)
      return () => clearTimeout(t)
    }
  }, [appointmentChanges])

  const handleUpdateStatus = async (appointment_id: string, status: "Approved" | "Cancelled") => {
    try {
      await updateAppointmentStatus(appointment_id, status)
      toast.success(`Appointment ${status === 'Approved' ? 'acknowledged' : 'cancelled'}`)
      await fetchPending()
    } catch (err) {
      console.error("Failed to update appointment status:", err)
      toast.error("Failed to update appointment")
    }
  }

  // helpers to resolve customer and branch names with small caches
  const customerCache = React.useRef<Record<string, string | null>>({})
  const branchCache = React.useRef<Record<string, string | null>>({})

  const resolveCustomerName = async (cust_id?: string) => {
    if (!cust_id) return null
    if (cust_id in customerCache.current) return customerCache.current[cust_id]
    try {
      const name = await getCustomerName(cust_id)
      customerCache.current[cust_id] = name
      return name
    } catch (err) {
      customerCache.current[cust_id] = null
      return null
    }
  }

  const resolveBranchName = async (branch_id?: string) => {
    if (!branch_id) return null
    if (branch_id in branchCache.current) return branchCache.current[branch_id]
    try {
      const branchObj = await getBranchByBranchId(branch_id)
      const name = branchObj?.branch_name || branchObj?.branch_id || null
      branchCache.current[branch_id] = name
      return name
    } catch (err) {
      branchCache.current[branch_id] = null
      return null
    }
  }
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
            {appointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending appointments 🎉</p>
            ) : (
              appointments.map((appt) => (
                <div
                  key={appt.appointment_id}
                  className="rounded-md border p-3 flex justify-between items-start hover:bg-accent transition"
                >
                  <div>
                    <h3 className="text-sm font-medium">{appt.name || appt.cust_id || appt.appointment_id}</h3>
                    <p className="text-xs text-muted-foreground">{appt.date_for_inquiry ? new Date(appt.date_for_inquiry).toLocaleDateString() : ""}</p>
                    <p className="text-xs text-muted-foreground">{appt.time_start || ""}{appt.time_end ? ` - ${appt.time_end}` : ""}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* Branch in upper right */}
                    <h4 className="text-xs font-medium text-muted-foreground bold">{(appt as any).branch_name || appt.branch_id}</h4>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(appt.appointment_id, "Approved")}
                        className="px-2 py-1 text-xs rounded-md bg-green-100 text-green-700 hover:bg-green-200"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(appt.appointment_id, "Cancelled")}
                        className="px-2 py-1 text-xs rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                      >
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
