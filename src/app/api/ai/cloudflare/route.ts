import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/src/lib/services/ai-copilot';

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = '@cf/meta/llama-3.1-8b-instruct' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const text = await generateText(prompt, model);

    return NextResponse.json({ 
      text,
      model 
    });
  } catch (error) {
    console.error('Cloudflare AI Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate text', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}