import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
);

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/appointments', '/assessment', '/chat'];

// Routes that require specific roles
const roleProtectedRoutes: Record<string, string[]> = {
  '/admin': ['admin'],
  '/dashboard': ['doctor', 'patient', 'admin'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route needs protection
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    // Redirect to login if no token
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify the token using jose (Edge-compatible)
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'breast-cancer-awareness',
      audience: 'breast-cancer-awareness-users',
    });

    // Check role-based access
    const requiredRoles = Object.entries(roleProtectedRoutes).find(
      ([route]) => pathname.startsWith(route)
    )?.[1];

    if (requiredRoles && !requiredRoles.includes(payload.role as string)) {
      // Redirect to unauthorized page or dashboard
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Add user info to headers for API routes
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId as string);
    response.headers.set('x-user-role', payload.role as string);
    
    return response;
  } catch (error) {
    // Token is invalid or expired - redirect to login
    console.error('Token verification failed in middleware:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    
    // Clear the invalid token
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth/* (auth endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
};
