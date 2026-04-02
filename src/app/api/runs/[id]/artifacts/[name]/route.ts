import { NextRequest, NextResponse } from 'next/server'
import { getArtifact } from '@/src/lib/services/test-runner'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; name: string } }
) {
  try {
    const buffer = await getArtifact(params.id, params.name)
    
    const contentType = params.name.endsWith('.png') 
      ? 'image/png' 
      : params.name.endsWith('.webm')
      ? 'video/webm'
      : 'application/octet-stream'
    
    return new NextResponse(buffer as unknown as BodyInit, {
      headers: { 'Content-Type': contentType }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Artifact not found' }, { status: 404 })
  }
}
