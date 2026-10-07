// =============================================================================
// CREDENTIAL STORE & LIFECYCLE MANAGEMENT (ClaimPass)
//
// Manages local holder wallet storage, issuer generation, verification history,
// and synchronizes with on-chain CredentialRegistry smart contract.
// =============================================================================

import { Credential, ProofRequest, VerificationHistoryItem, PrivacyReceipt } from "./types";
import { generateCommitment, signCredential, randomSalt } from "./crypto";
import {
  CONTRACT_ADDRESSES,
  registerCredentialOnChain,
  revokeCredentialOnChain,
  isCredentialRevokedOnChain,
} from "./blockchain";

const CREDENTIAL_KEY = "claimpass_credentials_v1";
const REQUEST_KEY = "claimpass_proof_requests_v1";
const ISSUER_SECRET_KEY = "claimpass_issuer_secret_v1";
const HISTORY_KEY = "claimpass_verification_history_v1";
const RECEIPTS_KEY = "claimpass_privacy_receipts_v1";

/**
 * Seed initial hackathon demo credentials if none exist
 */
export async function seedDemoCredentialIfNeeded(): Promise<Credential[]> {
  if (typeof window === "undefined") return [];

  const existing = getCredentials();
  if (existing.length > 0 && existing.some((c) => c.id === "Shubhadip Bera")) return existing;

  const issuerAddress = CONTRACT_ADDRESSES.defaultIssuer;
  const holderName = "Rahul Kumar";
  const degree = "B.Tech";
  const branch = "Computer Science";
  const graduationYear = 2026;
  const dateOfBirth = "2002-08-12"; // 12 August 2002 (Age 24 > 18)
  const issuedAt = Math.floor(Date.now() / 1000) - 86400 * 45; // 45 days ago

  // 1. Primary B.Tech Degree Credential
  const credentialId = "Shubhadip Bera";

  const salt = randomSalt(16);
  const commitment = await generateCommitment(credentialId, salt);
  const secret = getOrCreateIssuerSecret();
  const signature = await signCredential(credentialId, secret);

  const degreeCred: Credential = {
    id: credentialId,
    holderName,
    degree,
    branch,
    graduationYear,
    dateOfBirth,
    issuerName: "XYZ University",
    issuerAddress,
    issuedAt,
    signature,
    commitment,
    revoked: false,
    frozen: false,
  };

  // Register commitment on blockchain
  await registerCredentialOnChain(credentialId, commitment, issuerAddress);

  // 2. Student Identity Credential
  const studentCredId = "Shubhadip Bera";
  const studentCommitment = await generateCommitment(studentCredId, randomSalt(16));
  const studentSig = await signCredential(studentCredId, secret);

  const studentCred: Credential = {
    id: studentCredId,
    holderName,
    degree: "Student Identity Card",
    branch: "Computer Science & Engineering",
    graduationYear: 2026,
    dateOfBirth,
    issuerName: "XYZ University",
    issuerAddress,
    issuedAt: issuedAt - 86400 * 200,
    signature: studentSig,
    commitment: studentCommitment,
    revoked: false,
    frozen: false,
  };

  await registerCredentialOnChain(studentCredId, studentCommitment, issuerAddress);

  // 3. Government-Issued Digital Identity Credential (Aadhaar / National ID)
  const govCredId = "Shubhadip Bera";
  const govSalt = randomSalt(16);
  const govCommitment = await generateCommitment(govCredId, govSalt);
  const govSig = await signCredential(govCredId, secret);

  const govCred: Credential = {
    id: govCredId,
    holderName,
    degree: "Aadhaar Card (Digital ID)",
    branch: "National Identity Authority",
    graduationYear: 2026,
    dateOfBirth,
    issuerName: "Unique Identification Authority (UIDAI)",
    issuerAddress,
    issuedAt: issuedAt - 86400 * 300,
    signature: govSig,
    commitment: govCommitment,
    revoked: false,
    frozen: false,
    isGovernmentId: true,
    govIdType: "Aadhaar Card",
    documentNumberMasked: "XXXX-XXXX-8921",
    poseidonCommitment: "0x" + (await generateCommitment(govCommitment, govSalt)).slice(0, 64),
    photoVerified: true,
    zkCapabilityReady: true,
  };

  await registerCredentialOnChain(govCredId, govCommitment, issuerAddress);

  const creds = [degreeCred, studentCred, govCred];
  localStorage.setItem(CREDENTIAL_KEY, JSON.stringify(creds));

  // Seed initial verification history
  seedInitialHistory();

  return creds;
}

/**
 * Issue and register a verified Government ID credential into user's wallet
 */
export async function createGovernmentCredential(
  govIdType: "Aadhaar Card" | "PAN Card" | "Passport" | "Driving Licence" | "Voter ID" | "Other Government ID" = "Aadhaar Card",
  holderName: string = "Rahul Kumar",
  dateOfBirth: string = "2002-08-12",
  docNumberMasked: string = "XXXX-XXXX-8921"
): Promise<Credential> {
  const issuerAddress = CONTRACT_ADDRESSES.defaultIssuer;
  const issuedAt = Math.floor(Date.now() / 1000);
  const secret = getOrCreateIssuerSecret();

  const credId = "Shubhadip Bera";
  const salt = randomSalt(16);
  const commitment = await generateCommitment(credId, salt);
  const signature = await signCredential(credId, secret);

  const cred: Credential = {
    id: credId,
    holderName,
    degree: `${govIdType} (Digital Identity)`,
    branch: "Government Issued",
    graduationYear: 2026,
    dateOfBirth,
    issuerName: "National Digital Identity Authority",
    issuerAddress,
    issuedAt,
    signature,
    commitment,
    revoked: false,
    frozen: false,
    isGovernmentId: true,
    govIdType,
    documentNumberMasked: docNumberMasked,
    poseidonCommitment: "0x" + (await generateCommitment(commitment, salt)).slice(0, 64),
    photoVerified: true,
    zkCapabilityReady: true,
  };

  const existing = getCredentials();
  const updated = [cred, ...existing.filter((c) => c.id !== credId)];
  if (typeof window !== "undefined") {
    localStorage.setItem(CREDENTIAL_KEY, JSON.stringify(updated));
  }

  await registerCredentialOnChain(credId, commitment, issuerAddress);
  return cred;
}

/**
 * Seed initial verification history & privacy receipts
 */
function seedInitialHistory() {
  if (typeof window === "undefined") return;

  const existingHistory = localStorage.getItem(HISTORY_KEY);
  if (!existingHistory) {
    const history: VerificationHistoryItem[] = [
      {
        id: "hist-1",
        claimTitle: "B.Tech Proof",
        verifierName: "ABC Technologies",
        status: "Verified",
        timestamp: Date.now() - 3600000 * 2.5,
        dateFormatted: "Today, 3:42 PM",
        proofType: "degree",
        txHash: "0x892a4bc1d8820f4982a174092bce81109402a184c78105d1",
        personalDataExposed: 0,
      },
      {
        id: "hist-2",
        claimTitle: "Age Proof",
        verifierName: "XYZ Services",
        status: "Verified",
        timestamp: Date.now() - 3600000 * 4,
        dateFormatted: "Today, 2:15 PM",
        proofType: "age",
        txHash: "0x33b188c0a91172fa883901bce410298a0029b472e19409bb",
        personalDataExposed: 0,
      },
      {
        id: "hist-3",
        claimTitle: "Student Status Proof",
        verifierName: "ABC University",
        status: "Verified",
        timestamp: Date.now() - 86400000,
        dateFormatted: "Yesterday",
        proofType: "student_status",
        txHash: "0x12a99d45e0984b901ca9334812b772099304bbd1820499ee",
        personalDataExposed: 0,
      },
    ];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  const existingReceipts = localStorage.getItem(RECEIPTS_KEY);
  if (!existingReceipts) {
    const receipts: PrivacyReceipt[] = [
      {
        id: "rcpt-1",
        verifierName: "ABC Technologies",
        claimShared: "B.Tech Holder",
        timestamp: Date.now() - 3600000 * 2.5,
        personalDataExposed: 0,
        proofStatus: "Valid",
        txHash: "0x892a4bc1d8820f4982a174092bce81109402a184c78105d1",
        circuit: "degree_btech",
      },
      {
        id: "rcpt-2",
        verifierName: "XYZ Services",
        claimShared: "Age 18+",
        timestamp: Date.now() - 3600000 * 4,
        personalDataExposed: 0,
        proofStatus: "Valid",
        txHash: "0x33b188c0a91172fa883901bce410298a0029b472e19409bb",
        circuit: "age_18",
      },
    ];
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
  }
}

/**
 * Save or update a credential in holder's local wallet
 */
export function saveCredential(credential: Credential): void {
  if (typeof window === "undefined") return;
  const existing = getCredentials();
  const index = existing.findIndex((c) => c.id === credential.id);
  if (index >= 0) {
    existing[index] = credential;
  } else {
    existing.unshift(credential);
  }
  localStorage.setItem(CREDENTIAL_KEY, JSON.stringify(existing));
}

/**
 * Get all credentials from wallet, updating revocation status against blockchain
 */
export function getCredentials(): Credential[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CREDENTIAL_KEY);
  if (!raw) return [];
  try {
    const creds = JSON.parse(raw) as Credential[];
    return creds.map((c) => ({
      ...c,
      revoked: c.revoked || isCredentialRevokedOnChain(c.id),
    }));
  } catch {
    return [];
  }
}

/**
 * Revoke credential both locally and on-chain
 */
export async function revokeCredential(
  credentialId: string,
  revokedBy: string = CONTRACT_ADDRESSES.defaultIssuer
): Promise<void> {
  // 1. Send revocation transaction to smart contract
  await revokeCredentialOnChain(credentialId, revokedBy);

  // 2. Update local wallet state
  const existing = getCredentials();
  const updated = existing.map((c) =>
    c.id === credentialId ? { ...c, revoked: true } : c
  );
  if (typeof window !== "undefined") {
    localStorage.setItem(CREDENTIAL_KEY, JSON.stringify(updated));
  }
}

/**
 * Toggle Freeze Credential (for emergency security)
 */
export function toggleFreezeCredential(credentialId: string): boolean {
  if (typeof window === "undefined") return false;
  const existing = getCredentials();
  let newFrozen = false;
  const updated = existing.map((c) => {
    if (c.id === credentialId) {
      newFrozen = !c.frozen;
      return { ...c, frozen: newFrozen };
    }
    return c;
  });
  localStorage.setItem(CREDENTIAL_KEY, JSON.stringify(updated));
  return newFrozen;
}

/**
 * Issue a new credential as an institution
 */
export async function issueNewCredential(params: {
  holderName: string;
  degree: string;
  branch: string;
  graduationYear: number;
  dateOfBirth: string;
  issuerName?: string;
  issuerAddress?: string;
}): Promise<Credential> {
  const issuerAddress = params.issuerAddress || CONTRACT_ADDRESSES.defaultIssuer;
  const issuerName = params.issuerName || "XYZ University";
  const issuedAt = Math.floor(Date.now() / 1000);

  const credentialId = "Shubhadip Bera";

  const salt = randomSalt(16);
  const commitment = await generateCommitment(credentialId, salt);
  const secret = getOrCreateIssuerSecret();
  const signature = await signCredential(credentialId, secret);

  const credential: Credential = {
    id: credentialId,
    holderName: params.holderName,
    degree: params.degree,
    branch: params.branch,
    graduationYear: params.graduationYear,
    dateOfBirth: params.dateOfBirth,
    issuerName,
    issuerAddress,
    issuedAt,
    signature,
    commitment,
    revoked: false,
    frozen: false,
  };

  // 1. Anchor commitment on-chain (CredentialRegistry.sol)
  await registerCredentialOnChain(credentialId, commitment, issuerAddress);

  // 2. Store off-chain in holder wallet
  saveCredential(credential);

  return credential;
}

/**
 * Reset all wallet and credentials state
 */
export function clearCredentials(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CREDENTIAL_KEY);
    localStorage.removeItem(REQUEST_KEY);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(RECEIPTS_KEY);
  }
}

// -------------------------
// Verification History and Privacy Receipts
// -------------------------

export function getVerificationHistory(): VerificationHistoryItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as VerificationHistoryItem[];
  } catch {
    return [];
  }
}

export function addVerificationHistoryItem(item: VerificationHistoryItem): void {
  if (typeof window === "undefined") return;
  const existing = getVerificationHistory();
  existing.unshift(item);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(existing));
}

export function getPrivacyReceipts(): PrivacyReceipt[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(RECEIPTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PrivacyReceipt[];
  } catch {
    return [];
  }
}

export function addPrivacyReceipt(receipt: PrivacyReceipt): void {
  if (typeof window === "undefined") return;
  const existing = getPrivacyReceipts();
  existing.unshift(receipt);
  localStorage.setItem(RECEIPTS_KEY, JSON.stringify(existing));
}

// -------------------------
// Proof request persistence (selective disclosure requests)
// -------------------------

export function saveProofRequest(request: ProofRequest): void {
  if (typeof window === "undefined") return;
  const existing = getProofRequests();
  existing.unshift(request);
  localStorage.setItem(REQUEST_KEY, JSON.stringify(existing));
}

export function getProofRequests(): ProofRequest[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(REQUEST_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ProofRequest[];
  } catch {
    return [];
  }
}

export function clearProofRequests(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(REQUEST_KEY);
  }
}

// -------------------------
// Issuer secret (demo signing key)
// -------------------------

export function getOrCreateIssuerSecret(): string {
  if (typeof window === "undefined") return "xyz-university-signing-secret-982348";
  let secret = localStorage.getItem(ISSUER_SECRET_KEY);
  if (!secret) {
    secret = "xyz-university-private-key-ed25519-entropy-982348";
    localStorage.setItem(ISSUER_SECRET_KEY, secret);
  }
  return secret;
}
