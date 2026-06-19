import { motion, AnimatePresence } from 'framer-motion'

/**
 * HistoryList
 * Sidebar showing recent searches with smooth staggered animations.
 * Click a past query to re-run it.
 */
export default function HistoryList({ history, onSelect }) {
  if (history.length === 0) return null

  return (
    <motion.div
      className="history"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <h2 className="history__title">Recent searches</h2>
      <ul className="history__list">
        <AnimatePresence>
          {history.map((entry, i) => (
            <motion.li
              key={entry.timestamp}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
            >
              <button
                type="button"
                className="history__item"
                onClick={() => onSelect(entry.query)}
              >
                <span className="history__query">&ldquo;{entry.query}&rdquo;</span>
                <span className="history__meta">
                  {entry.recommendedIds.length} {entry.recommendedIds.length === 1 ? 'match' : 'matches'}
                </span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.div>
  )
}
