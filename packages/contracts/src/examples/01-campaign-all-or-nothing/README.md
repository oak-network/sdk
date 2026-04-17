# Scenario 1: Crowdfunding Campaign — All-or-Nothing

## The Story

Maya is a ceramic artist who sells her handmade pottery through **ArtFund**, a creative crowdfunding platform built on Oak Protocol. She wants to raise **$5,000** to fund a new collection called "Earth & Fire" — a series of hand-thrown vases and bowls inspired by volcanic landscapes.

Maya chooses the **All-or-Nothing** funding model. This means every dollar pledged is held in an on-chain treasury until the campaign deadline. If the campaign reaches its $5,000 goal, Maya can withdraw the funds and fulfill rewards to her backers. If the goal is not met, every backer receives a full refund automatically — no questions asked.

This model builds trust with backers because their funds are protected by the smart contract. Maya cannot access the money unless the community collectively meets the target.

## Multi-token support

Maya’s campaign accepts whatever **ERC-20s** the platform mapped to her campaign **currency** at creation time. Each pledge passes **`pledgeToken`**; the All-or-Nothing treasury checks **`CampaignInfo.isTokenAccepted`**. Raised totals aggregate across accepted tokens (normalized on-chain); refunds return **the same token** the backer used. The TypeScript steps use **one token address** as a stand-in—replace it with any **whitelisted** token for your deployment.

## How It Unfolds

1. **Maya (Creator)** creates the campaign through the CampaignInfoFactory, setting the funding goal, deadline, platform, and NFT metadata for backer receipts
2. **Maya** looks up the deployed campaign contract address using her unique campaign identifier
3. **Maya** reviews the on-chain campaign details to confirm everything matches her intent
4. **Maya** deploys an All-or-Nothing treasury via the TreasuryFactory — this is the contract that will hold all pledged funds
5. **Maya** adds reward tiers (and optionally removes one she no longer wants to offer)
6. **Backers** pledge — either by choosing a reward tier or by contributing a flat amount without a reward
7. **Anyone** monitors the campaign dashboard: total raised vs. goal, days remaining, treasury state, and reward details
8. **Anyone** disburses protocol and platform fees — this must happen before withdrawal
9. The campaign deadline arrives. Two outcomes are possible:
   - **(a) Success:** Anyone triggers a withdrawal — funds always go to the campaign owner (Maya)
   - **(b) Failure:** The goal is not met. Anyone can call `claimRefund(tokenId)` — funds always go to the NFT owner, and the NFT is burned
10. **ArtFund (Platform Admin)** can pause and unpause a treasury if an investigation is needed
11. **ArtFund (Platform Admin) or Maya (Creator)** can permanently cancel the treasury — backers can still claim refunds

## Files

| Step | File | Role | Description |
| --- | --- | --- | --- |
| 1 | `01-create-campaign.ts` | Creator | Create a new campaign with goal, deadline, and NFT metadata |
| 2 | `02-lookup-campaign.ts` | Creator | Look up the deployed campaign contract address |
| 3 | `03-review-campaign.ts` | Creator | Read back on-chain campaign details to verify |
| 4 | `04-deploy-treasury.ts` | Creator | Deploy an All-or-Nothing treasury for the campaign |
| 5 | `05-manage-rewards.ts` | Creator | Add reward tiers + optionally remove a tier |
| 6 | `06-backer-pledge.ts` | Backer | Pledge with or without a reward tier |
| 7 | `07-monitor-progress.ts` | Anyone | Full campaign dashboard — raised amount, treasury state, reward details |
| 8 | `08-disburse-fees.ts` | Anyone | Disburse protocol and platform fees |
| 9a | `09a-success-withdraw.ts` | Anyone | Goal met — withdraw funds (always sent to campaign owner) |
| 9b | `09b-failure-refund.ts` | Anyone | Goal not met — `claimRefund` burns NFT and returns tokens to NFT owner |
| 10 | `10-pause-unpause-treasury.ts` | Platform Admin | Temporarily freeze and resume treasury operations |
| 11 | `11-cancel-treasury.ts` | Platform Admin or Creator | Permanently cancel a treasury (backers can still refund) |

## Role Reference (from the Smart Contract)

| Function | Who can call | Contract modifier |
| --- | --- | --- |
| `addRewards` / `removeReward` | Creator | `onlyCampaignOwner` |
| `pledgeForAReward` / `pledgeWithoutAReward` | Anyone (backer) | (no role modifier — time-gated) |
| `claimRefund(tokenId)` | Anyone (refund goes to NFT owner) | (no role modifier) |
| `disburseFees` | Anyone | (no role modifier — requires deadline passed + goal met) |
| `withdraw` | Anyone (funds go to campaign owner) | (no role modifier — requires fees disbursed) |
| `pauseTreasury` / `unpauseTreasury` | Platform Admin | `onlyPlatformAdmin` |
| `cancelTreasury` | Platform Admin or Creator | custom check (both roles) |
| `getReward`, `getRaisedAmount`, `paused`, `cancelled`, etc. | Anyone | (read-only) |

