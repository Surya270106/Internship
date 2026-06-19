import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPrice, formatRating } from '../utils/format'

/**
 * ProductModal
 * Full-screen overlay showing product details. Accessible: closes on
 * Escape key and clicking the backdrop. Uses Framer Motion for smooth
 * enter/exit.
 */
export default function ProductModal({ product, isRecommended = false, onClose }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (!product) return
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [product, handleKeyDown])

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 1l12 12M13 1L1 13" strokeLinecap="round" />
              </svg>
            </button>

            <div className="modal__image-wrap">
              <img src={product.image} alt={product.name} className="modal__image" />
            </div>

            <div className="modal__body">
              <span className="modal__category">{product.category}</span>
              <h2 className="modal__name">{product.name}</h2>
              <p className="modal__description">{product.description}</p>

              {isRecommended && (
                <motion.div
                  className="modal__badge"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1.5l1.85 4.1L14.2 6l-3.1 2.85.85 4.15L8 10.75 4.05 13l.85-4.15L1.8 6l4.35-.4z" />
                  </svg>
                  AI Recommended
                </motion.div>
              )}

              <div className="modal__row">
                <span className="modal__price">{formatPrice(product.price)}</span>
                <span className="modal__rating">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1.5l1.85 4.1L14.2 6l-3.1 2.85.85 4.15L8 10.75 4.05 13l.85-4.15L1.8 6l4.35-.4z" />
                  </svg>
                  {formatRating(product.rating)} / 5
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
