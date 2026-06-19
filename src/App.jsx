import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import './App.css'

import PreferenceInput from './components/PreferenceInput'
import RecommendationPanel from './components/RecommendationPanel'
import ShareButton from './components/ShareButton'
import FilterBar from './components/FilterBar'
import ProductGrid from './components/ProductGrid'
import ProductModal from './components/ProductModal'
import HistoryList from './components/HistoryList'
import DarkModeToggle from './components/DarkModeToggle'

import { useRecommendations } from './hooks/useRecommendations'
import { PRODUCTS, CATEGORIES } from './data/products'

export default function App() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortOrder, setSortOrder] = useState('default')
  const [isDark, setIsDark] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const {
    status,
    isLoading,
    recommendedIds,
    reason,
    error,
    history,
    fetchRecommendations,
    reset,
  } = useRecommendations()

  // Apply dark mode class to body
  useEffect(() => {
    document.body.classList.toggle('dark', isDark)
  }, [isDark])

  // Detect system preference for dark mode on mount
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(prefersDark)
  }, [])

  const recommendedIdSet = useMemo(() => new Set(recommendedIds), [recommendedIds])

  const visibleProducts = useMemo(() => {
    let list = PRODUCTS

    // Filter by category
    if (activeCategory !== 'All') {
      list = list.filter((p) => p.category === activeCategory)
    }

    // When recommendations are active, sort matched products to the top
    if (status === 'success' && recommendedIdSet.size > 0) {
      list = [...list].sort((a, b) => {
        const aMatch = recommendedIdSet.has(a.id) ? 0 : 1
        const bMatch = recommendedIdSet.has(b.id) ? 0 : 1
        return aMatch - bMatch
      })
    }

    // Apply user sort
    if (sortOrder === 'price-asc') {
      list = [...list].sort((a, b) => a.price - b.price)
    } else if (sortOrder === 'price-desc') {
      list = [...list].sort((a, b) => b.price - a.price)
    } else if (sortOrder === 'rating-desc') {
      list = [...list].sort((a, b) => b.rating - a.rating)
    }

    return list
  }, [activeCategory, sortOrder, status, recommendedIdSet])

  return (
    <div className="app">
      {/* ── Global Nav ──────────────────────────────────────────── */}
      <nav className="global-nav">
        <div className="global-nav__inner">
          <span className="global-nav__logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
            </svg>
            Store
          </span>
          <DarkModeToggle isDark={isDark} onToggle={() => setIsDark((d) => !d)} />
        </div>
      </nav>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className="app-main">
        {/* Product Tile Hero section */}
        <section className="hero-tile">
          <div className="hero-tile__content">
            <motion.h1
              className="hero-tile__title"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              Shop intelligently.
            </motion.h1>

            <motion.p
              className="hero-tile__subtitle"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Tell the AI what you need, and find exactly what you're looking for.
            </motion.p>

            <PreferenceInput onSubmit={fetchRecommendations} isLoading={isLoading} />
          </div>
        </section>

        <div className="content-container">
          {/* Recommendation result panel */}
          <RecommendationPanel
            status={status}
            reason={reason}
            error={error}
            matchCount={recommendedIds.length}
            onClear={reset}
          />

          {/* Share button */}
          {status === 'success' && recommendedIds.length > 0 && (
            <motion.div
              style={{ margin: '0 auto 40px', textAlign: 'right' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <ShareButton
                recommendedIds={recommendedIds}
                reason={reason}
                products={PRODUCTS}
              />
            </motion.div>
          )}

          {/* Product grid + sidebar */}
          <motion.div
            className="content-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="content-layout__main">
              <FilterBar
                categories={CATEGORIES}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
              />
              <ProductGrid
                products={visibleProducts}
                recommendedIds={recommendedIdSet}
                onProductClick={setSelectedProduct}
              />
            </div>

            <aside className="content-layout__sidebar">
              <HistoryList history={history} onSelect={fetchRecommendations} />
            </aside>
          </motion.div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="footer-parchment">
        <div className="footer-parchment__inner">
          <p>More ways to shop: find an Apple Store or other retailer near you. Or call 1-800-MY-APPLE.</p>
          <div className="footer-parchment__legal">
            <span>Copyright © 2026 Spearmint Technologies Inc. All rights reserved.</span>
            <div className="footer-parchment__links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Use</a>
              <a href="#">Sales and Refunds</a>
              <a href="#">Legal</a>
              <a href="#">Site Map</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Product detail modal ───────────────────────────────── */}
      <ProductModal
        product={selectedProduct}
        isRecommended={selectedProduct ? recommendedIdSet.has(selectedProduct.id) : false}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  )
}
