import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout.jsx";
import PageLoader from "./components/PageLoader.jsx";
import { 
  ProtectedRoute, 
  GuestRoute, 
} from "./components/RouteWrappers.jsx";
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

  return (
    <div className="h-screen" data-theme={theme}>
      <Routes>
        {/* Public Guest Routes - Only accessible when not authenticated */}
        <Route element={<GuestRoute authUser={authUser} />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>

        {/* Verification Route - Special handling for unverified users */}
        <Route 
          path="/verification" 
          element={
            authUser && !authUser.isVerified ? 
              <VerificationPage /> : 
              <Navigate to={authUser ? "/" : "/login"} replace />
          } 
        />

        {/* User Protected Routes - Only accessible for verified users */}
        <Route element={<ProtectedRoute authUser={authUser} />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/chat" element={<Navigate to="/" replace />} />
            <Route path="/chat/:friendId" element={<Homepage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/friends" element={<FriendsPage />} />
          </Route>
        </Route>

        {/* Catch-all Route */}
        <Route 
          path="*" 
          element={
            <Navigate 
              to={
                !authUser ? "/login" :
                !authUser.isVerified ? "/verification" :
                "/"
              } 
              replace 
            />
          } 
        />
      </Routes>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;