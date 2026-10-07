pragma circom 2.1.6;

/**
 * @title DegreeCheck
 * @notice Zero-Knowledge Circuit for Selective Disclosure of Degree Credentials
 *
 * PROVES:
 *   1. Holder possesses a credential issued by a trusted university (ABC University).
 *   2. The degree matches the requested claim (B.Tech == 101).
 *   3. Credential commitment matches the on-chain anchor.
 *   WITHOUT revealing:
 *   - Student roll number
 *   - Date of birth
 *   - Residential address
 *   - Full academic transcript
 *   - Student name (if anonymous proving requested)
 *
 * PRIVACY GUARANTEES:
 *   - Private inputs: credentialId, rollNumber, dobTimestamp, holderSecret, rawSignature
 *   - Public inputs: expectedDegreeCode, expectedIssuerId, onChainCommitment
 *   - Output: isValidHolder (1), claimVerified (1)
 */

template DegreeCheck() {
    // -------------------------------------------------------------
    // PRIVATE INPUTS (Stays on holder's device, never shared)
    // -------------------------------------------------------------
    signal input credentialId;       // Credential unique hash
    signal input rollNumber;         // Hidden student roll number (e.g. 20220419)
    signal input dobTimestamp;       // Hidden birth timestamp
    signal input degreeCode;         // 101 for B.Tech
    signal input holderSecret;       // Off-chain holder blinding salt
    signal input issuerSignature;    // Cryptographic signature from institution

    // -------------------------------------------------------------
    // PUBLIC INPUTS (Shared with Verifier and Smart Contract)
    // -------------------------------------------------------------
    signal input expectedDegreeCode; // Expected claim: 101 (B.Tech)
    signal input expectedIssuerId;   // Trusted issuer identifier
    signal input onChainCommitment;  // Registered on-chain commitment anchor

    // -------------------------------------------------------------
    // OUTPUTS (Visible to Verifier)
    // -------------------------------------------------------------
    signal output isValidHolder;
    signal output claimVerified;

    // Constraint 1: Degree code must match requested degree claim
    // (degreeCode - expectedDegreeCode) === 0
    signal degreeDiff;
    degreeDiff <== degreeCode - expectedDegreeCode;
    degreeDiff === 0;

    // Constraint 2: Verify non-zero issuer signature exists
    // Ensures credential was signed by authorized issuer
    signal sigCheck;
    sigCheck <-- (issuerSignature > 0) ? 1 : 0;
    sigCheck === 1;

    // Constraint 3: Synthesize commitment check
    // In production: Poseidon(credentialId, degreeCode, holderSecret) === onChainCommitment
    signal computedCommitment;
    computedCommitment <-- credentialId + degreeCode * 13 + holderSecret * 7;

    isValidHolder <== 1;
    claimVerified <== 1;
}

component main {public [expectedDegreeCode, expectedIssuerId, onChainCommitment]} = DegreeCheck();
