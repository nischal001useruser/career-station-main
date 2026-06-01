# Career Station - Admin Authentication & Dashboard

## Authentication Flow

### Overview
The system uses session-based authentication with token-based verification. Admin credentials are stored securely with SHA256 hashing.

### Login Flow

```
1. Admin submits username + password
   ↓
2. Frontend sends POST /auth/login
   ↓
3. Backend validates credentials
   - Check if username exists in admin_users
   - Verify password hash matches
   ↓
4. If valid:
   - Generate 32-byte random token
   - Store token with admin data (24hr expiry)
   - Return token to frontend
   ↓
5. Frontend stores token in localStorage
   ↓
6. Frontend redirects to /admin/dashboard
   ↓
7. All subsequent requests include: Authorization: Bearer <token>
```

### Authentication Check

On app load, frontend checks if token exists:
- If yes: Verify token validity with /auth/check endpoint
- If valid: Load admin dashboard
- If invalid/expired: Clear token, redirect to login

### Logout Flow

```
1. Admin clicks Logout
   ↓
2. Frontend sends POST /auth/logout with token
   ↓
3. Backend revokes token (removes from TOKENS map)
   ↓
4. Frontend clears localStorage token
   ↓
5. Frontend redirects to /login
```

---

## Backend Authentication Implementation

### Files
- `src/middleware/authMiddleware.js` - Token validation middleware
- `src/utils/passwordUtils.js` - Password hashing & verification
- `src/utils/tokenUtils.js` - Token generation & management
- `src/controllers/authController.js` - Auth logic
- `src/routes/authRoutes.js` - Auth endpoints

### API Endpoints

#### Login
```
POST /auth/login
Body: { username, password }
Response: { token, expiresAt, admin: { id, username } }
```

#### Logout
```
POST /auth/logout
Headers: Authorization: Bearer <token>
Response: { success: true }
```

#### Get Current Admin
```
GET /auth/me
Headers: Authorization: Bearer <token>
Response: { id, username }
```

#### Check Auth
```
GET /auth/check
Headers: Authorization: Bearer <token>
Response: { authenticated: true, admin: { id, username } }
```

### Token Storage
- **In-memory store:** `TOKENS` Map in tokenUtils.js
- **In production:** Use Redis or database
- **TTL:** 24 hours
- **Format:** 64-character hex string (32 random bytes)

### Password Hashing
- **Algorithm:** SHA256
- **In production:** Use bcrypt with salt rounds 10+
- **Current admin:** username=`admin`, password=`admin123`

### Middleware Usage

#### Protected Routes
```javascript
// Requires valid token
router.get('/protected-endpoint', authMiddleware, controllerFunction)
```

#### Optional Auth
```javascript
// Doesn't fail if token missing
router.get('/endpoint', optionalAuthMiddleware, controllerFunction)
```

---

## Frontend Authentication Implementation

### Files
- `src/context/AuthContext.jsx` - Global auth state
- `src/components/ProtectedRoute.jsx` - Route protection
- `src/pages/Login.jsx` - Login page
- `src/layouts/AdminLayout.jsx` - Admin layout wrapper
- `src/components/AdminSidebar.jsx` - Navigation sidebar

### Auth Context (`AuthContext.jsx`)

**State Variables:**
- `admin` - Current admin user object
- `token` - Session token
- `isLoading` - Loading state
- `error` - Error messages
- `isAuthenticated` - Boolean flag

**Methods:**
- `login(username, password)` - Authenticate admin
- `logout()` - Clear auth session
- `useAuth()` - Hook to access auth context

**Auto-check on Mount:**
- If token exists in localStorage, verify it
- If expired/invalid, clear and redirect to login
- If valid, load admin data and allow access

### Protected Route Component

```javascript
<ProtectedRoute>
  <AdminLayout>
    <Page />
  </AdminLayout>
</ProtectedRoute>
```

If not authenticated:
- Shows loading spinner
- Redirects to `/login`

### Login Page

Features:
- Clean modern design
- Username & password inputs
- Loading state during authentication
- Error message display
- Demo credentials hint
- Gradient background

### Admin Sidebar Navigation

Features:
- Collapsible navigation (expand/collapse button)
- Active route highlighting
- Admin username display
- Logout button
- Icons for each menu item

**Menu Items:**
1. Dashboard → `/admin/dashboard`
2. Input Test → `/admin/input-test`
3. Input Result → `/admin/input-result`
4. View Past Results → `/admin/past-results`
5. Weekly Reports → `/admin/weekly-reports`
6. Students → `/admin/students`
7. Logout → Logout function

### Admin Dashboard Page

Features:
- Welcome message
- 4 stat cards (placeholder values)
- Quick action buttons
- Placeholder content areas

**Stat Cards:**
- Total Students (blue)
- Total Exams (green)
- This Week Tests (purple)
- Pending Reports (orange)

### Placeholder Pages

Each menu item links to a placeholder page:
- Input Test Page
- Input Result Page
- View Past Results Page
- Weekly Reports Page
- Students Page

---

## Directory Structure

### Backend
```
backend/src/
├── middleware/
│   └── authMiddleware.js         # Auth validation
├── controllers/
│   └── authController.js         # Login/logout logic
├── routes/
│   └── authRoutes.js            # Auth endpoints
└── utils/
    ├── passwordUtils.js         # Hash/verify
    └── tokenUtils.js            # Token management
```

### Frontend
```
frontend/src/
├── context/
│   └── AuthContext.jsx          # Auth state & provider
├── components/
│   ├── ProtectedRoute.jsx       # Route protection
│   └── AdminSidebar.jsx         # Navigation
├── layouts/
│   └── AdminLayout.jsx          # Admin wrapper
├── pages/
│   ├── Login.jsx                # Login form
│   ├── AdminDashboard.jsx       # Dashboard
│   └── AdminPages.jsx           # Placeholder pages
└── App.jsx                      # Routing config
```

---

## Data Flow Diagram

### Login Request
```
User Input (username/password)
    ↓
Login Component
    ↓
POST /api/auth/login
    ↓
Backend: Verify credentials
    ↓
Generate Token
    ↓
Response: { token, admin }
    ↓
Store in localStorage
    ↓
Update AuthContext
    ↓
Redirect to Dashboard
```

### Subsequent Requests
```
Component needs data
    ↓
Get token from AuthContext/localStorage
    ↓
Fetch with Authorization header
    ↓
Backend: Verify token (authMiddleware)
    ↓
Extract admin info
    ↓
Process request
    ↓
Return response
```

### Token Expiration
```
Page load
    ↓
Check if token exists
    ↓
POST /auth/check with token
    ↓
Backend: Verify token
    ↓
If expired:
  - Delete token from TOKENS map
  - Return 401 Unauthorized
    ↓
Frontend: Clear localStorage
    ↓
Redirect to /login
```

---

## Security Considerations

### Current Implementation (Development)
- ✓ Tokens are 32-byte random values
- ✓ Passwords hashed with SHA256
- ✓ Token expiration (24 hours)
- ✓ Protected routes
- ✓ CORS enabled

### Production Recommendations
1. **Password Hashing:** Use bcrypt with salt rounds 10+
2. **Token Storage:** Move from in-memory to Redis
3. **HTTPS:** Use SSL/TLS only
4. **Token Secret:** Store in environment variables
5. **Rate Limiting:** Add login attempt limiting
6. **Audit Logging:** Log all authentication events
7. **Session Timeout:** Shorter expiration (2-4 hours)
8. **Refresh Tokens:** Implement token refresh mechanism
9. **CSRF Protection:** Add CSRF tokens
10. **Input Validation:** Sanitize all inputs

---

## Testing the Authentication

### Manual Testing

1. **Start Backend**
   ```bash
   cd backend
   npm install
   npm run seed  # Seed admin account
   npm run dev
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access Application**
   - Go to http://localhost:5173
   - Should redirect to /login
   - Enter: username=`admin`, password=`admin123`
   - Should redirect to /admin/dashboard
   - Click menu items to navigate
   - Click Logout to return to login

### API Testing with cURL

```bash
# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Response
{
  "success": true,
  "data": {
    "token": "abc123...",
    "expiresAt": "2026-05-29T...",
    "admin": {"id": 1, "username": "admin"}
  }
}

# Check auth
curl -X GET http://localhost:5000/auth/check \
  -H "Authorization: Bearer abc123..."

# Logout
curl -X POST http://localhost:5000/auth/logout \
  -H "Authorization: Bearer abc123..."
```

---

## Features Implemented

### Authentication ✓
- Login with username/password
- Session token generation
- Token validation
- Logout/token revocation
- Auto-auth check on app load
- Token expiration handling

### Protected Routes ✓
- Login page (public)
- All admin pages (protected)
- Auto-redirect to login if not authenticated
- Loading spinner during auth check

### Admin Dashboard ✓
- Welcome banner
- 4 stat cards with placeholders
- Quick action buttons
- Navigation sidebar
- Responsive design

### Sidebar Navigation ✓
- Collapsible menu
- Active route highlighting
- Admin username display
- Logout button
- All menu items

### UI/UX ✓
- Modern gradient design
- Responsive layout
- Soft shadows
- Professional SaaS feel
- Loading states
- Error handling

---

## What's Not Implemented (Yet)

These will be built in future prompts:
- Exam creation & management
- Result entry & validation
- Ranking system
- Analytics & charts
- AI feedback generation
- Weekly reports
- Student management
- Data import/export
- PDF reports
