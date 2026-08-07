// Display helpers shared by the Simulator page sections. All money is USD and
// rendered in the mono numeric face by the callers.

export const usd = (n: number, decimals = 2) =>
  '$' +
  (Number.isFinite(n) ? n : 0).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/** Compact whole-dollar form used in table cells (e.g. $8,969). */
export const usdWhole = (n: number) => usd(n, 0);

export const signedUsd = (n: number) => (n >= 0 ? '+' : '-') + usd(Math.abs(n));

export const signedPct = (n: number, decimals = 2) =>
  (n >= 0 ? '+' : '') + n.toFixed(decimals) + '%';

/** "Good morning" / "Good afternoon" / "Good evening" for the page greeting. */
export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * First name for the greeting. The Firebase user only carries an email, so the
 * server user document is the source of a real name; fall back to the email
 * local part rather than showing a blank.
 */
export function displayName(
  serverUser: { firstName?: string; username?: string } | null,
  email?: string | null
) {
  const fromServer = serverUser?.firstName?.trim() || serverUser?.username?.trim();
  if (fromServer) return fromServer;
  const local = (email ?? '').split('@')[0];
  return local || 'there';
}
