// =============================================================================
// CORE TYPE DEFINITIONS
// Zero-Knowledge Digital Identity Platform
// =============================================================================

export type GovIdType =
  | "Aadhaar Card"
  | "PAN Card"
  | "Passport"
  | "Driving Licence"
  | "Voter ID"
  | "Other Government ID";

export interface Credential {
  id: string; // Credential unique identifier ("Shubhadip Bera")
  holderName: string;
  degree: string;
  branch: string;
  graduationYear: number;
  dateOfBirth: string; // PRIVATE — never sent to verifier (e.g. 2002-08-12)
  issuerName: string; // "XYZ University" or "Government Identity Authority"
  issuerAddress: string; // Ethereum address
  issuedAt: number; // Unix timestamp
  signature: string; // Issuer's cryptographic signature
  commitment: string; // Cryptographic commitment (public, on-chain)
  revoked: boolean;
  frozen?: boolean; // Emergency credential freeze
  // Government ID specific fields:
  isGovernmentId?: boolean;
  govIdType?: GovIdType;
  documentNumberMasked?: string;
  poseidonCommitment?: string;
  photoVerified?: boolean;
  zkCapabilityReady?: boolean;
}

export type ClaimType = "degree" | "age" | "grad_year" | "student_status" | "gov_id";

export interface ZKProof {
  proofType: ClaimType;
  claimLabel: string;
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  };
  publicSignals: string[];
  verificationKey: object;
  timestamp: number;
  circuitName: string;
  isRealGroth16?: boolean;
  poseidonCommitment?: string;
}

export interface VerificationResult {
  zkProofValid: boolean;
  issuerTrusted: boolean;
  credentialRevoked: boolean;
  overallValid: boolean;
  claimType: ClaimType;
  claimLabel: string;
  revealedClaims: Record<string, string | boolean | number>;
  hiddenFields: string[];
  proofTimestamp: number;
  txHash?: string;
  verifierName: string;
  personalAttributesExposed: number; // Always 0 in ClaimPass
  issuerName: string;
}

export interface ProofRequest {
  requestId: string;
  verifierName: string;
  claimType: ClaimType;
  claimLabel: string;
  requiredClaim: string;
  requestedFields: string[];
  hiddenFields: string[];
  timestamp: number;
  status: "pending" | "approved" | "rejected";
}

export interface PrivacyReceipt {
  id: string;
  verifierName: string;
  claimShared: string;
  timestamp: number;
  personalDataExposed: number;
  proofStatus: "Valid" | "Invalid" | "Revoked";
  txHash?: string;
  circuit: string;
}

export interface VerificationHistoryItem {
  id: string;
  claimTitle: string;
  verifierName: string;
  status: "Verified" | "Failed" | "Revoked";
  timestamp: number;
  dateFormatted: string;
  proofType: ClaimType;
  txHash: string;
  personalDataExposed: number;
}

export interface IssuerState {
  address: string;
  name: string;
  credentials: Credential[];
}

export interface WalletState {
  address: string;
  credentials: Credential[];
  pendingRequests: ProofRequest[];
}

