/**
 * aiClient.js
 * -----------------------------------------------------------------------
 * Thin abstraction around an OpenAI-compatible Chat Completions endpoint.
 *
 * Why this shape:
 *  - All AI-specific concerns (prompt format, API shape, response parsing)
 *    live in ONE file. Swapping providers (OpenAI -> Groq -> OpenRouter ->
 *    a local model server) only ever means changing .env values, not code,
 *    as long as the provider speaks the OpenAI Chat Completions schema.
 *  - The function returns a plain, predictable JS object to the rest of the
 *    app: { recommendedIds: number[], reason: string }. Components never
 *    see raw API responses or have to know about prompts.
 *
 * Dual-path routing:
 *  - If VITE_AI_API_KEY is set (local dev), calls the AI API directly from
 *    the browser — fastest iteration loop, no backend needed.
 *  - If VITE_AI_API_KEY is NOT set (production / Vercel), routes through
 *    /api/recommend — a serverless function that keeps the key server-side.
 *
 * Configuration (see .env.example):
 *   VITE_AI_API_KEY   - your API key  (client-side / local dev)
 *   VITE_AI_BASE_URL  - defaults to OpenAI's endpoint
 *   VITE_AI_MODEL     - defaults to gpt-4o-mini
 *   AI_API_KEY        - server-side key (Vercel env vars, used by /api/recommend)
 * -----------------------------------------------------------------------
 */

const BASE_URL = import.meta.env.VITE_AI_BASE_URL || 'https://api.groq.com/openai/v1'
const MODEL = import.meta.env.VITE_AI_MODEL || 'llama-3.3-70b-versatile'
const API_KEY = import.meta.env.VITE_AI_API_KEY

/**
 * Builds the system prompt that constrains the model to the given catalog.
 * Sending a trimmed-down product list (id, name, category, price, short
 * description) keeps token usage low while giving the model everything it
 * needs to match user intent.
 */
function buildSystemPrompt(products) {
  const catalogForPrompt = products.map(({ id, name, category, price, description }) => ({
    id,
    name,
    category,
    price,
    description,
  }))

  return `You are a product recommendation engine for an e-commerce site.

You will be given a JSON catalog of available products and a user's natural-language request.

RULES (follow strictly):
1. ONLY recommend products whose "id" appears in the catalog below. Never invent products, ids, or names.
2. Select between 1 and 5 products that best match the user's request (budget, category, features mentioned).
3. Assign a "matchScore" (0-100) to each recommended product representing how well it fits the user's query.
4. If nothing in the catalog reasonably matches, return an empty "recommendations" array and explain why in "reason".
5. Respond with ONLY valid JSON, no markdown formatting, no code fences, no extra commentary. Exactly this shape:
{
  "recommendations": [
    { "id": 1, "matchScore": 95 },
    { "id": 4, "matchScore": 88 }
  ],
  "explanation": "These match your budget under $500 and your preference for Android.",
  "reason": "Used only if no products match."
}

CATALOG:
${JSON.stringify(catalogForPrompt)}`
}

/**
 * Strips common formatting issues (markdown code fences, leading/trailing
 * whitespace) that chat models sometimes add even when told not to.
 */
function stripCodeFences(raw) {
  return raw
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim()
}

/**
 * Validates and normalizes the parsed JSON into a safe shape, dropping any
 * recommended id that doesn't actually exist in the catalog. This is the
 * second line of defense (after the prompt) for "only recommend real
 * products" — we never trust the model's output blindly.
 */
function normalizeRecommendation(parsed, validIds) {
  const recsArray = Array.isArray(parsed?.recommendations) ? parsed.recommendations : []

  const recommendations = recsArray
    .filter((r) => r && Number.isInteger(Number(r.id)) && validIds.has(Number(r.id)))
    .map((r) => ({
      id: Number(r.id),
      matchScore: Number.isInteger(Number(r.matchScore)) ? Number(r.matchScore) : 90
    }))

  // Keep recommendedIds array for backward compatibility with existing components
  const recommendedIds = recommendations.map(r => r.id)

  const explanation = typeof parsed?.explanation === 'string' ? parsed.explanation.trim() : ''

  const reason =
    typeof parsed?.reason === 'string' && parsed.reason.trim().length > 0
      ? parsed.reason.trim()
      : 'Here are some products that match your request.'

  return { recommendations, recommendedIds, explanation, reason }
}

// ---------------------------------------------------------------------------
// Proxy path — used in production (Vercel) when no client-side API key is set
// ---------------------------------------------------------------------------

/**
 * Sends the query + catalog to the /api/recommend serverless function and
 * returns the same { recommendedIds, reason } shape.  The serverless
 * function holds the API key server-side so it never reaches the browser.
 *
 * @param {string} userQuery - e.g. "I want a phone under $500"
 * @param {Array}  products  - the full local product catalog
 * @returns {Promise<{recommendedIds: number[], reason: string}>}
 * @throws {Error} with a user-friendly message on network/API failure
 */
async function getRecommendationsViaProxy(userQuery, products) {
  let response
  try {
    response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: userQuery.trim(), products }),
    })
  } catch (networkError) {
    throw new Error('Network error while contacting the recommendation service. Please check your connection and try again.')
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('Received an unreadable response from the recommendation service.')
  }

  if (!response.ok) {
    // The serverless function returns { error: "…" } on failure
    throw new Error(data?.error || `Recommendation service error (status ${response.status}).`)
  }

  return data
}

// ---------------------------------------------------------------------------
// Direct path — used in local dev when VITE_AI_API_KEY is set
// ---------------------------------------------------------------------------

/**
 * Calls the AI API directly from the browser with the user's preference
 * text and returns matching product ids + a human-readable reason.
 *
 * @param {string} userQuery - e.g. "I want a phone under $500"
 * @param {Array}  products  - the full local product catalog
 * @returns {Promise<{recommendedIds: number[], reason: string}>}
 * @throws {Error} with a user-friendly message on network/parse/API failure
 */
async function getRecommendationsDirect(userQuery, products) {
  if (!API_KEY) {
    throw new Error(
      'Missing API key. Copy .env.example to .env and set VITE_AI_API_KEY before running the app.'
    )
  }

  if (!userQuery || !userQuery.trim()) {
    throw new Error('Please enter what you are looking for.')
  }

  const validIds = new Set(products.map((p) => p.id))

  let response
  try {
    response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        messages: [
          { role: 'system', content: buildSystemPrompt(products) },
          { role: 'user', content: userQuery.trim() },
        ],
      }),
    })
  } catch (networkError) {
    throw new Error('Network error while contacting the AI service. Please check your connection and try again.')
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('AI API rejected the request: invalid or missing API key.')
    }
    if (response.status === 429) {
      throw new Error('Rate limit reached on the AI API. Please wait a moment and try again.')
    }
    throw new Error(`AI API request failed (status ${response.status}). Please try again.`)
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('Received an unreadable response from the AI service.')
  }

  const rawContent = data?.choices?.[0]?.message?.content
  if (!rawContent) {
    throw new Error('AI service returned an empty response.')
  }

  let parsed
  try {
    parsed = JSON.parse(stripCodeFences(rawContent))
  } catch {
    throw new Error('Could not understand the AI response. Please try rephrasing your request.')
  }

  return normalizeRecommendation(parsed, validIds)
}

// ---------------------------------------------------------------------------
// Public API — routes to proxy or direct based on environment
// ---------------------------------------------------------------------------

/**
 * Main entry point for AI recommendations.  Automatically chooses the right
 * path:
 *  - Production (no VITE_AI_API_KEY) → /api/recommend serverless proxy
 *  - Local dev  (VITE_AI_API_KEY set) → direct OpenAI-compatible call
 *
 * @param {string} userQuery - e.g. "I want a phone under $500"
 * @param {Array}  products  - the full local product catalog
 * @returns {Promise<{recommendedIds: number[], reason: string}>}
 * @throws {Error} with a user-friendly message on any failure
 */
export async function getAIRecommendations(userQuery, products) {
  if (!userQuery || !userQuery.trim()) {
    throw new Error('Please enter what you are looking for.')
  }

  // When no client-side API key is available, use the serverless proxy
  if (!API_KEY) {
    return getRecommendationsViaProxy(userQuery, products)
  }

  // Otherwise, call the AI API directly from the browser (local dev)
  return getRecommendationsDirect(userQuery, products)
}
