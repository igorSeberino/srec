const db = require('./database');

const createTables = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS resources (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      type VARCHAR(50) NOT NULL, -- 'workstation' or 'meeting_room'
      capacity INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id SERIAL PRIMARY KEY,
      resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
      user_name VARCHAR(100) NOT NULL,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL,
      -- Vocabulário definido em src/domain/reservationStatus.js.
      status VARCHAR(20) DEFAULT 'scheduled',
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await db.query(queryText);
  console.log('[db] schema garantido');
};

module.exports = createTables;
