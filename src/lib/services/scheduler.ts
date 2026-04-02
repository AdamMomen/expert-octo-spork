import { schedule } from 'node-cron'
import { runAllTests } from './test-runner'

let scheduledTask: ReturnType<typeof schedule> | null = null

export function startNightlyRuns() {
  if (scheduledTask) {
    console.log('Nightly scheduler already running')
    return
  }

  scheduledTask = schedule('0 2 * * *', async () => {
    console.log('Starting nightly test runs...')
    try {
      await runAllTests()
    } catch (error) {
      console.error('Nightly runs failed:', error)
    }
  })

  console.log('Nightly scheduler started (runs at 2 AM)')
}

export function stopScheduler() {
  if (scheduledTask) {
    scheduledTask.stop()
    scheduledTask = null
    console.log('Nightly scheduler stopped')
  }
}
