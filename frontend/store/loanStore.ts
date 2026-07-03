"use client";

import { create } from "zustand";

/* ---------------- PERSONAL ---------------- */

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
  occupation: string;
  monthlyIncome: string;
}

/* -----------------UPLODDOCUMENT--------------*/

interface UploadedDocuments {
  aadhaarFront: boolean;
  aadhaarBack: boolean;
  pan: boolean;
  selfie: boolean;
  salarySlip: boolean;
  passbook: boolean;
}
/* ---------------- IDENTITY ---------------- */

interface IdentityDetails {
  aadhaarFront: File | null;
  aadhaarBack: File | null;
  pan: File | null;
  passportPhoto: File | null;
}

/* ---------------- BANKING ---------------- */

interface BankingDetails {
  accountHolder: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifsc: string;
  bankName: string;
}

/* ---------------- LOAN ---------------- */

interface LoanDetails {
  amount: number;
  months: number;
  purpose: string;
}

/* ---------------- STORE ---------------- */

interface LoanStore {
  currentStep: number;

  personal: PersonalDetails;
  identity: IdentityDetails;
  banking: BankingDetails;
  loan: LoanDetails;
  documents: UploadedDocuments;

  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;

  updatePersonal: (data: Partial<PersonalDetails>) => void;
  updateIdentity: (data: Partial<IdentityDetails>) => void;
  updateBanking: (data: Partial<BankingDetails>) => void;
  updateLoan: (data: Partial<LoanDetails>) => void;
  updateDocument: (
  key: keyof UploadedDocuments,
  value: boolean
) => void;
}

export const useLoanStore = create<LoanStore>((set) => ({
  currentStep: 1,

  /* ---------------- PERSONAL ---------------- */

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
    occupation: "",
    monthlyIncome: "",
  },

  documents: {
  aadhaarFront: false,
  aadhaarBack: false,
  pan: false,
  selfie: false,
  salarySlip: false,
  passbook: false,
},

  /* ---------------- IDENTITY ---------------- */

  identity: {
    aadhaarFront: null,
    aadhaarBack: null,
    pan: null,
    passportPhoto: null,
  },

  /* ---------------- BANKING ---------------- */

  banking: {
    accountHolder: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifsc: "",
    bankName: "",
  },

  /* ---------------- LOAN ---------------- */

  loan: {
    amount: 500000,
    months: 24,
    purpose: "",
  },

  /* ---------------- STEPPER ---------------- */

  setCurrentStep: (step) =>
    set({
      currentStep: step,
    }),

  nextStep: () =>
    set((state) => ({
      currentStep:
        state.currentStep < 8
          ? state.currentStep + 1
          : 8,
    })),

  previousStep: () =>
    set((state) => ({
      currentStep:
        state.currentStep > 1
          ? state.currentStep - 1
          : 1,
    })),

  /* ---------------- UPDATE FUNCTIONS ---------------- */

  updatePersonal: (data) =>
    set((state) => ({
      personal: {
        ...state.personal,
        ...data,
      },
    })),

  updateIdentity: (data) =>
    set((state) => ({
      identity: {
        ...state.identity,
        ...data,
      },
    })),

  updateBanking: (data) =>
    set((state) => ({
      banking: {
        ...state.banking,
        ...data,
      },
    })),

  updateLoan: (data) =>
    set((state) => ({
      loan: {
        ...state.loan,
        ...data,
      },
    })),

  updateDocument: (key, value) =>
    set((state) => ({
      documents: {
        ...state.documents,
        [key]: value,
      },
    })),
}));