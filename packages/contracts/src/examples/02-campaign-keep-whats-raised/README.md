# Scenario 2: Crowdfunding Campaign — Keep What's Raised

## The Story

**TechForge** is a small team of developers building an open-source code review tool. They want to raise **$10,000** to fund a working prototype, but they know that even partial funding would let them build a smaller version. Unlike Maya's All-or-Nothing campaign (Scenario 1), TechForge wants the flexibility to **keep whatever they raise**, even if the full $10,000 is not reached.

TechForge chooses the **Keep-What's-Raised** funding model on the **ArtFund** platform. This model offers several features that the All-or-Nothing model does not:

- **Partial withdrawals** — The creator can request early access to raised funds mid-campaign (subject to platform approval and a configurable delay)
- **Final withdrawal** — After the deadline, the creator sweeps the remaining balance with applicable fees
- **Tips** — Backers can include an optional tip on top of their pledge
- **Configurable fee structure** — The platform sets flat fees, percentage-based fees, and fee exemption thresholds
- **Refund delays** — A configurable waiting period after the deadline before backers can claim refunds
- **Updatable parameters** — The creator or platform admin can extend the deadline or adjust the funding goal (before the config lock period)

## Multi-token support

Same model as Scenario 1: the campaign whitelists **multiple ERC-20s** per **currency**; each pledge names **`pledgeToken`**; **`withdraw(token, amount)`** and fee paths are **per token**. Example files use a single stablecoin for clarity—use any accepted token from your campaign’s list in real integrations.

## How It Unfolds

1. **TechForge (Creator)** creates the campaign with a $10,000 goal and a 60-day deadline
2. **TechForge** deploys a Keep-What's-Raised treasury for the campaign
3. **ArtFund (Platform Admin)** configures the treasury with withdrawal delays, refund policies, and the fee structure
4. **TechForge** adds reward tiers — and optionally removes one they no longer want to offer
5. **Backers** discover the campaign and pledge — some choose a reward tier, others pledge without a reward as a show of support
6. Two types of withdrawal:
   - **(a) Partial:** ArtFund approves withdrawals, then TechForge withdraws $2,000 mid-campaign to begin prototyping
   - **(b) Final:** After the deadline, TechForge sweeps the remaining balance minus applicable fees
7. **Anyone** monitors the campaign dashboard — total raised vs. goal, fee details, treasury state
8. **Anyone** disburses accumulated protocol and platform fees (must happen before cancellation)
9. **ArtFund (Platform Admin)** claims any residual funds after the withdrawal delay has fully elapsed
10. **ArtFund (Platform Admin)** claims tips that backers included with their pledges
11. **A backer** claims a refund after the deadline + refund delay window — the contract burns their NFT and returns tokens
12. **TechForge or ArtFund** updates the deadline or goal mid-campaign (subject to the config lock period)
13. **ArtFund (Platform Admin)** can pause and unpause a treasury if an investigation is needed
14. **ArtFund (Platform Admin)** can permanently cancel a fraudulent treasury — backers can still claim refunds

## Files

| Step | File | Role | Description | Required? |
| --- | --- | --- | --- | --- |
| 1 | `01-create-campaign.ts` | Creator | Create a 60-day campaign with a $10,000 goal | Required |
| 2 | `02-deploy-treasury.ts` | Creator | Deploy a Keep-What's-Raised treasury | Required |
| 3 | `03-configure-treasury.ts` | Platform Admin | Set withdrawal delays, refund policies, and fees | Required |
| 4 | `04-manage-rewards.ts` | Creator | Add reward tiers + optionally remove a tier | Required |
| 5 | `05-backer-pledge.ts` | Backer | Pledge with or without a reward; platform can set gateway fees | Required |
| 6a | `06a-partial-withdrawal.ts` | Platform Admin + Creator | Platform approves, then creator withdraws partial funds mid-campaign | Required |
| 6b | `06b-final-withdrawal.ts` | Creator or Platform Admin | Post-deadline withdrawal — sweep remaining balance with fees | Required |
| 7 | `07-monitor-progress.ts` | Anyone | Full campaign dashboard — raised amount, fees, treasury state | Required |
| 8 | `08-disburse-fees.ts` | Anyone | Disburse accumulated fees (must call before cancellation) | Required |
| 9 | `09-claim-fund.ts` | Platform Admin | Claim residual funds after the withdrawal delay elapses | Required |
| 10 | `10-claim-tips.ts` | Platform Admin | Claim tips that backers included with their pledges | Required |
| 11 | `11-claim-refund.ts` | Backer | Claim a refund after deadline + refund delay — burns NFT and returns tokens | Required |
| 12 | `12-update-campaign.ts` | Creator or Platform Admin | Update deadline or goal (before config lock period) | (Optional) |
| 13 | `13-pause-unpause-treasury.ts` | Platform Admin | Temporarily freeze and resume treasury operations | (Optional) |
| 14 | `14-cancel-treasury.ts` | Platform Admin | Permanently cancel a treasury (backers can still refund) | (Optional) |

## Role Reference (from the Smart Contract)

| Function | Who can call | Contract modifier |
| --- | --- | --- |
| `configureTreasury` | Platform Admin | `onlyPlatformAdmin` |
| `approveWithdrawal` | Platform Admin | `onlyPlatformAdmin` |
| `withdraw(token, amount)` | Platform Admin or Creator | `onlyPlatformAdminOrCampaignOwner` |
| `claimFund` | Platform Admin | `onlyPlatformAdmin` |
| `claimTip` | Platform Admin | `onlyPlatformAdmin` |
| `disburseFees` | Anyone | (no role modifier) |
| `addRewards` / `removeReward` | Creator | `onlyCampaignOwner` |
| `pledgeForAReward` / `pledgeWithoutAReward` | Anyone (backer) | (no role modifier — time-gated) |
| `setFeeAndPledge` / `setPaymentGatewayFee` | Platform Admin | `onlyPlatformAdmin` |
| `claimRefund` | Anyone (NFT owner) | (no role modifier — time-gated) |
| `updateDeadline` / `updateGoalAmount` | Platform Admin or Creator | `onlyPlatformAdminOrCampaignOwner` |
| `pauseTreasury` / `unpauseTreasury` | Platform Admin | (inherited) |
| `cancelTreasury` | Platform Admin or Creator | `onlyPlatformAdminOrCampaignOwner` |
