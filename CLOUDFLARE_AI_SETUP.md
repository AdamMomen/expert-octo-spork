# Cloudflare Workers AI Setup (REST API)

This project uses Cloudflare Workers AI via the REST API. This approach works from anywhere (Vercel, local development, etc.) without needing to deploy a Cloudflare Worker.

## How It Works

Instead of running code inside a Cloudflare Worker, your Next.js app makes HTTP requests to Cloudflare's AI API endpoint:

```
https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/{MODEL}
```

This means:
- ✅ Your app stays on Vercel (or wherever you host it)
- ✅ No need to create or deploy Cloudflare Workers
- ✅ Works in local development
- ✅ Simple HTTP calls with your API token

## Prerequisites

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages)
2. Get your API credentials from the [Cloudflare Dashboard](https://dash.cloudflare.com/?to=/:account/ai/workers-ai)

## Dependencies

No additional packages required! This implementation uses the native `fetch()` API to call Cloudflare's REST API directly.

## Setup

### 1. Get Your Credentials

1. Go to the Cloudflare Dashboard → Workers AI
2. Click **Use REST API**
3. Click **Create a Workers AI API Token**
4. Copy the API token
5. Copy your Account ID

### 2. Set Environment Variables

Add these to your `.env.local` file:

```env
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
WORKER_AI_TOKEN=your_api_token_here
```

**Never commit these values to git!**

## Usage

### Analyze Test Failures

```typescript
import { analyzeFailure } from '@/lib/services/cloudflare-ai';

const suggestions = await analyzeFailure(runId);
// Returns: AIFixSuggestion[] with selector fixes
```

### Generate Text

```typescript
import { generateText } from '@/lib/services/cloudflare-ai';

const response = await generateText('Write a haiku about testing');
// Returns: string with the AI response
```

Or use the API endpoint:

```bash
curl -X POST http://localhost:3000/api/ai/cloudflare \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, how are you?", "model": "@cf/meta/llama-3.1-8b-instruct"}'
```

## Available Models

Use any model from the [Workers AI catalog](https://developers.cloudflare.com/workers-ai/models/):

- `@cf/meta/llama-3.1-8b-instruct` (default, recommended)
- `@cf/meta/llama-2-7b-chat-int8`
- `@cf/mistral/mistral-7b-instruct-v0.1`
- And many more...

## Pricing

Cloudflare Workers AI uses a pay-per-use model:
- You only pay for what you use
- Check current pricing at [Cloudflare's pricing page](https://developers.cloudflare.com/workers-ai/platform/pricing/)

## Troubleshooting

### "CLOUDFLARE_ACCOUNT_ID and WORKER_AI_TOKEN must be set"
Make sure you've added both environment variables to your `.env.local` file and restarted your dev server.

### "Cloudflare AI API error: 401"
Your API token is invalid or expired. Generate a new one in the Cloudflare dashboard.

### "Cloudflare AI API error: 403"
Your API token doesn't have the right permissions. Make sure it has `Workers AI - Read` and `Workers AI - Edit` permissions.

## Documentation

- [Cloudflare Workers AI REST API](https://developers.cloudflare.com/workers-ai/get-started/rest-api/)
- [Workers AI Models](https://developers.cloudflare.com/workers-ai/models/)
- [API Reference](https://developers.cloudflare.com/api/resources/ai/methods/run/)