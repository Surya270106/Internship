/* eslint-env node */
/**
 * api/recommend.js
 * -----------------------------------------------------------------------
 * Vercel Serverless Function — AI Product Recommendation Proxy
 *
 * This function acts as a secure server-side proxy for the AI chat
 * completions API.  It keeps the API key out of client-side bundles and
 * mirrors the same prompt / parsing logic used by the browser-side
 * aiClient.js so the two paths produce identical results.
 *
 * Environment variables (set in Vercel dashboard, NOT prefixed with VITE_):
 *   AI_API_KEY   – required – your OpenAI (or compatible) API key
 *   AI_BASE_URL  – optional – defaults to https://api.openai.com/v1
 *   AI_MODEL     – optional – defaults to gpt-4o-mini
 *
 * Request:
 *   POST /api/recommend
 *   Content-Type: application/json
 *   Body: { "query": "string", "products": [ { id, name, … }, … ] }
 *
 * Response:
 *   200 { "recommendedIds": [1,4,7], "reason": "…" }
 *   4xx / 5xx  { "error": "human-readable message" }
 * -----------------------------------------------------------------------
 */

// ---------------------------------------------------------------------------
// Config from environment
// ---------------------------------------------------------------------------
const AI_API_KEY  = process.env.AI_API_KEY
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1'
const AI_MODEL    = process.env.AI_MODEL    || 'llama-3.3-70b-versatile'

// ---------------------------------------------------------------------------
// CORS helpers — allow any origin so the Vite dev server and the deployed
// front-end can both reach this endpoint.
// ---------------------------------------------------------------------------
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

// ---------------------------------------------------------------------------
// Prompt builder — identical to the one in src/services/aiClient.js so
// that recommendations are consistent regardless of which path is used.
// ---------------------------------------------------------------------------
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
 * Validate and normalise the parsed AI response — drop any recommended id
 * that isn't in the real catalog.  This is the second line of defense
 * (after the prompt) to ensure we never surface hallucinated products.
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
// Main handler
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  // Always set CORS headers (including on errors / preflight)
  setCorsHeaders(res)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  // Only POST is accepted
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  // Ensure the API key is configured on the server
  if (!AI_API_KEY) {
    console.error('[recommend] AI_API_KEY is not set in environment variables.')
    return res.status(500).json({ error: 'AI service is not configured on the server.' })
  }

  // ----- Parse & validate request body -----
  const { query, products } = req.body || {}

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Missing or empty "query" in request body.' })
  }

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: '"products" must be a non-empty array.' })
  }

  // ----- Call the AI completions endpoint -----
  const validIds = new Set(products.map((p) => p.id))

  let aiResponse
  try {
    aiResponse = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        temperature: 0.2,
        messages: [
          { role: 'system', content: buildSystemPrompt(products) },
          { role: 'user', content: query.trim() },
        ],
      }),
    })
  } catch (networkError) {
    console.error('[recommend] Network error calling AI API:', networkError)
    return res.status(502).json({ error: 'Could not reach the AI service. Please try again later.' })
  }

  // ----- Handle non-OK upstream responses -----
  if (!aiResponse.ok) {
    const status = aiResponse.status
    console.error(`[recommend] AI API returned status ${status}`)

    if (status === 401) {
      return res.status(502).json({ error: 'AI API rejected the server API key.' })
    }
    if (status === 429) {
      return res.status(429).json({ error: 'AI rate limit reached. Please wait a moment and try again.' })
    }
    return res.status(502).json({ error: `AI API request failed (upstream status ${status}).` })
  }

  // ----- Parse the upstream JSON response -----
  let data
  try {
    data = await aiResponse.json()
  } catch {
    console.error('[recommend] Could not parse AI API JSON response.')
    return res.status(502).json({ error: 'Received an unreadable response from the AI service.' })
  }

  const rawContent = data?.choices?.[0]?.message?.content
  if (!rawContent) {
    console.error('[recommend] AI response contained no content.')
    return res.status(502).json({ error: 'AI service returned an empty response.' })
  }

  // ----- Parse the model's JSON payload -----
  let parsed
  try {
    parsed = JSON.parse(stripCodeFences(rawContent))
  } catch {
    console.error('[recommend] Failed to parse model output as JSON:', rawContent)
    return res.status(502).json({ error: 'Could not understand the AI response. Please try again.' })
  }

  // ----- Normalise, validate IDs, and respond -----
  const result = normalizeRecommendation(parsed, validIds)
  return res.status(200).json(result)
}
