const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432,
  database: 'asset_management'
});
pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`)
  .then(res => console.log('TABLES IN DB:', res.rows.map(r => r.table_name)))
  .catch(console.error)
  .finally(() => pool.end());
