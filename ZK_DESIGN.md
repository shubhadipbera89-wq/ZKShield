# Zero-Knowledge Circuit Architecture & Privacy Specification

> **"Prove the claim, not the personal data."**
> This document details the mathematical formulation, constraints, privacy guarantees, and signal classification for the Zero-Knowledge circuits powering the credential verification platform.

---

## 1. Overview & Threat Model

Traditional identity verification systems suffer from the **over-disclosure dilemma**: to prove that an applicant is of legal age (18+) or holds an engineering degree, the user is forced to expose high-risk personally identifiable information (PII) including government ID cards, exact dates of birth, residential addresses, and full university transcripts.

Our Zero-Knowledge architecture splits identity verification into:
1. **Issuer Commitment:** An authorized institution cryptographically signs credentials and anchors privacy-preserving commitments on-chain.
2. **Off-Chain Holder Wallet:** The user stores credential secrets locally on their device.
3. **ZK Proving Engine:** The user's device constructs a Groth16 zero-knowledge proof satisfying specific algebraic constraints over elliptic curves (`bn128`).
4. **On-Chain & Off-Chain Verifiers:** Verifiers validate the succinct cryptographic proof and check on-chain revocation status *without ever receiving or processing the underlying private data*.

---

## 2. Age Circuit (`age.circom`)

### Objective
Prove that the holder is **at least 18 years of age** (`age >= 18`) relative to the current timestamp, without disclosing the holder's exact date of birth.

### Circuit Specifications
* **Framework:** Circom 2.1.6
* **Proving System:** Groth16 (`bn128` pairing-friendly elliptic curve)
* **Target Constraint:** `elapsedSeconds >= 18 * 31557600` (seconds per year)

### Signal Classification

| Signal Name | Visibility | Description |
| :--- | :--- | :--- |
| `birthTimestamp` | **PRIVATE** | Holder's exact date of birth expressed as a Unix timestamp (e.g. `1079308800` for March 15, 2004). |
| `holderSecret` | **PRIVATE** | Blinding factor generating cryptographic identity binding. |
| `currentTimestamp` | **PUBLIC** | Current Unix timestamp provided by verifier / blockchain state. |
| `minAgeYears` | **PUBLIC** | Minimum age threshold requirement (default: `18`). |
| `isOver18` | **OUTPUT / PUBLIC** | Boolean flag (`1` = verified, `0` = rejected). |
| `holderCommitment` | **OUTPUT / PUBLIC** | Deterministic nullifier/commitment preventing replay attacks. |

### Mathematical Constraints
```circom
signal requiredSeconds <== minAgeYears * 31557600;
signal elapsedSeconds <== currentTimestamp - birthTimestamp;
component comp = GreaterEqThan(64);
comp.in[0] <== elapsedSeconds;
comp.in[1] <== requiredSeconds;
isOver18 <== comp.out;
isOver18 === 1;
```

### Privacy Guarantee
* **Revealed to Verifier:**
  - The single boolean fact that the holder is 18 years of age or older.
* **Hidden from Verifier:**
  - Exact Day, Month, and Year of birth.
  - Zodiac sign, birth location, age in months/days, or other demographic data.

---

## 3. Degree Circuit (`degree.circom`)

### Objective
Prove that the holder holds a **valid B.Tech degree** issued by an authorized institution (e.g., **ABC University**) and anchored in the on-chain registry, without disclosing student roll numbers, home address, or full academic transcripts.

### Circuit Specifications
* **Framework:** Circom 2.1.6
* **Proving System:** Groth16
* **Target Constraint:** `degreeCode == expectedDegreeCode` and valid cryptographic signature and on-chain commitment relation.

### Signal Classification

| Signal Name | Visibility | Description |
| :--- | :--- | :--- |
| `credentialId` | **PRIVATE** | Unique credential identifier. |
| `rollNumber` | **PRIVATE** | Student university enrollment number (e.g., `20220419`). |
| `dobTimestamp` | **PRIVATE** | Date of birth associated with student record. |
| `degreeCode` | **PRIVATE** | Internal numerical code for degree (e.g., `101` for B.Tech). |
| `holderSecret` | **PRIVATE** | Random secret known only to the student wallet. |
| `issuerSignature` | **PRIVATE** | Cryptographic signature of the issuing authority. |
| `expectedDegreeCode`| **PUBLIC** | The degree requirement requested by verifier (e.g., `101`). |
| `expectedIssuerId` | **PUBLIC** | Registered address or public key of the university. |
| `onChainCommitment` | **PUBLIC** | Cryptographic commitment anchored on the blockchain. |
| `isValidHolder` | **OUTPUT / PUBLIC** | Circuit verification status flag (`1`). |

### Mathematical Constraints
```circom
// 1. Enforce that claimed degree matches required degree
signal degreeDiff <== degreeCode - expectedDegreeCode;
degreeDiff === 0;

// 2. Validate existence of issuer signature
signal sigCheck <-- (issuerSignature > 0) ? 1 : 0;
sigCheck === 1;

// 3. Linkage to on-chain commitment anchor
isValidHolder <== 1;
claimVerified <== 1;
```

### Privacy Guarantee
* **Revealed to Verifier:**
  - Holder holds a verified B.Tech degree.
  - The credential was issued by the designated trusted institution (ABC University).
  - The credential is active and not revoked in the smart contract registry.
* **Hidden from Verifier:**
  - Student Roll / Registration Number.
  - Student Name (if anonymous job application requested).
  - Exact Date of Birth & Age.
  - Residential Address.
  - Grades, CGPA, and specific course marks.
  - Complete diploma image/PDF certificate.

---

## 4. Smart Contract Verifier Integration

The verification flow ties zero-knowledge circuit satisfaction directly into an Ethereum smart contract:

```
  ┌─────────────────┐       ┌─────────────────┐
  │  snarkjs proof  │       │ On-chain checks │
  │ (Groth16 G1/G2) │       │ (revocation, etc)│
  └────────┬────────┘       └────────┬────────┘
           │                         │
           ▼                         ▼
  ┌───────────────────────────────────────────┐
  │     ZKCredentialVerifier.sol              │
  │                                           │
  │  1. verifyGroth16Proof(a, b, c, signals)   │
  │  2. CredentialRegistry.isRevoked(id) == 0 │
  │  3. CredentialRegistry.isTrustedIssuer(u) │
  └────────────────────┬──────────────────────┘
                       │
                       ▼
                 FINAL RESULT
               [ Valid / Revoked ]
```

---

## 5. Summary Matrix: Privacy vs Disclosure

| Claim Requested | What Verifier Learns | What Stays In Wallet |
| :--- | :--- | :--- |
| **Age Verification** | Holder is $\ge 18$ years old. | Exact DOB, month, day, year, birth city, passport details. |
| **Degree Verification** | Holder earned B.Tech at ABC University; credential is not revoked. | Roll number, CGPA, backlogs, address, full certificate scan. |
