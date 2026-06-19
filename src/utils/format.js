/** Formats a number as a USD price string, e.g. 449 -> "$449". */
export function formatPrice(price) {
  return `$${price.toLocaleString('en-US')}`
}

/** Formats a rating as a single decimal, e.g. 4.5 -> "4.5". */
export function formatRating(rating) {
  return rating.toFixed(1)
}
