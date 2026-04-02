import { startNightlyRuns } from '@/src/lib/services/scheduler'

// Start the nightly scheduler when the app starts
if (process.env.NODE_ENV === 'production') {
  startNightlyRuns()
}
