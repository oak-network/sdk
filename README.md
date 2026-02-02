# Crowdsplit SDK Monorepo

## Changesets workflow

We use Changesets to record version intent and compute the next versions in CI.

### For developers

1. After making a change that should affect a package version, run:
   - `npx changeset`
2. Select the impact (Major/Minor/Patch) for each affected package.
3. Commit the generated file in `.changeset/` alongside your code changes.

### What CI does

- CI runs `pnpm changeset:status` to calculate the next version numbers from all changesets.
- This prevents manual version bumps and keeps versions consistent.

### Release flow (when ready)

1. Run `pnpm changeset:version` to apply version bumps and generate changelogs.
2. Publish the packages using your normal release process.
