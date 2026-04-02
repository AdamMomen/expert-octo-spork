import { NextRequest, NextResponse } from 'next/server'
import { runAllTests } from '@/src/lib/services/test-runner'

export async function POST(request: NextRequest) {
  try {
    const runs = await runAllTests()
    return NextResponse.json(runs)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
