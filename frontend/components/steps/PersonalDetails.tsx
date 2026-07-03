"use client";

import { useMemo } from "react";
import { useLoanStore } from "@/store/loanStore";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PersonalDetails() {
  const { personal, updatePersonal, setCurrentStep } = useLoanStore();

  const profile = useMemo(() => {
    const fields = [
      personal.fullName,
      personal.email,
      personal.phone,
      personal.dob,
      personal.gender,
      personal.country,
      personal.state,
      personal.city,
      personal.pincode,
      personal.address,
      personal.occupation,
      personal.monthlyIncome,
    ];

    const completed = fields.filter((x) => x !== "").length;

    return Math.round((completed / fields.length) * 100);
  }, [personal]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold text-white">
            Personal Information
          </h1>

          <p className="mt-2 text-zinc-400">
            Complete your KYC profile before applying.
          </p>

        </div>

        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3">

          <p className="text-xs text-zinc-400">
            Profile Completion
          </p>

          <h2 className="text-2xl font-bold text-cyan-400">
            {profile}%
          </h2>

        </div>

      </div>

      <div className="grid grid-cols-2 gap-5">

        <div>
          <Label className="mb-2 block text-white">
            Full Name *
          </Label>

          <Input
            className="text-white"
            value={personal.fullName}
            onChange={(e) =>
              updatePersonal({
                fullName: e.target.value,
              })
            }
          />
        </div>

        <div>
          <Label className="mb-2 block text-white">
            Email *
          </Label>

          <Input
            className="text-white"
            type="email"
            value={personal.email}
            onChange={(e) =>
              updatePersonal({
                email: e.target.value,
              })
            }
          />
        </div>

        <div>
          <Label className="mb-2 block text-white">
            Mobile Number *
          </Label>

          <Input
            className="text-white"
            placeholder="+91"
            value={personal.phone}
            onChange={(e) =>
              updatePersonal({
                phone: e.target.value,
              })
            }
          />
        </div>

        <div>
          <Label className="mb-2 block text-white">
            Date of Birth *
          </Label>

          <Input
            className="text-white"
            type="date"
            value={personal.dob}
            onChange={(e) =>
              updatePersonal({
                dob: e.target.value,
              })
            }
          />
        </div>

        <div>
          <Label className="mb-2 block text-white">
            Gender
          </Label>

          <Select
            onValueChange={(v) =>
              updatePersonal({
                gender: v,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>

            <SelectContent>

              <SelectItem value="Male">
                Male
              </SelectItem>

              <SelectItem value="Female">
                Female
              </SelectItem>

              <SelectItem value="Other">
                Other
              </SelectItem>

            </SelectContent>
          </Select>

        </div>

        <div>
          <Label className="mb-2 block text-white">
            Occupation
          </Label>

          <Select
            onValueChange={(v) =>
              updatePersonal({
                occupation: v,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Occupation" />
            </SelectTrigger>

            <SelectContent>

              <SelectItem value="Salaried">
                Salaried
              </SelectItem>

              <SelectItem value="Business">
                Business
              </SelectItem>

              <SelectItem value="Freelancer">
                Freelancer
              </SelectItem>

              <SelectItem value="Student">
                Student
              </SelectItem>

            </SelectContent>

          </Select>

        </div>

        <div>
          <Label className="mb-2 block text-white">
            Monthly Income
          </Label>

          <Input
            className="text-white"
            value={personal.monthlyIncome}
            onChange={(e) =>
              updatePersonal({
                monthlyIncome: e.target.value,
              })
            }
          />
        </div>

        <div>
          <Label className="mb-2 block text-white">
            Country
          </Label>

          <Input
            className="text-white"
            value={personal.country}
            onChange={(e) =>
              updatePersonal({
                country: e.target.value,
              })
            }
          />
        </div>

        <div>
          <Label className="mb-2 block text-white">
            State
          </Label>

          <Input
            className="text-white"
            value={personal.state}
            onChange={(e) =>
              updatePersonal({
                state: e.target.value,
              })
            }
          />
        </div>

        <div>
          <Label className="mb-2 block text-white">
            City
          </Label>

          <Input
            className="text-white"
            value={personal.city}
            onChange={(e) =>
              updatePersonal({
                city: e.target.value,
              })
            }
          />
        </div>

        <div>
          <Label className="mb-2 block text-white">
            PIN Code
          </Label>

          <Input
            className="text-white"
            value={personal.pincode}
            onChange={(e) =>
              updatePersonal({
                pincode: e.target.value,
              })
            }
          />
        </div>

      </div>

      <div>

        <Label className="mb-2 block text-white">
          Address
        </Label>

        <Textarea
          className="text-white"
          rows={5}
          value={personal.address}
          onChange={(e) =>
            updatePersonal({
              address: e.target.value,
            })
          }
        />

      </div>

      <div className="flex justify-end">

        <Button
          className="rounded-xl bg-cyan-500 px-8 py-6 text-black hover:bg-cyan-400"
          onClick={() => setCurrentStep(2)}
        >
          Save & Continue
        </Button>

      </div>
    </div>
  );
}