import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatPrice } from '../utils/format'

/**
 * ProductCard
 * Styled as an Apple store utility card: white background, subtle hairline border,
 * product shadow, tight typography. No card-level drop shadows.
 */
export default function ProductCard({ product, isRecommended, onClick }) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <motion.button
      layout
      type="button"
      className={`product-card${isRecommended ? ' product-card--recommended' : ''}`}
      onClick={() => onClick(product)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="product-card__image-container">
        {!imageLoaded && <div className="product-card__skeleton" />}
        <img
          src={product.image}
          alt={product.name}
          className={`product-card__image ${imageLoaded ? 'loaded' : ''}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="product-card__content">
        {isRecommended && (
          <span className="product-card__badge">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1.5l1.85 4.1L14.2 6l-3.1 2.85.85 4.15L8 10.75 4.05 13l.85-4.15L1.8 6l4.35-.4z" />
            </svg>
            AI Match
          </span>
        )}
        
        <div className="product-card__text-stack">
          <h3 className="product-card__name">{product.name}</h3>
          <p className="product-card__price">{formatPrice(product.price)}</p>
        </div>
        
        <span className="product-card__cta">Buy</span>
      </div>
    </motion.button>
  )
}
