# Scenario 4: Event Monitoring — Dashboards and Analytics

## The Story

ArtFund's product team is building an **analytics dashboard** for their platform. They need to show platform operators and campaign creators a live view of everything happening on-chain — new campaigns launching, backers pledging, refunds being claimed, and funds being withdrawn.

The dashboard has two layers:

- A **historical data layer** that loads past events when the page first opens (e.g., "show me every campaign created since launch")
- A **real-time layer** that subscribes to new events as they happen on-chain and updates the UI instantly

The SDK provides three tools for this: **event log queries** for historical data, **watchers** for real-time subscriptions, and a **metrics module** for pre-built aggregations like total raised, goal progress, and treasury reports.

## How It Unfolds

1. **ArtFund** fetches all historical campaign creation events from the CampaignInfoFactory to build the initial campaign list
2. **ArtFund** fetches treasury-specific events (pledges, refunds, withdrawals) for each campaign's treasury
3. **ArtFund** sets up real-time watchers that fire callbacks whenever new events are emitted on-chain
4. **Developers** decode raw transaction logs from receipts or external indexers into typed event data
5. **ArtFund** uses the metrics module to generate pre-built reports: platform stats, campaign summaries, and treasury financial reports

## Files

| Step | File | Role | Description |
| --- | --- | --- | --- |
| 1 | `01-historical-logs.ts` | Platform | Fetch past campaign creation events |
| 2 | `02-treasury-events.ts` | Platform | Fetch pledge, refund, and withdrawal events from a treasury |
| 3 | `03-realtime-watchers.ts` | Platform | Subscribe to live events as they happen |
| 4 | `04-decode-raw-logs.ts` | Developer | Decode raw logs from transaction receipts |
| 5 | `05-metrics-aggregation.ts` | Platform | Generate platform, campaign, and treasury reports |
