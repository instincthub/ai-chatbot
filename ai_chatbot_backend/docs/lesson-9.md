# Lesson 9: User Authentication and Session Management

## Lesson Overview

In this lesson, you'll implement secure user login functionality and establish proper session management using Django REST Framework for the backend and NextAuth.js v5 for the frontend.

**Learning Objectives:**
- Create a robust login endpoint with comprehensive error handling
- Implement secure session management with JWT tokens
- Integrate Django authentication with NextAuth.js v5
- Test authentication flow end-to-end

## Implementation Steps

### 1. Backend: Create Login Endpoint

Navigate to your Django project's `authuser/views.py` file and implement the login functionality.

#### AI Prompt for Backend Development

```txt
Create a Django REST Framework login view that authenticates users with either email or username plus password. The view should:

1. Accept both email and username for login flexibility
2. Validate credentials securely
3. Generate JWT access and refresh tokens
4. Return user data with tokens upon successful authentication
5. Handle all possible error scenarios with appropriate HTTP status codes

Expected JSON response format:
{
    "username": "testuser3",
    "email": "test@example3.com", 
    "first_name": "Test",
    "last_name": "User",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Include proper error responses for invalid credentials, inactive accounts, and validation errors.
```

**Key Implementation Considerations:**
- Use Django's built-in authentication system
- Implement rate limiting to prevent brute force attacks
- Validate input data before processing
- Return consistent error message formats

### 2. API Testing with Postman

Before frontend integration, verify your endpoint works correctly through API testing.

**Setup Steps:**
1. Activate your virtual environment: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
2. Start your Django development server: `python manage.py runserver`
3. Open Postman and create a new POST request

**Test Configuration:**
```bash
URL: http://127.0.0.1:8000/api/v1/authuser/login/
Method: POST
Body: form-data or JSON
```

**Test Cases to Verify:**
- Valid email/password combination
- Valid username/password combination  
- Invalid credentials
- Missing required fields
- Inactive user account

### 3. Frontend: Login Form Implementation

Create a secure login form with proper error handling and user feedback.

#### Updated Submit Handler

```typescript
interface LoginResponse {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  access_token: string;
  refresh_token?: string;
}

interface ErrorResponse {
  detail?: string;
  message?: string;
  status: number;
}

async function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setStatus(0);
  setError(null);

  const form = new FormData(e.currentTarget);
  
  const options: RequestInit = {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: form.get('email'),
      password: form.get('password'),
    }),
  };

  const url = `${API_HOST_URL}authuser/login/`;

  try {
    const response = await fetch(url, options);
    const data: LoginResponse | ErrorResponse = await response.json();

    if (response.ok && 'access_token' in data) {
      // Successful login
      const loginData = data as LoginResponse;
      
      // Trigger NextAuth sign-in with custom credentials
      const result = await signIn("credentials", {
        email: loginData.email,
        userdata: JSON.stringify(loginData),
        redirect: false,
      });

      if (result?.ok) {
        openToast(`Welcome back, ${loginData.username}!`, 200);
        router.push('/dashboard');
      } else {
        openToast('Authentication failed', 400);
      }
    } else {
      // Handle errors
      const errorData = data as ErrorResponse;
      setStatus(errorData.status || 400);
      setError(errorData.detail || errorData.message || 'Login failed');
      openToast(errorData.detail || 'Invalid credentials', 400);
    }
  } catch (error) {
    console.error('Login error:', error);
    setStatus(500);
    openToast('Network error. Please try again.', 500);
  }
}
```

### 4. NextAuth.js Configuration

Configure NextAuth.js to handle your custom authentication flow with Django backend.

#### Custom Credentials Provider Setup

```typescript
// types/auth.ts
interface CustomUser {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  access_token: string;
  refresh_token?: string;
}

// auth.config.ts or similar NextAuth configuration file
export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        userdata: { label: "User Data", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.userdata) return null;
          
          const userData: CustomUser = JSON.parse(credentials.userdata);
          
          // Verify the token is valid (optional: make API call to verify)
          if (userData.access_token && userData.email) {
            return {
              id: userData.email,
              email: userData.email,
              name: `${userData.first_name} ${userData.last_name}`,
              username: userData.username,
              accessToken: userData.access_token,
              refreshToken: userData.refresh_token,
            };
          }
          
          return null;
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.username = token.username;
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60, // 24 hours
  },
};
```

## Security Best Practices

**Backend Security:**
- Implement CSRF protection
- Use HTTPS in production
- Set secure cookie flags
- Implement rate limiting
- Validate and sanitize all inputs

**Frontend Security:**
- Store tokens securely (httpOnly cookies preferred)
- Implement automatic token refresh
- Clear sensitive data on logout
- Validate session state on protected routes

## Testing Checklist

**Functional Tests:**
- [ ] Login with valid email/password
- [ ] Login with valid username/password  
- [ ] Error handling for invalid credentials
- [ ] Session persistence across page reloads
- [ ] Automatic logout on token expiration
- [ ] Protected route access control

**Security Tests:**
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF token validation
- [ ] Rate limiting functionality

## Common Troubleshooting

**Token Issues:**
- Verify JWT secret configuration matches between Django and NextAuth
- Check token expiration times
- Ensure proper token format in API responses

**Session Problems:**
- Confirm NextAuth configuration matches your authentication flow
- Verify callback URLs are correctly set
- Check browser storage for session data

**CORS Errors:**
- Configure Django CORS settings for your frontend domain
- Ensure proper headers in API responses

This authentication system provides a secure foundation for user management while maintaining flexibility for future enhancements like OAuth integration or multi-factor authentication.