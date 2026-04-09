# Full Stack Development Setup Guide

This guide covers the complete setup for the MRRH Asset Management System including both backend and frontend.

## System Requirements

- **Node.js**: v14 or higher
- **PostgreSQL**: v12 or higher
- **npm or yarn**: Latest version
- **Git**: For version control

## Project Structure

```
Mbale/
├── Back_end/           # Express.js API Server
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── db_config.js
│   ├── index.js
│   ├── seed.js
│   ├── package.json
│   ├── .env
│   └── sql.sql
│
└── Front_end/          # React + TypeScript Frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── lib/
    │   │   └── api.ts  # API Integration
    │   ├── App.tsx
    │   └── main.tsx
    ├── public/
    ├── tailwind.config.ts
    ├── vite.config.ts
    ├── package.json
    └── .env.local
```

## Part 1: Backend Setup

### Step 1: Install Node Dependencies

```bash
cd Back_end
npm install
```

### Step 2: Setup PostgreSQL Database

```bash
# Create database
createdb mbale_asset_management_db

# Create tables and schema
psql -U postgres -d mbale_asset_management_db -f sql.sql
```

### Step 3: Configure Environment Variables

Edit `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=mbale_asset_management_db
PORT=5000
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### Step 4: Seed the Database

```bash
npm run seed
```

This will:
- Create 5 roles (admin, asset_manager, technician, department_head, staff)
- Create 5 departments
- Create 5 test users
- Create 5 asset categories
- Create 3 suppliers
- Create 5 sample assets
- Create sample assignments, maintenance records, and fault reports

**Test Credentials:**
- Admin: `admin` / `admin123`
- Manager: `asset_manager` / `user123`
- Technician: `technician1` / `user123`

### Step 5: Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Backend will run on `http://localhost:5000`

## Part 2: Frontend Setup

### Step 1: Install Node Dependencies

```bash
cd Front_end
npm install
```

### Step 2: Configure Environment Variables

The `.env.local` file is already configured for local development:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=MRRH Asset Management System
VITE_ENABLE_DEBUG=true
```

### Step 3: Start Frontend Development Server

```bash
npm run dev
```

Frontend will run on `http://localhost:5173` (or the next available port)

### Step 4: Build for Production

```bash
npm run build
npm run preview
```

## Part 3: Integration Testing

### Test Authentication

1. Open browser to `http://localhost:5173`
2. Navigate to login page
3. Test with seed credentials:
   - Email: `admin@mrrh.local` or `manager@mrrh.local`
   - Password: `admin123` or `user123`

### Test API Endpoints

Use curl or Postman to test backend endpoints:

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mrrh.local","password":"admin123"}'

# Get Assets (requires token)
curl http://localhost:5000/api/assets \
  -H "Authorization: Bearer <your_token>"
```

### Test Frontend to Backend Communication

1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform actions in the frontend:
   - Login
   - Navigate to different pages
   - Create/edit/delete items
4. Observe API calls in Network tab
5. Check the Response to verify data format

## Common Issues & Solutions

### Issue: Database Connection Error

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Check if PostgreSQL is running
# Windows:
Get-Service PostgreSQL-x64-14  # or your version

# Mac:
brew services list | grep postgresql

# Linux:
sudo service postgresql status

# Start PostgreSQL if stopped
sudo service postgresql start  # Linux
brew services start postgresql  # Mac
```

### Issue: Port Already in Use

**Problem:** `Error: listen EADDRINUSE :::5000`

**Solution:**
```bash
# Change PORT in .env file
PORT=5001

# Or kill the process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### Issue: CORS Errors

**Problem:** Frontend can't communicate with backend

**Solution:**
- Ensure backend is running on `http://localhost:5000`
- Verify `VITE_API_URL` in frontend `.env.local` matches backend URL
- Check CORS is enabled in backend `index.js`:
  ```javascript
  app.use(cors());
  ```

### Issue: Authentication Token Not Being Sent

**Problem:** Getting 401 Unauthorized errors

**Solution:**
```typescript
// Make sure token is stored and sent properly
const token = localStorage.getItem('auth_token');
const response = await fetch('/api/assets', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Development Workflow

### Making API Requests from Frontend

Use the API helper functions in `src/lib/api.ts`:

```typescript
import { assetsAPI, authAPI } from '@/lib/api';

// Login
const { user, token } = await authAPI.login({
  email: 'admin@mrrh.local',
  password: 'admin123'
});
localStorage.setItem('auth_token', token);

// Get assets
const assets = await assetsAPI.getAll();

// Create asset
const newAsset = await assetsAPI.create({
  asset_name: 'New Equipment',
  asset_tag: 'NEW-001',
  // ... other fields
});
```

### Adding New Backend Routes

1. Create controller in `Back_end/controllers/`
2. Create route in `Back_end/routes/`
3. Import route in `Back_end/index.js`:
   ```javascript
   const newRouter = require("./routes/newRoute");
   app.use("/api/new", newRouter);
   ```
4. Add API function in `Front_end/src/lib/api.ts`
5. Use in frontend pages

### Adding New Frontend Pages

1. Create page component in `Front_end/src/pages/`
2. Import in `App.tsx`
3. Add route in `App.tsx`:
   ```typescript
   <Route path="/new-page" element={<NewPage />} />
   ```
4. Add navigation in `AppSidebar.tsx`

## Database Backup & Restore

### Backup Database

```bash
pg_dump -U postgres mbale_asset_management_db > backup.sql
```

### Restore Database

```bash
createdb mbale_asset_management_db
psql -U postgres mbale_asset_management_db < backup.sql
```

## Performance Tips

1. **Backend:**
   - Use connection pooling (already configured in db_config.js)
   - Add pagination for large datasets
   - Implement caching for frequently accessed data

2. **Frontend:**
   - Use React Query for efficient data fetching
   - Implement lazy loading for routes
   - Optimize bundle size with code splitting

## Deployment Guide

### Deploy Backend (Example: Heroku)

```bash
# Add Heroku remote
heroku create mrrh-asset-backend

# Set environment variables
heroku config:set DB_HOST=your_postgres_host
heroku config:set DB_PASSWORD=your_password
# ... set all env variables

# Deploy
git push heroku main
```

### Deploy Frontend (Example: Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Monitoring & Logging

Backend logs are printed to console. For production, consider:
- Using Winston or Pino for logging
- Setting up error tracking with Sentry
- Using monitoring services like New Relic

## Support & Documentation

- Backend API Docs: See `Back_end/README.md`
- Frontend Components: See component files for JSDoc comments
- Database Schema: See `Back_end/sql.sql`

## Troubleshooting Checklist

- [ ] PostgreSQL is running
- [ ] Database is created and schema is loaded
- [ ] Backend dependencies are installed
- [ ] Backend environment variables are set
- [ ] Backend server is running on port 5000
- [ ] Frontend dependencies are installed
- [ ] Frontend environment variables are set
- [ ] Frontend is running on port 5173
- [ ] No firewall blocking ports 5000 and 5173
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows successful API requests
