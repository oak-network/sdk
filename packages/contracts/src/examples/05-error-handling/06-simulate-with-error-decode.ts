/**
 * Step 6: One-Call Simulate + Error Decode
 *
 * `simulateWithErrorDecode` is a convenience wrapper that simulates
 * a contract call and automatically decodes any revert into a typed
 * error. It combines the simulation from Step 1 with the error
 * parsing from Step 3 into a single function call.
 *
 * If the simulation succeeds, it returns the SimulationResult.
 * If the simulation reverts, it throws a typed error with a
 * `recoveryHint` property — no manual `getRevertData` /
 * `parseContractError` needed.
 */

import {
  createOakContractsClient,
  keccak256,
  toHex,
  CHAIN_IDS,
  simulateWithErrorDecode,
} from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PRIVATE_KEY! as `0x${string}`,
});

const treasury = oak.allOrNothingTreasury(
  process.env.ALL_OR_NOTHING_ADDRESS! as `0x${string}`,
);

const rewardName = keccak256(toHex("premium-tier"));

try {
  const result = await simulateWithErrorDecode(
    () => treasury.simulate.removeReward(rewardName),
  );

  console.log("Simulation passed — safe to send");
  console.log("Gas estimate:", result.request.gas);

  const txHash = await treasury.removeReward(rewardName);
  await oak.waitForReceipt(txHash);
  console.log("Reward removed");
} catch (error) {
  // error is already a typed contract error with recoveryHint
  const typedError = error as { name: string; recoveryHint?: string };
  console.error(`Would revert: ${typedError.name}`);
  if (typedError.recoveryHint) {
    console.error("Hint:", typedError.recoveryHint);
  }
}
