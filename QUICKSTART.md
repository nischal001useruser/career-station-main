# Career Station Exam Analytics

## Setup Instructions

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Access at: http://localhost:5173

### Backend
```bash
cd backend
npm install
npm run dev
```
Access at: http://localhost:5000

### Database
- SQLite database is automatically created on first backend run
- Location: `backend/database/exams.db`

## Environment Configuration

1. Copy `.env.example` to `.env` in both frontend and backend folders
2. Modify values as needed

## Project Structure

- `/frontend` - React + Vite + Tailwind CSS
- `/backend` - Express + SQLite
- `/database` - SQLite database storage

See `.github/ARCHITECTURE.md` for detailed architecture documentation.
