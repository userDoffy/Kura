import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout.jsx";
import PageLoader from "./components/PageLoader.jsx";
import { ProtectedRoute, GuestRoute } from "./components/RouteWrappers.jsx";
import useAuthUser from "./hooks/useAuthUser.js";

import LoginPage from "./pages/Auth/LoginPage.jsx";
import SignUpPage from "./pages/Auth/SignUpPage.jsx";
import VerificationPage from "./pages/Auth/VerificationPage.jsx";

import Homepage from "./pages/Chat/HomePage.jsx";

import ProfilePage from "./pages/User/ProfilePage.jsx";
import FriendsPage from "./pages/User/FriendsPage.jsx";
import { useThemeStore } from "./store/useThemeStore.js";

function App() {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  if (isLoading) return <PageLoader />;

  // Helper: check if user is verified
  const isVerified = authUser?.isVerified;

  return (
    <>
      <div className="h-screen" data-theme={theme}>
        <Routes>
          {/* Guest Routes */}
          <Route element={<GuestRoute authUser={authUser} />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Route>

          {/* Verification Route */}
          {!isVerified && authUser && (
            <Route path="/verification" element={<VerificationPage />} />
          )}

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute authUser={authUser} isVerified={isVerified} />
            }
          >
            <Route element={<Layout />}>
              <Route path="/" element={<Homepage />} />
              <Route path="/chat" element={<Homepage />} />
              <Route path="/chat/:friendId" element={<Homepage />} />
        
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/friends" element={<FriendsPage />} />
            </Route>
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster position="top-center" />
      </div>
    </>
  );
}

export default App;
