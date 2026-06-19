import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const EXAMPLE_PROMPTS = [
  'Best phone under $1000',
  'Lightweight laptop for students',
  'Noise-cancelling headphones',
  'Affordable smartwatch under $400',
]

const PLACEHOLDER_TEXTS = [
  'What are you looking for?',
  'e.g. "I need a new phone under $800"',
  'e.g. "Gaming laptop with great thermals"',
  'e.g. "Wireless headphones with ANC"',
]

/**
 * PreferenceInput
 * Apple-style prominent search pill. Bolder input, floating label feel.
 */
export default function PreferenceInput({ onSubmit, isLoading, status, matchCount }) {
  const [value, setValue] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const inputRef = useRef(null)

  // Cycle through placeholder texts every 3 seconds
  useEffect(() => {
    if (value) return // Don't cycle when user is typing
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_TEXTS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [value])

  function handleSubmit(event) {
    event.preventDefault()
    if (!value.trim() || isLoading) return
    onSubmit(value.trim())
  }

  function handleExampleClick(prompt) {
    setValue(prompt)
    onSubmit(prompt)
  }

  const showSuggestions = status === 'idle' || status === 'error' || (status === 'success' && matchCount === 0)

  return (
    <div className="search-container">
      <motion.form
        className="search-bar"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="search-bar__inner">
          {/* Apple-style thin search glyph */}
          <svg className="search-bar__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="M12.5 12.5L17 17" strokeLinecap="round" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            className="search-bar__input"
            placeholder={PLACEHOLDER_TEXTS[placeholderIndex]}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isLoading}
            aria-label="Describe what product you are looking for"
          />

          <button
            type="submit"
            className="search-bar__submit"
            disabled={isLoading || !value.trim()}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </motion.form>

      {showSuggestions && (
        <motion.div
          className="search-suggestions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <span className="search-suggestions__label">Try:</span>
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="search-chip"
              onClick={() => handleExampleClick(prompt)}
              disabled={isLoading}
            >
              {prompt}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}
