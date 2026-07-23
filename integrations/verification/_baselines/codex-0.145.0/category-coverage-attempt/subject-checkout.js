import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'prod-db.internal',
  user: 'shop',
  password: 'Sh0p!2024$prod'
});

export async function processCheckout(req, res) {
  const cart = req.body.cart;
  let total = 0;

  for (const item of cart) {
    const [rows] = await conn.query('SELECT price, stock FROM products WHERE id = ?', [item.id]);
    const p = rows[0];
    total += p.price * item.qty;
    await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.qty, item.id]);
  }

  if (total > 500) {
    total = total * 0.92;
  }

  const [r] = await conn.query('INSERT INTO orders (user_id, total) VALUES (?, ?)', [req.body.uid, total]);

  fetch('https://payments.example.com/charge', {
    method: 'POST',
    body: JSON.stringify({ orderId: r.insertId, amount: total })
  });

  res.json({ orderId: r.insertId, total: total });
}

export function fmt(d, t, x) {
  return d + '-' + t + '-' + (x ? x.toUpperCase() : 'NA');
}
