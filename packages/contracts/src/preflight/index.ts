// ─── Public types ──────────────────────────────────────────────────────────────
export type {
  PreflightMode,
  StatefulPolicy,
  PreflightOptions,
  PreflightIssue,
  PreflightResult,
  SafeResult,
  SafeFailureStage,
} from "./types.js";

// ─── Errors ───────────────────────────────────────────────────────────────────
export { MissingSignerError } from "./errors.js";

// ─── Issue codes ───────────────────────────────────────────────────────────────
export * as IssueCodes from "./issue-codes.js";

// ─── Preflight client ──────────────────────────────────────────────────────────
export { createPreflightClient } from "./preflight-client.js";
export type {
  PreflightClientConfig,
  PreflightOakContractsClient,
  PreflightCampaignInfoFactoryEntity,
  PreflightTreasuryFactoryEntity,
  PreflightPaymentTreasuryEntity,
  PreflightAllOrNothingTreasuryEntity,
  PreflightKeepWhatsRaisedTreasuryEntity,
} from "./preflight-client.js";

// ─── Validator input types (for preflight() calls) ─────────────────────────────
export type { DeployInput } from "./validators/treasury-factory.js";
export type {
  CreatePaymentInput,
  CreatePaymentBatchInput,
  ConfirmPaymentInput,
  ConfirmPaymentBatchInput,
  ProcessCryptoPaymentInput,
  CancelPaymentInput,
  PtWithdrawInput,
  PtClaimRefundInput,
  PtClaimRefundSelfInput,
  PtClaimExpiredFundsInput,
  PtDisburseFeesInput,
  PtClaimNonGoalLineItemsInput,
} from "./validators/payment-treasury.js";
export type {
  AonPledgeForARewardInput,
  AonPledgeWithoutARewardInput,
  AddRewardsInput,
  AonWithdrawInput,
  AonClaimRefundInput,
  AonDisburseFeesInput,
  RemoveRewardInput,
} from "./validators/all-or-nothing.js";
export type {
  ConfigureTreasuryInput,
  KwrPledgeForARewardInput,
  KwrPledgeWithoutARewardInput,
  SetFeeAndPledgeInput,
  KwrWithdrawInput,
  KwrClaimRefundInput,
  KwrClaimTipInput,
  KwrClaimFundInput,
  KwrDisburseFeesInput,
  ApproveWithdrawalInput,
} from "./validators/keep-whats-raised.js";
