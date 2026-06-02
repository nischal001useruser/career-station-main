import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDatabase, closeDatabase } from './database/connection.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import healthRoutes from './routes/healthRoutes.js'
import authRoutes from './routes/authRoutes.js'
import examRoutes from './routes/examRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import resultRoutes from './routes/resultRoutes.js'
import { reviewRoutes } from './routes/reviewRoutes.js'
import inputResultStatusRoutes from './routes/inputResultStatusRoutes.js'

dotenv.config()


const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/health', healthRoutes)
app.use('/auth', authRoutes)
app.use('/exams', examRoutes)
app.use('/students', studentRoutes)
app.use('/results', resultRoutes)
app.use('/input-result-status', inputResultStatusRoutes)
app.use('/review-requests', reviewRoutes)


// Error handlers
app.use(notFoundHandler)
app.use(errorHandler)

// Initialize database and start server
const startServer = async () => {
  try {
    await initDatabase()
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...')
  closeDatabase()
  process.exit(0)
})

startServer()
