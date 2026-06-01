export const handleError = (res, error, statusCode = 500) => {
  console.error(error)
  res.status(statusCode).json({
    success: false,
    message: error.message || 'An error occurred',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error',
  })
}

export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}
