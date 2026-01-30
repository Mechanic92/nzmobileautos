exports.schedule = "@every 15m";

exports.handler = async () => {
  const baseUrl = process.env.URL || process.env.DEPLOY_PRIME_URL;
  if (!baseUrl) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: "Missing URL/DEPLOY_PRIME_URL" }),
    };
  }

  const target = `${baseUrl}/api/cron/expire-bookings`;
  const headers = {};
  if (process.env.CRON_SECRET) headers["x-cron-secret"] = process.env.CRON_SECRET;

  try {
    const res = await fetch(target, { method: "GET", headers });
    const text = await res.text();
    return {
      statusCode: res.status,
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: String(err && err.message ? err.message : err) }),
    };
  }
};
