import { useCallback, useState } from 'react'
import { getAIRecommendations } from '../services/aiClient'
import { PRODUCTS } from '../data/products'

/**
 * useRecommendations
 * -----------------------------------------------------------------------
 * Encapsulates all state and side effects for the AI recommendation
 * feature: loading/error/result state, the call to the AI service, and a
 * small in-memory history of past queries (bonus feature).
 *
 * Keeping this logic out of components means <RecommendationPanel> and
 * friends stay focused purely on rendering.
 * -----------------------------------------------------------------------
 */
export function useRecommendations() {
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'success' | 'error'
  const [recommendedIds, setRecommendedIds] = useState([])
  const [reason, setReason] = useState('')
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])

  const fetchRecommendations = useCallback(async (query) => {
    setStatus('loading')
    setError(null)

    try {
      const result = await getAIRecommendations(query, PRODUCTS)
      setRecommendedIds(result.recommendedIds)
      setReason(result.reason)
      setStatus('success')
      setHistory((prev) => [
        { query, recommendedIds: result.recommendedIds, reason: result.reason, timestamp: Date.now() },
        ...prev,
      ].slice(0, 8)) // cap history to last 8 queries
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setRecommendedIds([])
      setReason('')
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setRecommendedIds([])
    setReason('')
    setError(null)
  }, [])

  return {
    status,
    isLoading: status === 'loading',
    recommendedIds,
    reason,
    error,
    history,
    fetchRecommendations,
    reset,
  }
}
