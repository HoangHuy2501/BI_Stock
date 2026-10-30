
const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,

  // port: Number(process.env.DB_PORT || 1433),

  options: {
    encrypt: false,
    trustServerCertificate: true,
  },

  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },

  connectionTimeout: 15000,
  requestTimeout: 30000,
};

let poolPromise = null;

async function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then((pool) => {
        console.log("✅ Connected to SQL Server");
        pool.on("error", (err) => {
          console.error("SQL Pool Error:", err);
        });
        return pool;
      })
      .catch((error) => {
        poolPromise = null;
        throw error;
      });
  }

  return poolPromise;
}

async function closePool() {
  if (poolPromise) {
    const pool = await poolPromise;
    await pool.close();
    poolPromise = null;
  }
}

module.exports = {
  sql,
  getPool,
  closePool,
};
