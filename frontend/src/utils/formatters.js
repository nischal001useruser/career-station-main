// frontend/src/utils/formatters.js

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

// Added this to stop your BigInt crashes:
export const sanitizeData = (data) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};