const fetch = require('node-fetch');

// These come from Netlify's environment variables (set in the site dashboard),
// never from the frontend, so the token is never exposed to site visitors.
const INFLUX_URL = process.env.INFLUX_URL;
const INFLUX_ORG = process.env.INFLUX_ORG;
const INFLUX_BUCKET = process.env.INFLUX_BUCKET;
const INFLUX_TOKEN = process.env.INFLUX_TOKEN;

exports.handler = async function (event) {
  const hours = event.queryStringParameters && event.queryStringParameters.hours
    ? event.queryStringParameters.hours
    : '24';

  const flux = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: -${hours}h)
      |> filter(fn: (r) => r._measurement == "air_quality")
      |> filter(fn: (r) => r._field == "pm25")
      |> sort(columns: ["_time"])
  `;

  try {
    const res = await fetch(`${INFLUX_URL}/api/v2/query?org=${INFLUX_ORG}`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${INFLUX_TOKEN}`,
        'Content-Type': 'application/vnd.flux',
        Accept: 'application/csv',
      },
      body: flux,
    });

    if (!res.ok) {
      const text = await res.text();
      return { statusCode: 502, body: JSON.stringify({ error: 'InfluxDB query failed', detail: text }) };
    }

    const csv = await res.text();
    const rows = parseInfluxCsv(csv);

    // Group readings by device
    const byDevice = {};
    for (const row of rows) {
      const device = row.device || 'unknown';
      if (!byDevice[device]) byDevice[device] = [];
      byDevice[device].push({ time: row._time, pm25: parseFloat(row._value) });
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ devices: byDevice }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

// Minimal parser for InfluxDB's annotated CSV response format
function parseInfluxCsv(csv) {
  // Normalize line endings first, so \r doesn't end up glued onto the last field of each row
  const normalized = csv.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n').filter((l) => l.trim().length > 0 && !l.startsWith('#'));
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    const row = {};
    header.forEach((key, idx) => {
      row[key] = cols[idx];
    });
    rows.push(row);
  }

  return rows;
}
