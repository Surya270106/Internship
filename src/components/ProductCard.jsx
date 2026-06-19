import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatPrice, formatRating } from '../utils/format'

/**
 * ProductCard
 * Renders a single product with image skeleton loading, smooth entrance
 * animation via Framer Motion, and an "AI Pick" badge for recommended items.
 */
export default function ProductCard({ product, isRecommended = false, index = 0, onClick }) {
  const { name, category, price, rating, image, description } = product
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <motion.article
      className={`product-card${isRecommended ? ' product-card--recommended' : ''}`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -3 }}
      onClick={() => onClick?.(product)}
    >
      {isRecommended && (
        <motion.span
          className="product-card__badge"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + index * 0.04, type: 'spring', stiffness: 400, damping: 20 }}
        >
          Recommended
        </motion.span>
      )}

      <div className="product-card__image-wrap">
        {!imageLoaded && <div className="product-card__skeleton" />}
        <img
          src={image}
          alt={name}
          loading="lazy"
          className={`product-card__image ${imageLoaded ? 'product-card__image--loaded' : 'product-card__image--loading'}`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      <div className="product-card__body">
        <div className="product-card__meta">
          <span className="product-card__category">{category}</span>
          <span className="product-card__rating">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1.5l1.85 4.1L14.2 6l-3.1 2.85.85 4.15L8 10.75 4.05 13l.85-4.15L1.8 6l4.35-.4z" />
            </svg>
            {formatRating(rating)}
          </span>
        </div>

        <h3 className="product-card__name">{name}</h3>
        <p className="product-card__description">{description}</p>

        <div className="product-card__footer">
          <span className="product-card__price">{formatPrice(price)}</span>
          <span className="product-card__view">
            View
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </motion.article>
  )
}
