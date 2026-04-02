import { exec } from 'child_process'
import { promisify } from 'util'
import { mkdir, readFile } from 'fs/promises'
import { join } from 'path'
import { 
  createTestRun, 
  updateTestRun, 
  getTestRunById,
  getTestRunsByIntegration,
  getAllIntegrations,
  type Integration,
  type TestRun
} from '../db/queries'

const execAsync = promisify(exec)
const ARTIFACTS_DIR = process.env.ARTIFACTS_DIR || '/app/artifacts'

export async function runTest(integrationId: string): Promise<TestRun> {
  const integration = await getIntegrationById(integrationId)
  if (!integration) {
    throw new Error(`Integration not found: ${integrationId}`)
  }

  const runId = crypto.randomUUID()
  const artifactsPath = join(ARTIFACTS_DIR, runId)
  
  await mkdir(artifactsPath, { recursive: true })
  
  const testRun = await createTestRun(integrationId, artifactsPath)
  
  console.log(`Starting test run ${runId} for integration ${integration.name}`)
  
  // Run test asynchronously
  runTestAsync(runId, integration, artifactsPath)
  
  return testRun
}

async function runTestAsync(
  runId: string, 
  integration: Integration, 
  artifactsPath: string
) {
  try {
    const { stdout, stderr } = await execAsync(
      `npx playwright test ${integration.file_path} --reporter=json`,
      {
        env: {
          ...process.env,
          ARTIFACTS_PATH: artifactsPath,
          PLAYWRIGHT_VIDEO_DIR: join(artifactsPath, 'videos'),
          PLAYWRIGHT_SCREENSHOT_DIR: join(artifactsPath, 'screenshots'),
          PLAYWRIGHT_TRACE_DIR: join(artifactsPath, 'traces')
        },
        timeout: 300000 // 5 minute timeout
      }
    )

    const status = stderr ? 'failed' : 'passed'
    
    await updateTestRun(runId, status, stdout, stderr || undefined)
    
    console.log(`Test run ${runId} completed with status: ${status}`)
  } catch (error) {
    await updateTestRun(runId, 'failed', undefined, String(error))
    console.error(`Test run ${runId} failed:`, error)
  }
}

export async function runAllTests(): Promise<TestRun[]> {
  const integrations = await getAllIntegrations()
  const runs: TestRun[] = []
  
  for (const integration of integrations) {
    try {
      const run = await runTest(integration.id)
      runs.push(run)
    } catch (error) {
      console.error(`Failed to start test for ${integration.id}:`, error)
    }
  }

  return runs
}

export async function getArtifact(runId: string, artifactName: string): Promise<Buffer> {
  const run = await getTestRunById(runId)
  if (!run) {
    throw new Error('Run not found')
  }
  
  const artifactPath = join(run.artifacts_path, artifactName)
  return readFile(artifactPath)
}

async function getIntegrationById(id: string): Promise<Integration | null> {
  const { getIntegrationById } = await import('../db/queries')
  return getIntegrationById(id)
}

export { getTestRunById, getTestRunsByIntegration, getAllIntegrations }
