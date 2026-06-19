import { motion, AnimatePresence } from 'framer-motion'

/**
 * RecommendationPanel
 * Surfaces the AI's current status with smooth enter/exit animations.
 * Uses animated dots for loading instead of a spinner for a more
 * organic, less "techy" feel.
 */
export default function RecommendationPanel({ status, reason, error, matchCount, onClear }) {
  return (
    <AnimatePresence mode="wait">
      {status === 'idle' ? null : (
        <motion.div
          key={status}
          className={`rec-panel rec-panel--${status}`}
          role="status"
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {status === 'loading' && (
            <div className="rec-panel__row">
              <span className="rec-panel__icon">
                <LoadingDots />
              </span>
              <p className="rec-panel__reason">Finding the best matches from the catalog...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="rec-panel__row">
              <span className="rec-panel__icon" style={{ color: 'var(--color-error)' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8.75 4.5v4a.75.75 0 01-1.5 0v-4a.75.75 0 011.5 0z"/>
                </svg>
              </span>
              <div className="rec-panel__content">
                <p className="rec-panel__reason">{error}</p>
              </div>
              <button type="button" className="rec-panel__dismiss" onClick={onClear}>
                Dismiss
              </button>
            </div>
          )}

          {status === 'success' && (
            <div className="rec-panel__row">
              <span className="rec-panel__icon" style={{ color: 'var(--color-success)' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.22 5.28l-3.5 3.5a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.97.97 2.97-2.97a.75.75 0 111.06 1.06z"/>
                </svg>
              </span>
              <div className="rec-panel__content">
                <p className="rec-panel__title">
                  {matchCount > 0
                    ? `${matchCount} ${matchCount === 1 ? 'match' : 'matches'} found`
                    : 'No exact matches'}
                </p>
                <p className="rec-panel__reason">{reason}</p>
              </div>
              <button type="button" className="rec-panel__dismiss" onClick={onClear}>
                Clear
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Animated loading dots — three small circles pulsing in sequence. */
function LoadingDots() {
  return (
    <span className="loading-dots">
      <span />
      <span />
      <span />
    </span>
  )
}
