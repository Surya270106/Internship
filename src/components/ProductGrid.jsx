import { AnimatePresence } from 'framer-motion'
import ProductCard from './ProductCard'

/**
 * ProductGrid
 * Renders the product catalog with AnimatePresence so cards animate
 * in/out as filters change.
 */
export default function ProductGrid({ products, recommendedIds = new Set(), onProductClick }) {
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
