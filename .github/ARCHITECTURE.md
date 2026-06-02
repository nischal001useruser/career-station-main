# Career Station Exam Analytics - Architecture

## Project Overview

Career Station is a zero-cost educational exam analytics platform designed to help institutes track and analyze student exam performance. The application uses a modern full-stack architecture with React on the frontend, Express on the backend, and SQLite for data persistence.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** SQLite3
- **Charts:** Chart.js
- **HTTP Client:** Axios

## Folder Structure Overview

### Frontend Structure
```
frontend/
├── src/
│   ├── components/        # Reusable UI components (Header, Sidebar, etc.)
│   ├── pages/            # Full page components (Dashboard)
│   ├── layouts/          # Layout wrappers (MainLayout)
│   ├── services/         # API communication layer (apiClient)
│   ├── utils/            # Helper functions (formatters)
│   ├── charts/           # Chart configurations & components
│   ├── config/           # App configuration (API endpoints)
│   ├── App.jsx           # Root component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles with Tailwind
├── public/               # Static assets
├── index.html            # HTML template
├── vite.config.js        # Vite configuration with proxy
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS plugins
├── package.json          # Dependencies
├── .env.example          # Environment template
└── .gitignore            # Git ignore file
```

### Backend Structure
```
backend/
├── src/
│   ├── routes/           # API route definitions
│   │   ├── examRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── resultRoutes.js
│   │   └── healthRoutes.js
│   ├── controllers/      # Route handlers & business logic
│   │   ├── examController.js
│   │   ├── studentController.js
│   │   └── resultController.js
│   ├── models/           # Data models (prepared for future use)
│   ├── database/         # Database connection & initialization
│   │   └── connection.js
│   ├── middleware/       # Express middleware
│   │   └── errorHandler.js
│   ├── utils/            # Utility functions
│   │   ├── queryHelpers.js
│   │   └── responseHelpers.js
│   └── server.js         # Express app setup & server start
├── database/             # SQLite database storage
│   └── exams.db          # (Created on first run)
├── package.json          # Dependencies
├── .env.example          # Environment template
└── .gitignore            # Git ignore file
```

## Running Instructions

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` with hot reload enabled.

**Key Features:**
- Vite proxy routes `/api/*` to backend at `http://localhost:5000`
- Tailwind CSS for utility-first styling
- React components organized by functionality
- Service layer for API communication

### Backend

```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:5000` with file watching.

**Key Features:**
- SQLite database auto-initialized on startup
- CORS enabled for frontend communication
- Consistent API response format
- Centralized error handling

## Installed Dependencies

### Frontend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.2.0 | UI library |
| react-dom | 18.2.0 | React DOM rendering |
| chart.js | 4.4.0 | Chart library |
| react-chartjs-2 | 5.2.0 | React wrapper for Chart.js |
| axios | 1.6.0 | HTTP client |

### Frontend Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| vite | 5.0.0 | Build tool & dev server |
| @vitejs/plugin-react | 4.2.0 | React plugin for Vite |
| tailwindcss | 3.3.0 | Utility CSS framework |
| postcss | 8.4.31 | CSS transformations |
| autoprefixer | 10.4.16 | Add vendor prefixes |

### Backend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | 4.18.2 | Web framework |
| sqlite3 | 5.1.6 | SQLite database driver |
| cors | 2.8.5 | CORS middleware |
| dotenv | 16.3.1 | Environment variables |

### Backend Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| nodemon | 3.0.1 | File watching & auto-restart |

## Architecture Highlights

### API Design
- RESTful endpoints for Exams, Students, and Results
- Consistent response format with success/message/data structure
- Centralized error handling with status codes
- Query helpers for database operations

### Database Design
- Three main tables: Exams, Students, Results
- Foreign key relationships for data integrity
- Timestamps for created_at and updated_at
- Indexes ready for performance optimization

### Frontend Architecture
- Component-based structure for reusability
- Service layer abstraction for API calls
- Utility functions for common operations
- Config files for centralized settings
- Tailwind CSS for consistent styling

### Backend Architecture
- Controller pattern for separation of concerns
- Middleware for cross-cutting concerns
- Query helpers for DRY database operations
- Environment-based configuration
- Graceful shutdown handling

## Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DB_PATH=./database/exams.db
```

## How to Extend

1. **Add new API endpoints:** Create route → controller → database query
2. **Add new pages:** Create page component → add layout → add route in App
3. **Add charts:** Use Chart.js configs from `charts/chartConfig.js`
4. **Add features:** Follow existing patterns for consistency

## Next Phases

Future prompts should handle:
- Authentication & authorization
- Data validation & sanitization
- Advanced analytics & reporting
- File upload/import functionality
- Performance optimization
- Deployment configuration
