import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
// @ts-ignore
import * as snarkjs from "snarkjs";



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { proof, publicSignals, verificationKey } = body;

    if (!proof || !publicSignals) {
      return NextResponse.json(
        { error: "Proof and public signals are required" },
        { status: 400 }
      );
    }

    let vKey = verificationKey;
    if (!vKey) {
      const vKeyPath = path.join(process.cwd(), "public", "circuits", "verification_key.json");
      if (fs.existsSync(vKeyPath)) {
        vKey = JSON.parse(fs.readFileSync(vKeyPath, "utf-8"));
      }
    }

    if (!vKey) {
      return NextResponse.json(
        { error: "Verification key not found" },
        { status: 500 }
      );
    }

    // Pass the primary circuit signals (first N matching vKey.nPublic) to snarkjs
    const circuitSignals = publicSignals.slice(0, vKey.nPublic);

    const isValid = await snarkjs.groth16.verify(vKey, circuitSignals, proof);

    return NextResponse.json({
      valid: isValid,
      protocol: "groth16",
      curve: "bn128",
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error("ZK Verify Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify ZK proof", valid: false },
      { status: 500 }
    );
  }
}
