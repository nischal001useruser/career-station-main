export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatPercentage = (value) => {
  return `${(value * 100).toFixed(2)}%`
}

export const calculatePercentage = (part, total) => {
  return total === 0 ? 0 : (part / total) * 100
}
