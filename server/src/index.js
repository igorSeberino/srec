require('dotenv').config();
const { APP_TIMEZONE } = require('./config/time');
process.env.TZ = process.env.TZ || APP_TIMEZONE;
const createApp = require('./app');
const initDb = require('./config/initDb');
const { pool } = require('./config/database');

const PORT = Number(process.env.PORT || 5000);
const app = createApp();

async function startServer() {
  await initDb();
  const server = app.listen(PORT, () => console.log(`[boot] SREC ouvindo na porta ${PORT}`));
  const shutdown = () => server.close(() => pool.end(() => process.exit(0)));
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
  return server;
}

if (require.main === module) {
  startServer().catch(async (err) => {
    console.error('[boot] não foi possível garantir o schema; abortando', err.message);
    await pool.end().catch(() => {});
    process.exit(1);
  });
}

module.exports = app;
