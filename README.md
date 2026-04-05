# SimieBot

SimieBot is a hackathon-focused Auth0 agent workspace built with Next.js, LangGraph, and Auth0 Connected Accounts.

## Current product direction

SimieBot keeps a delegated multi-node architecture:
- `general`: Gmail, Calendar, user identity, and general assistant tasks
- `finance`: future Coinbase connected-account workflows
- `creator`: Drive/Slack -> Amazon Nova planning -> FFmpeg render -> YouTube workflows

The graph intentionally routes requests through a router node first, then delegates to a specialist node.

## Scope

This refactor removes the off-scope research and web-automation themes and keeps the project aligned to what Auth0 judges care about:
- secure connected accounts
- Token Vault
- step-up authorization
- on-behalf-of-user workflows

## Models

SimieBot now targets Amazon Bedrock through `@langchain/aws` and defaults to:
- `us.amazon.nova-2-lite-v1:0`

## Environment

Create `.env.local` with:

```env
BEDROCK_AWS_REGION="us-east-1"
BEDROCK_AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
BEDROCK_AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
BEDROCK_MODEL_ID="us.amazon.nova-2-lite-v1:0"
SIMIEBOT_VIDEO_BUCKET="YOUR_S3_BUCKET_FOR_SOURCE_AND_RENDERED_VIDEOS"

APP_BASE_URL="http://localhost:3000"
AUTH0_SECRET="use [openssl rand -hex 32] to generate a 32 byte value"
AUTH0_DOMAIN="dev-example.us.auth0.com"
AUTH0_CLIENT_ID="YOUR_REGULAR_WEB_APP_CLIENT_ID"
AUTH0_CLIENT_SECRET="YOUR_REGULAR_WEB_APP_CLIENT_SECRET"
AUTH0_AUDIENCE="https://simiebot.local"
AUTH0_SCOPE="openid profile email offline_access"
AUTH0_CUSTOM_API_CLIENT_ID="YOUR_CUSTOM_API_CLIENT_ID"
AUTH0_CUSTOM_API_CLIENT_SECRET="YOUR_CUSTOM_API_CLIENT_SECRET"

LANGGRAPH_API_URL="http://localhost:54367"
```

Optional:

```env
SERPAPI_API_KEY="YOUR_SERPAPI_KEY"
LANGSMITH_TRACING=true
LANGSMITH_API_KEY="YOUR_LANGSMITH_API_KEY"
```

## Development

```bash
npm install
npm run all:dev
```

## Notes

- Gmail and Calendar flows are real.
- The creator pipeline now includes real Drive asset discovery/staging, Nova edit planning, FFmpeg render orchestration, and YouTube upload wiring.
- The finance path is still an intentional placeholder for future Coinbase work.
- To render videos locally, FFmpeg must be installed or `FFMPEG_PATH` must point to the binary.
