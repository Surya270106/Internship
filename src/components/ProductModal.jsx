import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPrice } from '../utils/format'

/**
 * ProductModal
 * Apple-style frosted glass overlay.
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
          className="modal-overlay frosted-glass"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="modal"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 1l12 12M13 1L1 13" strokeLinecap="round" />
              </svg>
            </button>

            <div className="modal__image-wrap">
              <img 
                src={product.image} 
                alt={product.name} 
                className="modal__image" 
                referrerPolicy="no-referrer" 
              />
            </div>

            <div className="modal__body">
              {isRecommended && (
                <div className="modal__badge">
                  AI Recommended
                </div>
              )}
              
              <h2 className="modal__name">{product.name}</h2>
              <p className="modal__price">{formatPrice(product.price)}</p>
              
              <p className="modal__description">{product.description}</p>

              <div className="modal__actions">
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-primary"
                  style={{ display: 'block', textDecoration: 'none' }}
                >
                  View on Retailer
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
