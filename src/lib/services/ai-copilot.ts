import { readFile } from 'fs/promises';
import { join } from 'path';
import { getTestRunById } from '../db/queries';

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';

export interface AIFixSuggestion {
  originalSelector: string;
  suggestedSelector: string;
  confidence: number;
  explanation: string;
}

interface CloudflareAIResponse {
  result: {
    response: string;
  };
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
}

async function callCloudflareAI(
  prompt: string,
  model: string = '@cf/meta/llama-3.1-8b-instruct',
  imageBase64?: string
): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.WORKER_AI_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID and WORKER_AI_TOKEN must be set in environment variables');
  }

  const url = `${CLOUDFLARE_API_BASE}/accounts/${accountId}/ai/run/${model}`;

  // Build the request body
  const requestBody: any = {
    prompt: prompt,
  };

  // Add image if provided
  if (imageBase64) {
    requestBody.image = imageBase64;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Cloudflare AI API error: ${response.status} ${response.statusText} - ${errorData}`);
  }

  const data: CloudflareAIResponse = await response.json();

  if (!data.success) {
    const errorMessages = data.errors.map(e => e.message).join(', ');
    throw new Error(`Cloudflare AI error: ${errorMessages}`);
  }

  return data.result.response;
}

export async function analyzeFailure(
  runId: string
): Promise<AIFixSuggestion[]> {
  const run = await getTestRunById(runId);
  if (!run) {
    throw new Error('Run not found');
  }

  let screenshotBase64 = '';

  try {
    const screenshotPath = join(run.artifacts_path, 'screenshots', 'failure.png');
    const screenshotBuffer = await readFile(screenshotPath);
    screenshotBase64 = screenshotBuffer.toString('base64');
  } catch {
    // Screenshot not available
  }

  const prompt = `You are an expert in Playwright testing and CSS/XPath selectors. Analyze this test failure and suggest selector fixes.

Test Logs:
${run.logs || 'No logs available'}

Error Message:
${run.error || 'No error message'}

Please provide:
1. The broken selector (if identifiable)
2. A suggested fix for the selector
3. Your confidence level (0-100%)
4. An explanation of why the selector broke and how the fix addresses it

Respond ONLY in JSON format with the following structure (no markdown, no explanation before or after):
{
  "suggestions": [
    {
      "originalSelector": "...",
      "suggestedSelector": "...",
      "confidence": 85,
      "explanation": "..."
    }
  ]
}`;

  const response = await callCloudflareAI(prompt, '@cf/meta/llama-3.1-8b-instruct', screenshotBase64 || undefined);

  // Parse JSON from response
  try {
    // Try to find JSON in the response (in case there's extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON response from AI');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.suggestions as AIFixSuggestion[];
  } catch (error) {
    console.error('Failed to parse AI response:', response);
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to generate text using Cloudflare Workers AI
export async function generateText(
  prompt: string,
  model: string = '@cf/meta/llama-3.1-8b-instruct'
): Promise<string> {
  return callCloudflareAI(prompt, model);
}