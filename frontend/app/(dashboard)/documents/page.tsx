"use client";

import {
  FileCheck,
  BadgeCheck,
  Download,
  Eye,
} from "lucide-react";

export default function DocumentsPage() {
  const documents = [
    {
      name: "Aadhaar Card",
      status: "Verified",
      type: "Identity Document",
    },
    {
      name: "PAN Card",
      status: "Verified",
      type: "Tax Document",
    },
    {
      name: "Salary Slip",
      status: "Verified",
      type: "Income Proof",
    },
    {
      name: "Bank Statement",
      status: "Verified",
      type: "Financial Record",
    },
  ];

  return (
    <div className="space-y-8">

      <h1 className="text-4xl font-bold text-white">
        Documents
      </h1>

      <div className="grid gap-6">

        {documents.map((doc) => (

          <div
            key={doc.name}
            className="rounded-3xl border border-white/10 bg-zinc-900 p-6"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="rounded-xl bg-cyan-500/10 p-4">

                  <FileCheck
                    className="text-cyan-400"
                    size={28}
                  />

                </div>

                <div>

                  <h2 className="text-xl font-bold text-white">
                    {doc.name}
                  </h2>

                  <p className="text-zinc-400">
                    {doc.type}
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-3">

                <span className="flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2 text-green-400">

                  <BadgeCheck size={18} />

                  {doc.status}

                </span>

                <button className="rounded-xl border border-cyan-500/20 p-3 hover:bg-cyan-500/10">

                  <Eye className="text-cyan-400" />

                </button>

                <button className="rounded-xl border border-cyan-500/20 p-3 hover:bg-cyan-500/10">

                  <Download className="text-cyan-400" />

                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

      <div className="rounded-3xl border border-green-500/20 bg-green-500/10 p-8">

        <h2 className="text-2xl font-bold text-green-400">
          OCR Verification Summary
        </h2>

        <div className="mt-6 space-y-3 text-zinc-300">

          <p>✅ Aadhaar details extracted successfully.</p>

          <p>✅ PAN number validated.</p>

          <p>✅ Salary amount matched with OCR output.</p>

          <p>✅ Bank statement verified.</p>

          <p>🔒 All documents processed using encrypted AI pipeline.</p>

        </div>

      </div>

    </div>
  );
}