"use client";

import { create } from "zustand";

interface PersonalDetails {
  fullName: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  address: string;
}

interface LoanStore {
  currentStep: number;

  personal: PersonalDetails;

  setCurrentStep: (step: number) => void;

  updatePersonal: (data: Partial<PersonalDetails>) => void;
}

export const useLoanStore = create<LoanStore>((set) => ({
  currentStep: 1,

  personal: {
    fullName: "",
    dob: "",
    gender: "",
    email: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    address: "",
  },

  setCurrentStep: (step) =>
    set({
      currentStep: step,
    }),

  updatePersonal: (data) =>
    set((state) => ({
      personal: {
        ...state.personal,
        ...data,
      },
    })),
}));