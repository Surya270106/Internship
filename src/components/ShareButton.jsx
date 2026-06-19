import { useState } from 'react'

/**
 * ShareButton
 * Copies a formatted summary of the AI recommendations to the clipboard.
 * Shows "Copied!" feedback briefly after clicking.
 */
export default function ShareButton({ recommendedIds, reason, products }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const matched = products.filter((p) => recommendedIds.includes(p.id))
    const lines = matched.map((p) => `• ${p.name} — $${p.price}`)
    const text = `AI Product Recommendations\n\n${lines.join('\n')}\n\nWhy: ${reason}`

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      type="button"
      className={`share-btn${copied ? ' share-btn--copied' : ''}`}
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="5" y="5" width="8" height="8" rx="1.5" />
            <path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" />
          </svg>
          Copy results
        </>
      )}
    </button>
  )
}
