"use client";

import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="space-y-8">

      <h1 className="text-4xl font-bold text-white">
        Notifications
      </h1>

      <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-8">

        <div className="flex items-center gap-3">

          <Bell className="text-cyan-400" />

          <h2 className="text-2xl font-bold text-white">
            Notification Summary
          </h2>

        </div>

        <p className="mt-5 text-zinc-300">
          Live application notifications are not integrated. Check the
          dashboard for the backend-reported application status.
        </p>

      </div>

    </div>
  );
}