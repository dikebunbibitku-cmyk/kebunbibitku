const { load } = require('./_db.js');

module.exports = async (req, res) => {
  try {
    const data = await load();
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
