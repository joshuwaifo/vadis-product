# Authentication System Documentation

## Overview
The platform implements a role-based authentication system with PostgreSQL database persistence. Users can sign up for different roles and access role-specific dashboards.

## Supported User Roles

### 1. Production Companies
- **Purpose**: Create and manage film/TV projects
- **Access**: Production dashboard with project management tools
- **Required Fields**: Company name, contact person, years in business, recent projects

### 2. Brand/Agency
- **Purpose**: Manage products and brand partnerships
- **Access**: Brand dashboard with product management tools  
- **Required Fields**: Company name, contact person, business type, target demographics

### 3. Investor/Financier
- **Purpose**: Discover and fund entertainment projects
- **Access**: Investor dashboard with investment opportunities
- **Required Fields**: Investment focus, funding range, portfolio details

### 4. Individual Creator
- **Purpose**: Showcase creative work and find opportunities
- **Access**: Creator dashboard with portfolio tools
- **Required Fields**: Full name, creative specialties, experience level

## Signup Process

### Route: `/signup`

**Form Fields:**
- Email (required, validated)
- Password (required, minimum 6 characters)
- Role selection (required)
- Role-specific details (dynamic based on selection)

**Backend Flow:**
1. Validate form data using Zod schemas
2. Hash password with bcrypt
3. Create user record in PostgreSQL database
4. Store role-specific details as JSON
5. Return success with user data (excluding password)

**Database Schema:**
```sql
users (
  id: serial primary key,
  email: text unique not null,
  passwordHash: text not null,
  role: text not null,
  roleSpecificDetails: jsonb,
  createdAt: timestamp default now(),
  updatedAt: timestamp default now()
)
```

## Login Process

### Route: `/login`

**Form Fields:**
- Email (required)
- Password (required)

**Backend Flow:**
1. Find user by email in database
2. Compare password with stored hash using bcrypt
3. Create session if credentials valid
4. Return user data (excluding password hash)
5. Redirect to role-specific dashboard

**Session Management:**
- Express sessions with PostgreSQL store
- Session data persists across server restarts
- Automatic redirect based on user role

## Dashboard Access

After successful login, all users are redirected to the unified dashboard:

- **All Roles** → `/dashboard`

The dashboard provides role-appropriate functionality based on user type:
- **Production Companies**: Project creation, script analysis, portfolio management
- **Brand/Agency**: Product management, partnership opportunities
- **Investor/Financier**: Investment opportunities, project discovery
- **Individual Creator**: Portfolio showcase, collaboration tools

## Database Storage

**Current Implementation:**
- PostgreSQL database with persistent storage
- Auto-incrementing primary keys for all tables
- Data survives server restarts and deployments
- Managed by Replit's database service

**Storage Class:** `DatabaseStorage`
- Implements `IStorage` interface
- Error handling with try/catch blocks
- Proper password hashing and validation
- Type-safe operations with Drizzle ORM

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **Session Management**: Express sessions with secure storage
3. **Input Validation**: Zod schemas for all form data
4. **SQL Injection Protection**: Parameterized queries via Drizzle ORM
5. **Error Handling**: Sanitized error messages to prevent information leakage

## API Endpoints

### POST `/api/auth/signup`
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "role": "PRODUCTION",
  "roleSpecificDetails": {
    "companyName": "Example Studios",
    "contactPerson": "John Doe",
    "yearsInBusiness": "5",
    "recentProjects": "Project examples"
  }
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "31419915",
    "email": "user@example.com",
    "role": "PRODUCTION",
    "roleSpecificDetails": {...}
  }
}
```

### POST `/api/auth/login`
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "31419915",
    "email": "user@example.com",
    "role": "PRODUCTION",
    "roleSpecificDetails": {...}
  }
}
```

## Frontend Implementation

**Technology Stack:**
- React with TypeScript
- React Hook Form for form management
- Zod validation schemas
- TanStack Query for API calls
- Wouter for routing

**Form Components:**
- Reusable form fields with proper validation
- Role-specific form sections
- Real-time validation feedback
- Loading states during submission

**State Management:**
- React Query for server state
- Session persistence across page reloads
- Automatic redirects based on authentication status

## Error Handling

**Client-Side:**
- Form validation with instant feedback
- Network error handling
- User-friendly error messages

**Server-Side:**
- Database connection error handling
- Duplicate email prevention
- Password validation failures
- Proper HTTP status codes

## Testing Notes

**Database Testing:**
- User creation successfully generates auto-increment IDs
- Password hashing and validation working correctly
- Session persistence across server restarts
- Role-based redirects functioning properly

**Recent Test Results:**
- Signup: User ID 31419915 created successfully
- Login: Authentication working with proper session management
- Database: PostgreSQL service confirmed online and persistent