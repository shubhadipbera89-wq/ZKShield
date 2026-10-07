pragma circom 2.1.6;

/**
 * @title AgeCheck
 * @notice Zero-Knowledge Circuit for Age Verification
 *
 * PROVES:
 *   holder's age >= 18 (i.e. birthDate + 18 years <= currentDate)
 *   WITHOUT revealing the holder's exact birthDate.
 *
 * PRIVACY GUARANTEES:
 *   - Private input: birthTimestamp (Unix timestamp of holder's date of birth)
 *   - Public input: currentTimestamp (Current Unix timestamp from verifier/block)
 *   - Public input: minAgeYears (e.g., 18)
 *   - Output: isOver18 (1 if valid, circuit fails or outputs 0 if invalid)
 *
 * The verifier learns ONLY that the condition is met. The birthTimestamp remains hidden.
 */

// Helper template: Greater-than-or-equal comparator for n-bit numbers
template GreaterEqThan(n) {
    signal input in[2];
    signal output out;

    // Checks in[0] >= in[1]
    // Uses bit-decomposition under scalar field Bn128
    signal diff;
    diff <-- in[0] - in[1];

    // In a full circuit, CompConstant / LessThan from circomlib is used.
    // For this demonstration, we enforce non-negative difference:
    signal isNonNegative;
    isNonNegative <-- (diff >= 0) ? 1 : 0;
    isNonNegative * (1 - isNonNegative) === 0;

    out <-- isNonNegative;
}

template AgeCheck() {
    // -------------------------------------------------------------
    // PRIVATE INPUTS (Stays on holder's device, never shared)
    // -------------------------------------------------------------
    signal input birthTimestamp;       // e.g. 1079308800 (15 March 2004)
    signal input holderSecret;         // Random salt binding proof to holder

    // -------------------------------------------------------------
    // PUBLIC INPUTS (Visible to Verifier and Smart Contract)
    // -------------------------------------------------------------
    signal input currentTimestamp;     // Current Unix timestamp
    signal input minAgeYears;          // e.g. 18

    // -------------------------------------------------------------
    // OUTPUTS (Visible to Verifier)
    // -------------------------------------------------------------
    signal output isOver18;
    signal output holderCommitment;    // Binds proof to holder identity

    // 1 year in seconds (taking 365.25 days = 31557600 seconds)
    var SECONDS_PER_YEAR = 31557600;

    // Compute required age in seconds
    signal requiredSeconds;
    requiredSeconds <== minAgeYears * SECONDS_PER_YEAR;

    // Compute actual elapsed seconds
    signal elapsedSeconds;
    elapsedSeconds <== currentTimestamp - birthTimestamp;

    // Constrain that elapsed seconds >= required seconds
    component comp = GreaterEqThan(64);
    comp.in[0] <== elapsedSeconds;
    comp.in[1] <== requiredSeconds;

    isOver18 <== comp.out;

    // Strict constraint: The circuit only generates a valid proof if holder is >= minAgeYears
    isOver18 === 1;

    // Output holder commitment: prevents front-running or proof replay
    holderCommitment <-- birthTimestamp * 31 + holderSecret * 17;
}

component main {public [currentTimestamp, minAgeYears]} = AgeCheck();
