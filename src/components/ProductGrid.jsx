import { memo } from 'react'
import { AnimatePresence } from 'framer-motion'
import ProductCard from './ProductCard'

/**
 * ProductGrid
 * Renders the product catalog with AnimatePresence so cards animate
 * in/out as filters change. Wrapped in memo to prevent heavy 
 * framer-motion layout measurements on unrelated App re-renders.
 */
export default memo(function ProductGrid({ products, recommendedIds, onProductClick }) {
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
}
