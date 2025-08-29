import { Navigate, Outlet, useLocation } from 'react-router';

export const ProtectedRoute = ({ authUser }) => {
  const location = useLocation();

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  if (!authUser.isVerified && location.pathname !== "/verification") {
    return <Navigate to="/verification" replace />;
  }
  if (authUser.isVerified && location.pathname === "/verification") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export const GuestRoute = ({ authUser, children }) => {
  if (authUser && authUser.isVerified) {
    return <Navigate to="/" replace />;
  }
  if (authUser && !authUser.isVerified) {
    return <Navigate to="/verification" replace />;
  }
  return <Outlet />;
};
