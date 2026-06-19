import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const EXAMPLE_PROMPTS = [
  'I want a phone under $500',
  'Recommend a gaming laptop under $1200',
  'Show me budget headphones with ANC',
  'Best tablet for streaming',
]

const PLACEHOLDER_TEXTS = [
  '"I need a phone under $500"',
  '"Gaming laptop with good thermals"',
  '"Budget headphones with noise cancelling"',
  '"Best smartwatch for fitness"',
]

/**
 * PreferenceInput
 * The primary interaction surface — a clean search bar with cycling
 * placeholder text and one-click example chips.
 */
export default function PreferenceInput({ onSubmit, isLoading }) {
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

  return (
    <div className="search-bar">
      <motion.form
        className="search-bar__input-wrap"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Search icon */}
        <svg className="search-bar__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
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
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </motion.form>

      <motion.div
        className="search-bar__examples"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <span className="search-bar__examples-label">Try:</span>
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="example-chip"
            onClick={() => handleExampleClick(prompt)}
            disabled={isLoading}
          >
            {prompt}
          </button>
        ))}
      </motion.div>
    </div>
  )
}
