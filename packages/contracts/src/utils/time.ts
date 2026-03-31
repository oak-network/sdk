/**
 * Returns the current Unix time as a bigint in seconds.
 * @returns Current Unix timestamp (seconds)
 */
export function getCurrentTimestamp(): bigint {
  return BigInt(Math.floor(Date.now() / 1000));
}

/**
 * Adds a number of days (expressed as seconds) to a Unix timestamp bigint.
 * @param timestamp - Unix timestamp in seconds
 * @param days - Number of days to add
 * @returns New timestamp as bigint
 */
export function addDays(timestamp: bigint, days: number): bigint {
  return timestamp + BigInt(days) * 86400n;
}
