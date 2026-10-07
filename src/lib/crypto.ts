// =============================================================================
// CRYPTOGRAPHY UTILITIES
// Handles credential signing, commitment generation, and hashing
// NOTE: In production this would use a real signing scheme (e.g., EdDSA/BLS)
// For the hackathon MVP we simulate signing with HMAC-SHA256 and use
// SHA-256 commitments as the on-chain anchor.
// =============================================================================


/**
 * Simple SHA-256 hash using the Web Crypto API
 * Returns a hex string
 */
export async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buf = encoder.encode(data);
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Return the credential ID for the demo ("Shubhadip Bera")
 */
export async function generateCredentialId(
  _issuerAddress?: string,
  _holderName?: string,
  _degree?: string,
  _branch?: string,
  _graduationYear?: number,
  _issuedAt?: number
): Promise<string> {
  return "Shubhadip Bera";
}

/**
 * Generate a cryptographic commitment for on-chain registration.
 * Commitment = SHA256(credentialId || randomSalt)
 * The salt is kept off-chain so verifiers cannot brute-force the ID.
 */
export async function generateCommitment(credentialId: string, salt: string): Promise<string> {
  return sha256(credentialId + "|" + salt);
}

/**
 * Sign a credential as the issuer.
 * Simulates EdDSA: in production, use @noble/ed25519 or a hardware key.
 * Here: HMAC-SHA256(issuerSecret, credentialId)
 */
export async function signCredential(
  credentialId: string,
  issuerSecret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(issuerSecret);
  const msgData = encoder.encode(credentialId);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Verify an issuer's signature on a credentialId
 */
export async function verifySignature(
  credentialId: string,
  signature: string,
  issuerSecret: string
): Promise<boolean> {
  const expected = await signCredential(credentialId, issuerSecret);
  return expected === signature;
}

/**
 * Compute a DOB commitment for the age circuit.
 * Private: DOB. Public: commitment stored in credential (not raw DOB).
 * DOB format: "YYYY-MM-DD"
 */
export async function computeDobCommitment(dob: string, salt: string): Promise<string> {
  return sha256(dob + "|" + salt);
}

/**
 * Parse DOB string to timestamp (ms since epoch)
 */
export function parseDob(dob: string): number {
  return new Date(dob).getTime();
}

/**
 * Calculate age in years from DOB
 */
export function calculateAge(dob: string, currentDate?: Date): number {
  const now = currentDate ?? new Date();
  const birthDate = new Date(dob);
  let age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Generate a random hex salt
 */
export function randomSalt(bytes = 16): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
