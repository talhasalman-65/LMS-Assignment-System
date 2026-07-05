const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', port: 5432, database: 'smartassign_lms', user: 'postgres', password: 'mariadb1' });
pool.query('SELECT id, email, role, status, password_hash FROM users WHERE email = $1', ['student1@smartassign.com'])
  .then(r => console.log(JSON.stringify(r.rows[0], null, 2)))
  .catch(e => console.error(e))
  .finally(() => pool.end());