const crypto = require('crypto');
const { save } = require('./_db.js');

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();
const s = (v, n) => String(v ?? '').slice(0, n);

function clean(d) {
  if (!d || typeof d !== 'object') return null;
  const shop = { name: s(d.shop?.name, 60), tagline: s(d.shop?.tagline, 100), logo: s(d.shop?.logo, 8) };
  const blocks = [...new Set((Array.isArray(d.blocks) ? d.blocks : []).map((b) => s(b, 40).trim()).filter(Boolean))].slice(0, 100);
  const items = (Array.isArray(d.items) ? d.items : []).slice(0, 1000).map((i) => ({
    id: s(i.id, 30),
    name: s(i.name, 80),
    price: Math.max(0, parseInt(i.price) || 0),
    stock: i.stock > 0 ? 1 : 0,
    block: s(i.block, 40),
    row: s(i.row, 40),
    emoji: s(i.emoji, 8),
  }));
  return { updated: s(d.updated, 30), shop, blocks, items };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metode tidak diizinkan' });
  const admin = process.env.ADMIN_PASSWORD;
  if (!admin) return res.status(500).json({ error: 'ADMIN_PASSWORD belum diisi di Vercel' });

  const body = req.body || {};
  const ok = crypto.timingSafeEqual(sha(body.password ?? ''), sha(admin));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 800)); // memperlambat tebak-tebakan sandi
    return res.status(401).json({ error: 'Kata sandi salah' });
  }
  if (body.check) return res.status(200).json({ ok: true });

  const data = clean(body.data);
  if (!data) return res.status(400).json({ error: 'Data tidak valid' });
  try {
    await save(data);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
