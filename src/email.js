// Email breach lookup via the free XposedOrNot API.
//
// IMPORTANT privacy note: unlike the password check (which uses k-anonymity and
// never reveals the password), an email lookup necessarily sends the address to
// the XposedOrNot service. The UI makes this explicit to the user.
//
// Docs: https://xposedornot.com/api_doc

const BASE = 'https://api.xposedornot.com/v1';

/** Basic, pragmatic email shape check (not RFC-complete on purpose). */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Look up an email and return a normalized breach report.
 * @param {string} email
 * @param {typeof fetch} [fetchImpl] injectable for tests
 * @returns {Promise<ReturnType<typeof parseEmailReport>>}
 */
export async function checkEmail(email, fetchImpl = fetch) {
  const res = await fetchImpl(`${BASE}/breach-analytics?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error(`Email check failed: ${res.status}`);
  return parseEmailReport(await res.json());
}

/**
 * Normalize the (verbose) XposedOrNot analytics payload into a flat shape the
 * UI can render. Exported so it can be unit-tested without the network.
 * @param {object} data raw API response
 */
export function parseEmailReport(data) {
  const details = data?.ExposedBreaches?.breaches_details ?? [];
  const risk = data?.BreachMetrics?.risk?.[0] ?? null;
  const pastes = data?.PastesSummary?.cnt ?? 0;

  const breaches = details.map((b) => ({
    name: b.breach || '',
    domain: b.domain || '',
    date: b.xposed_date || '',
    records: Number(b.xposed_records) || 0,
    logo: b.logo || '',
    industry: b.industry || '',
    description: b.details || '',
    verified: b.verified === 'Yes',
    // xposed_data is a ';'-separated list of leaked data categories.
    data: String(b.xposed_data || '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean),
  }));

  // Sort newest first when a year is present.
  breaches.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return {
    found: breaches.length > 0,
    count: breaches.length,
    riskLabel: risk?.risk_label ?? null,
    riskScore: risk?.risk_score ?? null,
    pastes,
    breaches,
  };
}
