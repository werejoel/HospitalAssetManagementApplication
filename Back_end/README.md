# MRRH Asset Management Backend

Backend API for the MRRH (Mbale Regional Referral Hospital) Asset Management System built with Express.js and PostgreSQL.

## Setup Instructions

### 1. Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 2. Installation

```bash
# Install dependencies
npm install

# Or using yarn
yarn install
```

### 3. Database Setup

```bash
# Create a new PostgreSQL database
createdb mbale_asset_management_db

# Run the SQL schema to create tables
psql -U postgres -d mbale_asset_management_db -f sql.sql

# Seed the database with initial data
npm run seed
```

### 4. Environment Configuration

Create/update `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=mbale_asset_management_db
PORT=5000
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### 5. Running the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Assets
- `GET /api/assets` - Get all assets
- `GET /api/assets/:id` - Get asset by ID
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `PATCH /api/users/:id/deactivate` - Deactivate user

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Asset Assignments
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create assignment
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Maintenance
- `GET /api/maintenance` - Get all maintenance records
- `POST /api/maintenance` - Create maintenance record
- `PUT /api/maintenance/:id` - Update maintenance record
- `DELETE /api/maintenance/:id` - Delete maintenance record

### Fault Reports
- `GET /api/fault-reports` - Get all fault reports
- `POST /api/fault-reports` - Create fault report
- `PUT /api/fault-reports/:id` - Update fault report
- `DELETE /api/fault-reports/:id` - Delete fault report

### Asset Movements
- `GET /api/movements` - Get all movements
- `POST /api/movements` - Create movement
- `PUT /api/movements/:id` - Update movement
- `DELETE /api/movements/:id` - Delete movement

### Disposals
- `GET /api/disposals` - Get all disposals
- `POST /api/disposals` - Create disposal
- `PUT /api/disposals/:id` - Update disposal
- `DELETE /api/disposals/:id` - Delete disposal

## Test Credentials (After Seeding)

After running `npm run seed`, you can login with:

- **Admin**: 
  - Username: `admin`
  - Password: `admin123`
  - Email: `admin@mrrh.local`

- **Asset Manager**: 
  - Username: `asset_manager`
  - Password: `user123`
  - Email: `manager@mrrh.local`

- **Technician**: 
  - Username: `technician1`
  - Password: `user123`
  - Email: `technician@mrrh.local`

## Authentication

All API endpoints (except `/api/auth/*`) require JWT authentication.

Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Project Structure

```
Back_end/
├── controllers/       # Business logic
├── middleware/        # Authentication, validation
├── routes/           # API route definitions
├── db_config.js      # Database connection
├── index.js          # Main server file
├── seed.js           # Database seeding script
├── package.json      # Dependencies
├── .env             # Environment variables
└── sql.sql          # Database schema
```

## Role-Based Access Control

User roles and their permissions:
- **admin**: Full system access
- **asset_manager**: Can manage assets, suppliers, assignments
- **technician**: Can manage maintenance and fault reports
- **department_head**: Can manage department assets
- **staff**: Limited read access

## Error Handling

All API responses follow this format:

**Success Response:**
```json
{
  "message": "Operation successful",
  "data": {...}
}
```

**Error Response:**
```json
{
  "error": "Error message description"
}
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check `.env` credentials match your PostgreSQL setup
- Verify the database exists

### Port Already in Use
- Change the `PORT` in `.env`
- Or kill the process using port 5000

### Dependency Issues
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## Frontend Integration

The frontend expects the backend to be running on `http://localhost:5000`.

Make API calls to endpoints like:
```javascript
const response = await fetch('http://localhost:5000/api/assets', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## License

ISC

## Support

For issues or questions, contact the development team.
