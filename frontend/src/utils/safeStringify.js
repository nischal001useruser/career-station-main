export const safeStringify = (value, space) => {
  return JSON.stringify(value, (_key, val) => {
    if (typeof val === 'bigint') return val.toString()
    return val
  }, space)
}

