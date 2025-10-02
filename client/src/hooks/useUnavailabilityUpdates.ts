import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

const BASE_URL = import.meta.env.VITE_API_BASE_URL

interface ChangeEvent {
  operationType: string
  documentKey: { _id: string }
  fullDocument?: any
  updateDescription?: {
    updatedFields: Record<string, any>
    removedFields: string[]
  }
}

export function useUnavailabilityUpdates() {
  const [changes, setChanges] = useState<ChangeEvent | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    let socket: Socket

    socket = io(BASE_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on("connect", () => {
      console.log("🔌 Connected to socket server (unavailability):", socket.id)
      setIsConnected(true)
    })

    socket.on("unavailabilityUpdated", (change: ChangeEvent) => {
      console.log("📢 Unavailability change received:", change)
      setChanges(change)
      setLastUpdate(new Date())
    })

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket server (unavailability)")
      setIsConnected(false)
    })

    socket.on("connect_error", (err) => {
      console.error("Connection error (unavailability):", err)
      setIsConnected(false)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return { changes, isConnected, lastUpdate }
}