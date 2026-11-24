// Penghubung ke database Upstash Redis (REST). Tidak perlu install apa pun.
const KEY = 'bibit-data';

async function redis(cmd) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Database belum terhubung');
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

const SEED = {
  updated: '-',
  shop: { name: 'Kebun Bibitku', tagline: 'Cari lokasi tanaman di kebun', logo: '' },
  blocks: ['Blok A', 'Blok B', 'Blok C'],
  items: [
    { id: 'a1', name: 'Abiu Jumbo', price: 90000, stock: 1, block: 'Blok A', row: 'Baris 1', emoji: '🌳' },
    { id: 'a2', name: 'Alpukat Aligator 1 Meter', price: 99000, stock: 1, block: 'Blok B', row: 'Baris 2', emoji: '🥑' },
    { id: 'a3', name: 'Alpukat Aligator 30-50cm', price: 25000, stock: 1, block: 'Blok B', row: 'Baris 3', emoji: '🥑' },
    { id: 'a4', name: 'Alpukat Black Avocado', price: 60000, stock: 1, block: 'Blok C', row: 'Baris 1', emoji: '🥑' },
  ],
};

async function load() {
  const raw = await redis(['GET', KEY]);
  return raw ? JSON.parse(raw) : SEED;
}
async function save(data) {
  await redis(['SET', KEY, JSON.stringify(data)]);
}

module.exports = { load, save };
