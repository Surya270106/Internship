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
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__brand">
            <span className="app-header__name">Spearmint Finds</span>
            <span className="app-header__tag">AI</span>
          </div>
          <div className="app-header__actions">
            <DarkModeToggle isDark={isDark} onToggle={() => setIsDark((d) => !d)} />
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className="app-main">
        {/* Hero / Search section */}
        <section className="hero">
          <motion.p
            className="hero__eyebrow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            AI-Powered Shopping
          </motion.p>

          <motion.h1
            className="hero__title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Find the <em>perfect</em> product.
          </motion.h1>

          <motion.p
            className="hero__subtitle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Describe what you need in plain language. The assistant recommends
            products from the catalog that match your requirements.
          </motion.p>

          <PreferenceInput onSubmit={fetchRecommendations} isLoading={isLoading} />
        </section>

        {/* Recommendation result panel */}
        <RecommendationPanel
          status={status}
          reason={reason}
          error={error}
          matchCount={recommendedIds.length}
          onClear={reset}
        />

        {/* Share button — visible when recommendations are active */}
        {status === 'success' && recommendedIds.length > 0 && (
          <motion.div
            style={{ maxWidth: 640, margin: '0 auto 24px', textAlign: 'right' }}
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
          transition={{ duration: 0.5, delay: 0.4 }}
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
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="app-footer">
        <p>Built for the Spearmint Technologies internship assessment.</p>
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
