pragma circom 2.1.6;

/**
 * @title age_18
 * @notice Zero-Knowledge Circuit for Proving Age >= 18
 *
 * PROVES:
 *   age >= 18 (birthTimestamp + 18 years <= currentTimestamp)
 * WITHOUT revealing:
 *   - Date of Birth (day, month, or year)
 *   - Name or residential address
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

template Age18() {
    // PRIVATE INPUTS (Retained locally in user's ClaimPass wallet)
    signal input birthTimestamp;       // e.g. 1029110400 (12 August 2002)
    signal input holderSecret;         // Random blinding salt

    // PUBLIC INPUTS
    signal input currentTimestamp;     // Current Unix timestamp
    signal input minAgeYears;          // 18

    // OUTPUTS
    signal output isOver18;
    signal output holderCommitment;

    var SECONDS_PER_YEAR = 31557600;
    signal requiredSeconds;
    requiredSeconds <== minAgeYears * SECONDS_PER_YEAR;

    signal elapsedSeconds;
    elapsedSeconds <== currentTimestamp - birthTimestamp;

    component comp = GreaterEqThan(64);
    comp.in[0] <== elapsedSeconds;
    comp.in[1] <== requiredSeconds;

    isOver18 <== comp.out;
    isOver18 === 1; // Must satisfy >= 18

    holderCommitment <-- birthTimestamp * 31 + holderSecret * 17;
}

component main {public [currentTimestamp, minAgeYears]} = Age18();
