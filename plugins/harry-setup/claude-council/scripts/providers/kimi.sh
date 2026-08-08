#!/bin/bash
# ABOUTME: Queries Moonshot AI's Kimi (K2) API with a prompt
# ABOUTME: Cheap offload/second-opinion provider; returns the model's response to stdout

set -euo pipefail

# Source shared retry library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/retry.sh"

# Debug mode
DEBUG="${COUNCIL_DEBUG:-}"

PROMPT="${1:-}"

if [[ -z "$PROMPT" ]]; then
    echo "Error: No prompt provided" >&2
    exit 1
fi

# Check for API key (accept KIMI_API_KEY, fall back to MOONSHOT_API_KEY)
API_KEY="${KIMI_API_KEY:-${MOONSHOT_API_KEY:-}}"
if [[ -z "$API_KEY" ]]; then
    echo "Error: KIMI_API_KEY not set" >&2
    exit 1
fi

# Moonshot API endpoint (OpenAI-compatible). Use api.moonshot.cn for the China surface.
ENDPOINT="${KIMI_ENDPOINT:-https://api.moonshot.ai/v1/chat/completions}"

# Model selection (override via KIMI_MODEL). Default = best current general model.
# Alternatives: kimi-k2.7-code (coding-specialised), kimi-k2.5 (cheapest),
# kimi-k3 (flagship IF live on your account — verify via /v1/models).
MODEL="${KIMI_MODEL:-kimi-k2.6}"

# Token limit (override via COUNCIL_MAX_TOKENS env var)
TOKENS="${COUNCIL_MAX_TOKENS:-2048}"

# System instruction
SYSTEM="You are an expert software engineering consultant. Provide clear, practical responses with code examples where helpful. Be thorough but concise - focus on actionable guidance."

# Build request payload (OpenAI chat-completions format)
PAYLOAD=$(jq -n --arg prompt "$PROMPT" --arg model "$MODEL" --argjson tokens "$TOKENS" --arg system "$SYSTEM" '{
    model: $model,
    messages: [{
        role: "system",
        content: $system
    }, {
        role: "user",
        content: $prompt
    }],
    temperature: 0.6,
    max_tokens: $tokens
}')

if [[ -n "$DEBUG" ]]; then
    echo "=== DEBUG: Kimi ===" >&2
    echo "Endpoint: $ENDPOINT" >&2
    echo "Model: $MODEL" >&2
    echo "Max tokens: $TOKENS" >&2
fi

# Make API call
RESPONSE=$(curl_with_retry -s -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${API_KEY}" \
    -d "$PAYLOAD")

# Extract text from response
TEXT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content // empty')

if [[ -z "$TEXT" ]]; then
    ERROR=$(echo "$RESPONSE" | jq -r '.error.message // .error // "Unknown error"')
    echo "Error from Kimi: $ERROR" >&2
    exit 1
fi

echo "$TEXT"
