"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLoanStore } from "@/store/loanStore";

export default function EmploymentDetails() {
  const { nextStep } = useLoanStore();

  const [company, setCompany] = useState("");
  const [designation, setDesignation] = useState("");
  const [experience, setExperience] = useState("");
  const [salary, setSalary] = useState("");
  const [employmentType, setEmploymentType] = useState("");

  const monthlySalary = Number(salary);

  const eligible = salary !== "" && monthlySalary >= 50000;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Employment Details
        </h1>

        <p className="mt-2 text-zinc-400">
          Enter your employment information for AI risk analysis.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <Label className="text-white">Company Name</Label>
          <Input
            className="text-white"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <div>
          <Label className="text-white">Designation</Label>
          <Input
            className="text-white"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
          />
        </div>

        <div>
          <Label className="text-white">Employment Type</Label>
          <Input
            className="text-white"
            placeholder="Full Time"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
          />
        </div>

        <div>
          <Label className="text-white">Experience (Years)</Label>
          <Input
            className="text-white"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </div>

        <div>
          <Label className="text-white">Monthly Salary (₹)</Label>
          <Input
            type="number"
            className="text-white"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label className="text-white">Work Address</Label>

        <Textarea
          className="text-white mt-2"
          rows={4}
          placeholder="Company Address"
        />
      </div>

      {salary !== "" && (
        <div
          className={`rounded-xl p-4 ${
            eligible
              ? "bg-green-500/10 border border-green-500"
              : "bg-red-500/10 border border-red-500"
          }`}
        >
          <h2
            className={`font-bold ${
              eligible ? "text-green-400" : "text-red-400"
            }`}
          >
            {eligible
              ? "Eligible for Loan Processing ✅"
              : "Monthly Salary must be at least ₹50,000 ❌"}
          </h2>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          disabled={!eligible}
          className="bg-cyan-500 text-black hover:bg-cyan-400 disabled:bg-zinc-700 disabled:text-zinc-400"
          onClick={nextStep}
        >
          Save & Continue
        </Button>
      </div>
    </div>
  );
}