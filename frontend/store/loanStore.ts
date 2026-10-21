
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
  occupation: string;
  monthlyIncome: string;
}

interface UploadedDocuments {
  aadhaarFront: boolean;
  aadhaarBack: boolean;
  pan: boolean;
  selfie: boolean;
  salarySlip: boolean;
  passbook: boolean;
  propertyDocument: boolean;
  goldDocument: boolean;
}

interface IdentityDetails {
  aadhaarFront: File | null;
  aadhaarBack: File | null;
  pan: File | null;
  passportPhoto: File | null;
}

interface BankingDetails {
  accountHolder: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifsc: string;
  bankName: string;
}

export type LoanType = "PERSONAL" | "PROPERTY" | "GOLD";
export type FraudRisk = "LOW" | "MEDIUM" | "HIGH";

interface LoanDetails {
  loanType: LoanType;
  amount: number;
  months: number;
  purpose: string;
  propertyType: string;
  propertyValue: number;
  propertyAddress: string;
  ownershipStatus: string;
  goldWeight: number;
  goldPurity: string;
  goldValue: number;
  goldOwnership: string;
}

interface ApprovedLoan {
  amount: number;
  emi: number;
  score: number;
  eligibility: number;
  interestRate: number;
  risk: string;
  status: string;
}

export interface DocumentFraudResult {
  fraudScore: number;
  fraudRisk: FraudRisk;
  fraudFlags: string[];
  documentValid: boolean;
  confidence: number;
  validationMessage: string;
}

export interface FraudAssessment {
  fraudScore: number;
  fraudRisk: FraudRisk;
  fraudFlags: string[];
  assessmentCompleted: boolean;
  documentResults: Record<string, DocumentFraudResult>;
}

interface LoanStore {
  currentStep: number;
  personal: PersonalDetails;
  identity: IdentityDetails;
  banking: BankingDetails;
  loan: LoanDetails;
  documents: UploadedDocuments;
  approvedLoan: ApprovedLoan;
  fraudAssessment: FraudAssessment;

  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;

  updatePersonal: (data: Partial<PersonalDetails>) => void;
  updateIdentity: (data: Partial<IdentityDetails>) => void;
  updateBanking: (data: Partial<BankingDetails>) => void;
  updateLoan: (data: Partial<LoanDetails>) => void;
  updateDocument: (key: keyof UploadedDocuments, value: boolean) => void;
  saveApprovedLoan: (data: ApprovedLoan) => void;

  updateFraudAssessment: (data: Partial<FraudAssessment>) => void;
  updateDocumentFraudAssessment: (
    documentKey: string,
    data: Partial<DocumentFraudResult>
  ) => void;
  setFraudAssessmentCompleted: (completed: boolean) => void;
  resetFraudAssessment: () => void;
}

const initialFraudAssessment: FraudAssessment = {
  fraudScore: 0,
  fraudRisk: "LOW",
  fraudFlags: [],
  assessmentCompleted: false,
  documentResults: {},
};

const riskRank: Record<FraudRisk, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
};

function normalizeRisk(value: unknown): FraudRisk {
  if (value === "HIGH" || value === "MEDIUM") return value;
  return "LOW";
}

function aggregateDocumentResults(
  results: Record<string, DocumentFraudResult>
): Pick<FraudAssessment, "fraudScore" | "fraudRisk" | "fraudFlags"> {
  const entries = Object.values(results);

  const fraudScore = entries.reduce(
    (maximum, result) => Math.max(maximum, result.fraudScore),
    0
  );

  const fraudRisk = entries.reduce<FraudRisk>(
    (highest, result) =>
      riskRank[result.fraudRisk] > riskRank[highest]
        ? result.fraudRisk
        : highest,
    "LOW"
  );

  const fraudFlags = [
    ...new Set(entries.flatMap((result) => result.fraudFlags)),
  ];

  return { fraudScore, fraudRisk, fraudFlags };
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
    propertyDocument: false,
    goldDocument: false,
  },

  identity: {
    aadhaarFront: null,
    aadhaarBack: null,
    pan: null,
    passportPhoto: null,
  },

  banking: {
    accountHolder: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifsc: "",
    bankName: "",
  },

  loan: {
    loanType: "PERSONAL",
    amount: 500000,
    months: 24,
    purpose: "",
    propertyType: "",
    propertyValue: 0,
    propertyAddress: "",
    ownershipStatus: "",
    goldWeight: 0,
    goldPurity: "",
    goldValue: 0,
    goldOwnership: "",
  },

  approvedLoan: {
    amount: 0,
    emi: 0,
    score: 0,
    eligibility: 0,
    interestRate: 0,
    risk: "",
    status: "",
  },

  fraudAssessment: {
    ...initialFraudAssessment,
    fraudFlags: [],
    documentResults: {},
  },

  setCurrentStep: (step) =>
    set({ currentStep: Math.min(8, Math.max(1, step)) }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(8, state.currentStep + 1),
    })),

  previousStep: () =>
    set((state) => ({
      currentStep: Math.max(1, state.currentStep - 1),
    })),

  updatePersonal: (data) =>
    set((state) => ({
      personal: { ...state.personal, ...data },
    })),

  updateIdentity: (data) =>
    set((state) => ({
      identity: { ...state.identity, ...data },
    })),

  updateBanking: (data) =>
    set((state) => ({
      banking: { ...state.banking, ...data },
    })),

  updateLoan: (data) =>
    set((state) => ({
      loan: { ...state.loan, ...data },
    })),

  updateDocument: (key, value) =>
    set((state) => ({
      documents: { ...state.documents, [key]: value },
    })),

  saveApprovedLoan: (data) => set({ approvedLoan: data }),

  updateFraudAssessment: (data) =>
    set((state) => {
      const fraudAssessment = {
        ...state.fraudAssessment,
        ...data,
        fraudFlags:
          data.fraudFlags !== undefined
            ? [...data.fraudFlags]
            : state.fraudAssessment.fraudFlags,
        documentResults:
          data.documentResults ?? state.fraudAssessment.documentResults,
        assessmentCompleted: false,
      };

      return { fraudAssessment };
    }),

  updateDocumentFraudAssessment: (documentKey, data) =>
    set((state) => {
      const previous =
        state.fraudAssessment.documentResults[documentKey];

      const result: DocumentFraudResult = {
        fraudScore: Math.max(
          0,
          Math.min(100, Number(data.fraudScore ?? previous?.fraudScore ?? 0))
        ),
        fraudRisk: normalizeRisk(
          data.fraudRisk ?? previous?.fraudRisk ?? "LOW"
        ),
        fraudFlags: [
          ...(data.fraudFlags ?? previous?.fraudFlags ?? []),
        ],
        documentValid: data.documentValid ?? previous?.documentValid ?? false,
        confidence: Math.max(
          0,
          Math.min(100, Number(data.confidence ?? previous?.confidence ?? 0))
        ),
        validationMessage:
          data.validationMessage ?? previous?.validationMessage ?? "",
      };

      const documentResults = {
        ...state.fraudAssessment.documentResults,
        [documentKey]: result,
      };

      return {
        fraudAssessment: {
          ...state.fraudAssessment,
          ...aggregateDocumentResults(documentResults),
          documentResults,
          assessmentCompleted: false,
        },
      };
    }),

  setFraudAssessmentCompleted: (completed) =>
    set((state) => ({
      fraudAssessment: {
        ...state.fraudAssessment,
        assessmentCompleted: completed,
      },
    })),

  resetFraudAssessment: () =>
    set({
      fraudAssessment: {
        ...initialFraudAssessment,
        fraudFlags: [],
        documentResults: {},
      },
    }),
}));
