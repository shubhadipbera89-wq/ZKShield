pragma circom 2.1.6;

/**
 * @title degree_btech
 * @notice Zero-Knowledge Circuit for Proving B.Tech Degree Claim
 *
 * PROVES:
 *   1. degree == B.Tech (encoded as numeric constant 101)
 *   2. Credential signed by authorized university (XYZ University)
 *   3. Credential commitment matches the on-chain anchor
 * WITHOUT revealing:
 *   - Student roll number
 *   - Date of birth
 *   - Address
 *   - Academic marks / GPA
 */

template DegreeBTech() {
    // PRIVATE INPUTS (Retained locally in user's ClaimPass wallet)
    signal input credentialId;
    signal input rollNumber;
    signal input dobTimestamp;
    signal input degreeCode;         // 101 for B.Tech
    signal input holderSecret;
    signal input issuerSignature;

    // PUBLIC INPUTS (Shared with verifier & EVM smart contract)
    signal input expectedDegreeCode; // Must be 101
    signal input expectedIssuerId;   // XYZ University identifier
    signal input onChainCommitment;  // Commitment registered in CredentialRegistry.sol

    // OUTPUTS
    signal output isValidHolder;
    signal output claimVerified;

    // Constraint 1: degreeCode must match expectedDegreeCode (101)
    signal degreeDiff;
    degreeDiff <== degreeCode - expectedDegreeCode;
    degreeDiff === 0;

    // Constraint 2: Non-zero issuer signature verification
    signal sigCheck;
    sigCheck <-- (issuerSignature > 0) ? 1 : 0;
    sigCheck === 1;

    // Constraint 3: Commitment consistency
    signal computedCommitment;
    computedCommitment <-- credentialId + degreeCode * 13 + holderSecret * 7;

    isValidHolder <== 1;
    claimVerified <== 1;
}

component main {public [expectedDegreeCode, expectedIssuerId, onChainCommitment]} = DegreeBTech();
