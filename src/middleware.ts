import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here
    console.log("Middleware ejecutándose para:", req.nextUrl.pathname);
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Solo verificar si existe token para rutas protegidas
        return !!token;
      }
    },
  }
)

// Protect only specific routes - not the homepage
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/task-list/:path*', 
    '/interactive-calendar/:path*',
    '/collaborative-docs/:path*',
    '/smart-assist/:path*',
    '/sync/:path*'
  ]
}
