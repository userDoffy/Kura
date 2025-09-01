import { Navigate, Outlet, useLocation } from 'react-router';

// Protected route for regular verified users (non-admin)
export const ProtectedRoute = ({ authUser }) => {
  const location = useLocation();

  // Not authenticated - redirect to login
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  // Admin users shouldn't access regular user routes
  if (authUser.isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Not verified - redirect to verification
  if (!authUser.isVerified) {
    return <Navigate to="/verification" replace />;
  }

  return <Outlet />;
};

// Guest route - only accessible when not authenticated
export const GuestRoute = ({ authUser }) => {
  // Already authenticated
  if (authUser) {
    // Admin goes to admin dashboard
    if (authUser.isAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // Verified user goes to homepage
    if (authUser.isVerified) {
      return <Navigate to="/" replace />;
    }
    
    // Unverified user goes to verification
    return <Navigate to="/verification" replace />;
  }

  return <Outlet />;
};

// Admin guest route - only accessible when not an admin
export const AdminGuestRoute = ({ authUser }) => {
  // Already an admin - go to dashboard
  if (authUser?.isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Regular authenticated user trying to access admin login
  if (authUser && !authUser.isAdmin) {
    return <Navigate to={authUser.isVerified ? "/" : "/verification"} replace />;
  }

  return <Outlet />;
};

// Admin protected route - only accessible for authenticated admins
export const AdminProtectedRoute = ({ authUser }) => {
  // Not authenticated - redirect to admin login
  if (!authUser) {
    return <Navigate to="/admin/login" replace />;
  }

  // Not an admin - redirect based on verification status
  if (!authUser.isAdmin) {
    return <Navigate to={authUser.isVerified ? "/" : "/verification"} replace />;
  }

  // Admin doesn't need to be verified for admin routes
  return <Outlet />;
};