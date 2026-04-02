import { db } from './index'

const migrations = [
  `
  CREATE TABLE IF NOT EXISTS integrations (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )
  `,
  `
  CREATE TABLE IF NOT EXISTS test_runs (
    id VARCHAR(255) PRIMARY KEY,
    integration_id VARCHAR(255) NOT NULL REFERENCES integrations(id),
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    artifacts_path VARCHAR(500) NOT NULL,
    logs TEXT,
    error TEXT
  )
  `,
  `
  CREATE INDEX IF NOT EXISTS idx_test_runs_integration_id ON test_runs(integration_id)
  `,
  `
  CREATE INDEX IF NOT EXISTS idx_test_runs_started_at ON test_runs(started_at)
  `
]

export async function migrate() {
  console.log('Running migrations...')
  
  for (const migration of migrations) {
    await db.query(migration)
  }
  
  console.log('Migrations complete')
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate()
    .then(() => {
      console.log('Database setup complete')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration failed:', error)
      process.exit(1)
    })
}
