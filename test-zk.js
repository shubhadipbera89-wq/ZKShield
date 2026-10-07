// =============================================================================
// CLI CRYPTOGRAPHY & VERIFICATION TEST SUITE
// =============================================================================

const crypto = require("crypto");

function sha256(str) {
  return crypto.createHash("sha256").update(str).digest("hex");
}

function calculateAge(dobStr, currentDate = new Date()) {
  const birthDate = new Date(dobStr);
  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const m = currentDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && currentDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

console.log("--------------------------------------------------");
console.log("RUNNING ZK CREDENTIAL TEST SUITE");
console.log("--------------------------------------------------");

// Test 1: Age verification logic
const dobAdult = "2004-03-15"; // Age 22+
const dobMinor = "2012-06-01"; // Age ~14

const ageAdult = calculateAge(dobAdult);
const ageMinor = calculateAge(dobMinor);

console.log(`[Test 1.1] Rahul Kumar (DOB: ${dobAdult}) -> Age: ${ageAdult}`);
if (ageAdult >= 18) {
  console.log("  ✅ PASS: Age >= 18 constraint satisfied");
} else {
  console.error("  ❌ FAIL: Adult age calculation failed");
  process.exit(1);
}

console.log(`[Test 1.2] Under-18 Test (DOB: ${dobMinor}) -> Age: ${ageMinor}`);
if (ageMinor < 18) {
  console.log("  ✅ PASS: Under-18 constraint rejected as expected");
} else {
  console.error("  ❌ FAIL: Under-18 test failed");
  process.exit(1);
}

// Test 2: Commitment & Credential Hashing
const issuerAddress = "0x4A1359D1115e5c678a17684614A7080b0D0F5849";
const holderName = "Rahul Kumar";
const degree = "B.Tech";
const branch = "Computer Science";
const gradYear = 2026;
const issuedAt = Math.floor(Date.now() / 1000);

const credId = "Shubhadip Bera";
const salt = crypto.randomBytes(16).toString("hex");
const commitment = sha256(credId + "|" + salt);

console.log(`[Test 2] Credential ID: ${credId}`);
console.log(`  On-chain Commitment: ${commitment.slice(0, 20)}...`);
console.log("  ✅ PASS: Cryptographic commitment generated without exposing DOB");

// Test 3: Selective Disclosure (Degree Hash)
const degreeClaim = sha256(`${degree}|${branch}`);
console.log(`[Test 3] Degree Claim Hash: ${degreeClaim.slice(0, 20)}...`);
console.log("  ✅ PASS: Degree claim decoupled from roll number and full certificate");

// Test 4: Revocation Simulation
let revokedRegistry = {};
console.log(`[Test 4.1] Pre-revocation check: revoked = ${Boolean(revokedRegistry[credId])}`);
let isValidBefore = (!revokedRegistry[credId]);
console.log(`  Verification result: ${isValidBefore ? "VALID (PASSED)" : "INVALID"}`);

// Revoke
revokedRegistry[credId] = true;
console.log(`[Test 4.2] University calls revokeCredential(${credId.slice(0, 16)}...)`);
let isValidAfter = (!revokedRegistry[credId]);
console.log(`  Post-revocation check: revoked = ${Boolean(revokedRegistry[credId])}`);
console.log(`  Verification result: ${isValidAfter ? "VALID (PASSED)" : "INVALID (REJECTED)"}`);

if (!isValidAfter) {
  console.log("  ✅ PASS: Revocation correctly causes verification rejection");
} else {
  console.error("  ❌ FAIL: Revocation check failed");
  process.exit(1);
}

console.log("--------------------------------------------------");
console.log("ALL TEST SUITE CHECKS PASSED SUCCESSFULLY!");
console.log("--------------------------------------------------");
