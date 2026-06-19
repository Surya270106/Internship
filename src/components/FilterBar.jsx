import { motion } from 'framer-motion'

/**
 * FilterBar
 * Category filter chips with layout animation + sort dropdown.
 * Clean and minimal — chips use the same pill style as the rest of the UI.
 */
export default function FilterBar({
  categories,
  activeCategory,
  onCategoryChange,
  sortOrder,
  onSortChange,
}) {
  return (
    <div className="filter-bar">
      <div className="filter-bar__categories">
        {categories.map((category) => (
          <motion.button
            key={category}
            type="button"
            className={`filter-chip${activeCategory === category ? ' filter-chip--active' : ''}`}
            onClick={() => onCategoryChange(category)}
            whileTap={{ scale: 0.95 }}
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {category}
          </motion.button>
        ))}
      </div>

      <label className="filter-bar__sort">
        <span>Sort</span>
        <select value={sortOrder} onChange={(e) => onSortChange(e.target.value)}>
          <option value="default">Featured</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="rating-desc">Rating: Best first</option>
        </select>
      </label>
    </div>
  )
}
