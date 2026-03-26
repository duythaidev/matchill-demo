import { createBrowserRouter, Navigate } from 'react-router';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { MatchRequestCreatePage } from './pages/MatchRequestCreatePage';
import { VenuesPage } from './pages/VenuesPage';
import { VenueDetailPage } from './pages/VenueDetailPage';
import { BookingPage } from './pages/BookingPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { MyVenuesPage } from './pages/MyVenuesPage';
import { VenueCreatePage } from './pages/VenueCreatePage';
import { VenueDashboardPage } from './pages/VenueDashboardPage';
import { FeedPage } from './pages/FeedPage';
import { ChatListPage } from './pages/ChatListPage';
import { ChatRoomPage } from './pages/ChatRoomPage';
import { RatingPage } from './pages/RatingPage';
import { AdminPage } from './pages/AdminPage';
import { FindPartnerPage } from './pages/FindPartnerPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { MarketplacePostPage } from './pages/MarketplacePostPage';
import { MarketplaceDetailPage } from './pages/MarketplaceDetailPage';
import { Layout } from './components/Layout';
import { useAuthStore } from './stores/authStore';

function ProtectedLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.currentUser?.role);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout />;
}

// Redirect root "/" based on role
function RootRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.currentUser?.role);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'venueOwner') return <Navigate to="/my-venues" replace />;
  return <Navigate to="/discover" replace />;
}

export const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedLayout />,
    children: [
      { path: '/discover', element: <DiscoverPage /> },
      { path: '/match-request/create', element: <MatchRequestCreatePage /> },
      { path: '/venues', element: <VenuesPage /> },
      { path: '/venues/:venueId', element: <VenueDetailPage /> },
      { path: '/booking/:venueId', element: <BookingPage /> },
      { path: '/my-bookings', element: <MyBookingsPage /> },
      { path: '/my-venues', element: <MyVenuesPage /> },
      { path: '/venue/create', element: <VenueCreatePage /> },
      { path: '/venue/dashboard', element: <VenueDashboardPage /> },
      { path: '/venue/dashboard/:venueId', element: <VenueDashboardPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/profile/:id', element: <PublicProfilePage /> },
      // Feed & Chat
      { path: '/feed', element: <FeedPage /> },
      { path: '/chat', element: <ChatListPage /> },
      { path: '/chat/:chatId', element: <ChatRoomPage /> },
      // Rating
      { path: '/rating/:activityId', element: <RatingPage /> },
      // Find Partner
      { path: '/find-partner', element: <FindPartnerPage /> },
      // Marketplace
      { path: '/marketplace', element: <MarketplacePage /> },
      { path: '/marketplace/post', element: <MarketplacePostPage /> },
      { path: '/marketplace/:id', element: <MarketplaceDetailPage /> },
      // Admin
      { path: '/admin', element: <AdminPage /> },
      { path: '/admin/reports', element: <AdminPage /> },
      { path: '/admin/users', element: <AdminPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);