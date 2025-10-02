"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNotificationUpdates } from "@/hooks/useNotificationUpdates";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60); if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60); if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24); return `${d}d ago`;
}

export default function NotificationsSheet() {
  const [open, setOpen] = useState(true);
  const { notifications } = useNotificationUpdates();

  return (
    <>
      <div className="max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Live Notifications</h2>
          <Button size="sm" variant="outline" onClick={() => setOpen(!open)}>
            {open ? 'Hide' : 'Show'}
          </Button>
        </div>
        {open && (
          <ScrollArea className="h-[400px] pr-2">
            {notifications.length === 0 && (
              <p className="text-sm text-muted-foreground">No updates yet. Make a change to appointments, unavailability, or line items.</p>
            )}
            {notifications.map(n => (
              <Card key={n.id} className="mb-2">
                <CardHeader className="py-2 pb-1">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span className="capitalize">{n.source}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-1">
                  <p className="text-sm">{n.summary}</p>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        )}
      </div>
    </>
  );
}
