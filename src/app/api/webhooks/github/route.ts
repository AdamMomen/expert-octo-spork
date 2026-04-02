import { NextRequest, NextResponse } from 'next/server'
import { runTest } from '@/src/lib/services/test-runner'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    
    // Check if any integration files were changed
    const changedFiles = payload.commits?.flatMap((commit: any) => [
      ...(commit.added || []),
      ...(commit.modified || []),
      ...(commit.removed || [])
    ]) || []
    
    const integrationFiles = changedFiles.filter((f: string) => 
      f.startsWith('integrations/') && f.endsWith('.spec.ts')
    )
    
    if (integrationFiles.length === 0) {
      return NextResponse.json({ message: 'No integration files changed' })
    }
    
    // Run tests for changed integrations
    for (const file of integrationFiles) {
      const integrationId = file.replace('integrations/', '').replace('.spec.ts', '')
      try {
        await runTest(integrationId)
      } catch (error) {
        console.error(`Failed to run test for ${integrationId}:`, error)
      }
    }
    
    return NextResponse.json({ 
      message: 'Tests triggered',
      integrations: integrationFiles 
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
