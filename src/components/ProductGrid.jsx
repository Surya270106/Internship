import { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ProductCard from './ProductCard'

/**
 * ProductGrid
 * Renders the product catalog with AnimatePresence so cards animate
 * in/out as filters change. Wrapped in memo to prevent heavy 
 * framer-motion layout measurements on unrelated App re-renders.
 */
export default memo(function ProductGrid({ products, recommendedIds, onProductClick, isLoading }) {
  if (isLoading) {
    return (
      <div className="product-grid">
        <AnimatePresence mode="popLayout">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={`skeleton-${i}`}
              className="product-card skeleton-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="skeleton-image" />
              <div className="skeleton-text-stack">
                <div className="skeleton-text-title" />
                <div className="skeleton-text-price" />
                <div className="skeleton-text-cta" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">∅</div>
        <p className="empty-state__title">No products match these filters</p>
        <p className="empty-state__hint">Try a different category or clear your filters.</p>
      </div>
    )
  }

  return (
    <div className="product-grid">
      <AnimatePresence mode="popLayout">
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            isRecommended={recommendedIds.has(product.id)}
            index={i}
            onClick={onProductClick}
          />
        ))}
      </AnimatePresence>
    </div>
  )
})
