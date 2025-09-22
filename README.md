# TCommerce Backend API

A complete e-commerce backend API built with Node.js, Express, and PostgreSQL (Supabase), featuring JWT authentication, user management, and production-ready security.

## 🚀 Features

- **Authentication System**: Complete JWT-based authentication with registration, login, and profile management
- **Database**: PostgreSQL integration with Supabase
- **Security**: Helmet, CORS, rate limiting, input validation
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Validation**: Input validation using Joi schema validation
- **Password Security**: Bcrypt password hashing with salt rounds
- **Database Migrations**: Automated database schema management
- **Production Ready**: Configured for Vercel deployment

## 📁 Project Structure

```
tcommerce-BE/
├── src/
│   ├── config/           # Configuration files
│   │   ├── config.js     # Environment configuration
│   │   └── database.js   # Database connection setup
│   ├── controllers/      # Request handlers
│   │   └── authController.js
│   ├── middleware/       # Express middleware
│   │   ├── auth.js       # JWT authentication middleware
│   │   └── security.js   # Security middleware
│   ├── models/           # Database models
│   │   └── User.js       # User model
│   ├── routes/           # API routes
│   │   ├── authRoutes.js # Authentication routes
│   │   └── index.js      # Route aggregator
│   ├── utils/            # Utility functions
│   │   ├── auth.js       # Auth utilities (JWT, bcrypt)
│   │   ├── errorHandler.js # Error handling utilities
│   │   └── validation.js # Input validation schemas
│   └── database/
│       ├── migrations/   # SQL migration files
│       └── migrate.js    # Migration runner
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies and scripts
├── server.js            # Main server file
└── README.md            # This file
```

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd tcommerce-BE
npm install
```

### 2. Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Update `.env` with your Supabase credentials:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Database Configuration
DATABASE_URL=your_postgresql_database_url_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 3. Database Setup

Run the database migrations:
```bash
npm run migrate
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/v1/auth/register` | User registration | No |
| `POST` | `/api/v1/auth/login` | User login | No |
| `GET` | `/api/v1/auth/profile` | Get user profile | Yes |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API information |
| `GET` | `/api/v1/health` | Health check |

### 🔐 Authentication Usage

#### Register a new user:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "phone": "+1234567890"
  }'
```

#### Login:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

#### Get Profile (requires token):
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request rate limiting
- **Input Validation**: Joi schema validation
- **Password Hashing**: Bcrypt with salt rounds
- **JWT**: Secure token-based authentication
- **Error Handling**: Secure error responses

## 🚦 Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run migrate    # Run database migrations
npm run setup      # Install dependencies and run migrations
npm run test       # Run tests
npm run test:watch # Run tests in watch mode
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint errors
```

## 🗃️ Database Schema

### Users Table
```sql
- id (UUID, Primary Key)
- first_name (VARCHAR(50))
- last_name (VARCHAR(50))
- email (VARCHAR(255), Unique)
- password (VARCHAR(255), Hashed)
- phone (VARCHAR(20), Optional)
- is_active (BOOLEAN, Default: true)
- last_login (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🚀 Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard

### Environment Variables for Production
- Set all variables from `.env.example`
- Use production database URL
- Set `NODE_ENV=production`
- Use strong JWT secret

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

## 📝 File Explanations

- **`server.js`**: Main application entry point with Express setup
- **`src/config/config.js`**: Environment configuration and validation
- **`src/config/database.js`**: Supabase and PostgreSQL connection setup
- **`src/controllers/authController.js`**: Authentication business logic
- **`src/middleware/auth.js`**: JWT authentication middleware
- **`src/middleware/security.js`**: Security middleware (CORS, rate limiting)
- **`src/models/User.js`**: User database model with CRUD operations
- **`src/utils/auth.js`**: Authentication utilities (JWT, bcrypt)
- **`src/utils/validation.js`**: Joi validation schemas
- **`src/utils/errorHandler.js`**: Global error handling
- **`src/database/migrations/`**: SQL migration files

## 🔄 Next Steps

This foundation supports adding:
- Product management
- Shopping cart functionality
- Order processing
- Payment integration
- Admin dashboard
- Email notifications
- File upload handling
- Advanced search and filtering

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details