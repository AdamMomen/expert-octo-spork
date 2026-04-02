import { db } from './index'

export interface Integration {
  id: string
  name: string
  file_path: string
  created_at: Date
  updated_at: Date
}

export interface TestRun {
  id: string
  integration_id: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  started_at: Date
  completed_at?: Date
  artifacts_path: string
  logs?: string
  error?: string
}

export async function getAllIntegrations(): Promise<Integration[]> {
  return db.query<Integration>('SELECT * FROM integrations ORDER BY name')
}

export async function getIntegrationById(id: string): Promise<Integration | null> {
  return db.queryOne<Integration>('SELECT * FROM integrations WHERE id = $1', [id])
}

export async function getTestRunsByIntegration(integrationId: string): Promise<TestRun[]> {
  return db.query<TestRun>(
    'SELECT * FROM test_runs WHERE integration_id = $1 ORDER BY started_at DESC',
    [integrationId]
  )
}

export async function getTestRunById(id: string): Promise<TestRun | null> {
  return db.queryOne<TestRun>('SELECT * FROM test_runs WHERE id = $1', [id])
}

export async function createTestRun(integrationId: string, artifactsPath: string): Promise<TestRun> {
  const id = crypto.randomUUID()
  await db.query(
    `INSERT INTO test_runs (id, integration_id, status, started_at, artifacts_path) 
     VALUES ($1, $2, 'running', NOW(), $3)`,
    [id, integrationId, artifactsPath]
  )
  return (await getTestRunById(id))!
}

export async function updateTestRun(
  id: string, 
  status: TestRun['status'], 
  logs?: string, 
  error?: string
): Promise<void> {
  await db.query(
    `UPDATE test_runs 
     SET status = $1, completed_at = NOW(), logs = $2, error = $3
     WHERE id = $4`,
    [status, logs || null, error || null, id]
  )
}

export async function getDashboardStats() {
  const totalIntegrations = await db.queryOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM integrations'
  )
  
  const recentRuns = await db.query<{
    status: string
    count: number
  }>(`
    SELECT status, COUNT(*) as count 
    FROM test_runs 
    WHERE started_at > NOW() - INTERVAL '24 hours'
    GROUP BY status
  `)
  
  const failingIntegrations = await db.query<{
    id: string
    name: string
    last_run_status: string
  }>(`
    SELECT DISTINCT ON (i.id) i.id, i.name, tr.status as last_run_status
    FROM integrations i
    LEFT JOIN test_runs tr ON i.id = tr.integration_id
    ORDER BY i.id, tr.started_at DESC
  `)
  
  const passed = recentRuns.find(r => r.status === 'passed')?.count || 0
  const failed = recentRuns.find(r => r.status === 'failed')?.count || 0
  const total = passed + failed
  
  return {
    totalIntegrations: totalIntegrations?.count || 0,
    recentRuns: {
      passed,
      failed,
      total,
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0
    },
    failingIntegrations: failingIntegrations.filter(i => i.last_run_status === 'failed')
  }
}
