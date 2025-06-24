# AI-Enhanced Authentication Setup with Django REST API

This document outlines the implementation of NextAuth.js v5 with AI-powered authentication features for the chatbot frontend, integrated with a Django REST API backend.

## Overview

The authentication system includes:

- NextAuth.js v5 with JWT strategy
- Django REST API integration
- AI-enhanced security analysis
- Password strength validation
- Rate limiting and brute force protection
- Session management
- Protected routes

## Architecture

### Core Components

1. **NextAuth Configuration** (`src/lib/auth.ts`)

   - Credentials provider
   - JWT session strategy
   - Django API integration
   - Custom callbacks for user data

2. **API Client** (`src/lib/api-client.ts`)

   - Centralized Django API communication
   - Type-safe request/response handling
   - Error handling and retry logic

3. **AI Authentication Service** (`src/lib/auth-service.ts`)

   - Advanced validation logic
   - Security analysis
   - Password strength assessment
   - Login attempt monitoring

4. **Middleware** (`src/middleware.ts`)
   - Route protection
   - Authentication checks
   - Automatic redirects

## Setup Instructions

### 1. Install Dependencies

```bash
npm install next-auth@beta @auth/core
```

### 2. Environment Variables

Create a `.env.local` file with:

```env
# Django REST API
DJANGO_API_URL="http://localhost:8000/api"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# AI Authentication (Optional)
AI_AUTH_ENABLED="true"
AI_SECURITY_LEVEL="high"
```

### 3. Django API Endpoints

Ensure your Django backend has the following endpoints:

#### Authentication Endpoints
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/refresh/` - Token refresh
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - User profile

#### Expected Response Formats

**Login Response:**
```json
{
  "user": {
    "id": "1",
    "email": "user@example.com",
    "username": "username",
    "first_name": "John",
    "last_name": "Doe"
  },
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token"
}
```

**Register Response:**
```json
{
  "user": {
    "id": "1",
    "email": "user@example.com",
    "username": "username",
    "first_name": "John",
    "last_name": "Doe"
  },
  "message": "User registered successfully"
}
```

### 4. Start Development Server

```bash
npm run dev
```

## AI Features

### Security Analysis

The AI authentication service includes:

- **Login Attempt Analysis**: Monitors failed attempts and implements rate limiting
- **Password Strength Assessment**: Multi-factor password validation
- **Behavioral Analysis**: Tracks user patterns for suspicious activity
- **Adaptive Security**: Adjusts security measures based on threat levels

### Password Validation

Passwords are evaluated on:

- Length (minimum 8 characters)
- Character complexity (uppercase, lowercase, numbers, symbols)
- Common password detection
- Entropy analysis

### Rate Limiting

- Maximum 5 failed attempts per user
- 10 login attempts per 5-minute window
- Automatic blocking of suspicious IPs

## Usage

### Protected Routes

Wrap components that require authentication:

```tsx
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

### Authentication Hook

Use the custom hook for authentication state:

```tsx
import { useAuth } from "@/lib/hooks/useAuth";

export default function MyComponent() {
  const { session, isAuthenticated, login, logout } = useAuth();

  // Component logic
}
```

### API Client Usage

```tsx
import { ApiClient } from "@/lib/api-client";

// Login
const loginResult = await ApiClient.login({
  email: "user@example.com",
  password: "password123"
});

// Register
const registerResult = await ApiClient.register({
  email: "user@example.com",
  username: "username",
  first_name: "John",
  last_name: "Doe",
  password: "password123"
});
```

### User Registration

The signup process includes:

- Real-time validation
- AI-powered security checks
- Password strength feedback
- Duplicate user detection

## Security Features

1. **JWT Tokens**: Secure session management with Django JWT
2. **API Security**: Centralized API client with error handling
3. **CSRF Protection**: Built-in NextAuth.js protection
4. **Rate Limiting**: Prevents brute force attacks
5. **Input Validation**: Comprehensive form validation
6. **Session Management**: Secure session handling

## Testing

### Manual Testing

1. Navigate to `/auth/signup` to create a new account
2. Use `/auth/login` to authenticate
3. Access protected routes at `/main/dashboard`
4. Test logout functionality

### API Testing

Test Django API endpoints directly:

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Register
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"username","first_name":"John","last_name":"Doe","password":"password123"}'
```

## Troubleshooting

### Common Issues

1. **API Connection**: Ensure Django server is running and DJANGO_API_URL is correct
2. **Environment Variables**: Verify all required variables are set
3. **CORS Issues**: Configure Django CORS settings for frontend domain
4. **Session Issues**: Check NEXTAUTH_SECRET and NEXTAUTH_URL

### Debug Mode

Enable debug logging in development:

```typescript
// In src/lib/auth.ts
export const authConfig: NextAuthConfig = {
  debug: process.env.NODE_ENV === "development",
  // ... other config
};
```

## Production Deployment

### Security Checklist

- [ ] Use strong NEXTAUTH_SECRET
- [ ] Configure HTTPS
- [ ] Set up proper Django security settings
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set up monitoring and logging

### Environment Variables

Ensure production environment has:

- Secure DJANGO_API_URL
- Strong NEXTAUTH_SECRET
- Correct NEXTAUTH_URL
- AI_AUTH_ENABLED=true

## API Endpoints

### Authentication Routes

- `POST /api/auth/signin` - User login (NextAuth.js)
- `POST /api/auth/signout` - User logout (NextAuth.js)
- `GET /api/auth/session` - Get current session (NextAuth.js)

### Django API Routes

- `POST /api/auth/login/` - Django login
- `POST /api/auth/register/` - Django registration
- `POST /api/auth/refresh/` - Token refresh
- `POST /api/auth/logout/` - Django logout
- `GET /api/auth/profile/` - User profile

### Protected Routes

- `/main/*` - Main application routes
- `/dashboard` - Dashboard pages
- `/chat` - Chat functionality

## Future Enhancements

1. **Multi-factor Authentication**: SMS/Email verification
2. **Social Login**: Google, GitHub, etc.
3. **Advanced AI**: Machine learning for threat detection
4. **Audit Logging**: Comprehensive security logs
5. **User Management**: Admin panel for user management
6. **Token Refresh**: Automatic JWT token refresh
7. **Offline Support**: Service worker for offline functionality
