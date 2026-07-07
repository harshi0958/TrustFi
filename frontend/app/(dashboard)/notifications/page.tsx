"use client";

import {
  Bell,
  CheckCircle2,
  BrainCircuit,
  Wallet,
  FileCheck,
  ShieldCheck,
  Clock3,
} from "lucide-react";

const notifications = [
  {
    title: "Loan Application Submitted",
    time: "2 mins ago",
    color: "text-cyan-400",
    icon: FileCheck,
  },
  {
    title: "OCR Verification Completed",
    time: "2 mins ago",
    color: "text-green-400",
    icon: CheckCircle2,
  },
  {
    title: "AI Credit Analysis Completed",
    time: "1 min ago",
    color: "text-yellow-400",
    icon: BrainCircuit,
  },
  {
    title: "Admin Approved Loan",
    time: "Just Now",
    color: "text-green-400",
    icon: ShieldCheck,
  },
  {
    title: "Loan Amount Ready for Disbursement",
    time: "Just Now",
    color: "text-cyan-400",
    icon: Wallet,
  },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-8">

      <h1 className="text-4xl font-bold text-white">
        Notifications
      </h1>

      <div className="space-y-5">

        {notifications.map((item, index) => {

          const Icon = item.icon;

          return (

            <div
              key={index}
              className="flex items-center justify-between rounded-3xl border border-white/10 bg-zinc-900 p-6"
            >

              <div className="flex items-center gap-5">

                <div className="rounded-2xl bg-cyan-500/10 p-4">

                  <Icon
                    size={28}
                    className={item.color}
                  />

                </div>

                <div>

                  <h2 className="text-xl font-semibold text-white">
                    {item.title}
                  </h2>

                  <p className="text-zinc-400">
                    AI Secure Notification
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2 text-zinc-500">

                <Clock3 size={18} />

                {item.time}

              </div>

            </div>

          );
        })}

      </div>

      <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-8">

        <div className="flex items-center gap-3">

          <Bell className="text-cyan-400" />

          <h2 className="text-2xl font-bold text-white">
            Notification Summary
          </h2>

        </div>

        <ul className="mt-5 space-y-2 text-zinc-300">

          <li>✅ Loan Successfully Submitted</li>

          <li>✅ OCR Verification Finished</li>

          <li>✅ AI Credit Score Generated</li>

          <li>✅ Admin Decision Completed</li>

          <li>✅ Blockchain Transaction Logged</li>

        </ul>

      </div>

    </div>
  );
}