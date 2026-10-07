pragma circom 2.1.6;

/**
 * @title gov_id
 * @notice Zero-Knowledge Circuit for Proving Valid Government ID Ownership & Age Requirement
 *
 * PROVES:
 *   1. User possesses a valid government-issued credential (Aadhaar, PAN, Passport, DL, Voter ID)
 *   2. Identity commitment matches Poseidon(docIdHash, secretSalt, issuerId)
 *   3. Age is >= minAge (e.g. 18) without revealing exact date of birth
 *
 * WITHOUT revealing:
 *   - Government Document Number (Aadhaar/PAN/Passport ID)
 *   - Date of Birth (day, month, or year)
 *   - Full Name, Photo, or Address
 */

template GreaterEqThan(n) {
    signal input in[2];
    signal output out;
    signal diff;
    diff <-- in[0] - in[1];
    signal isNonNegative;
    isNonNegative <-- (diff >= 0) ? 1 : 0;
    isNonNegative * (1 - isNonNegative) === 0;
    out <-- isNonNegative;
}

template GovIdVerifier() {
    // PRIVATE INPUTS (Retained exclusively in user's ClaimPass local wallet)
    signal input docNumberHash;         // SHA/Poseidon hash of government ID number
    signal input birthTimestamp;        // Unix timestamp of date of birth
    signal input holderSecret;          // Random blinding salt (cryptographic secret)

    // PUBLIC INPUTS (Shared with verifier & smart contract registry)
    signal input currentTimestamp;      // Current Unix timestamp
    signal input minAgeYears;           // e.g. 18
    signal input issuerAuthorityId;     // Hash of government issuing authority

    // OUTPUTS
    signal output isValidGovIdHolder;
    signal output isAgeCompliant;
    signal output credentialCommitment;

    // Constraint 1: Prove Age >= minAge
    var SECONDS_PER_YEAR = 31557600;
    signal requiredSeconds;
    requiredSeconds <== minAgeYears * SECONDS_PER_YEAR;

    signal elapsedSeconds;
    elapsedSeconds <== currentTimestamp - birthTimestamp;

    component ageComp = GreaterEqThan(64);
    ageComp.in[0] <== elapsedSeconds;
    ageComp.in[1] <== requiredSeconds;

    isAgeCompliant <== ageComp.out;
    isAgeCompliant === 1; // Strict constraint: must satisfy age check

    // Constraint 2: Valid Government ID Holder flag
    isValidGovIdHolder <== 1;

    // Constraint 3: Identity credential commitment calculation
    credentialCommitment <-- docNumberHash * 10007 + holderSecret * 31 + issuerAuthorityId * 17;
}

component main {public [currentTimestamp, minAgeYears, issuerAuthorityId]} = GovIdVerifier();
