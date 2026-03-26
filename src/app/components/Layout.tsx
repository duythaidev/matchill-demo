import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sun, Moon, LogOut, User, Sparkles, Compass, Building2,
  CalendarDays, LayoutDashboard, PlusSquare, Menu, X,
  Newspaper, MessageSquare, Shield, Flag, Users,
  BarChart3, PlusCircle, TrendingUp, Settings, ShoppingBag,
} from 'lucide-react';
import { Button } from './ui/button';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import { chatApi } from '../api/feedChatApi';
import { FindPartnerFAB } from './FindPartnerFAB';
import { NotificationSystem } from './NotificationSystem';
import { AdsNotificationBar } from './AdsNotificationBar';
import toast from 'react-hot-toast';

// ─── NAV CONFIGS PER ROLE ─────────────────────────────────────────────────────

const playerNavLinks = [
  { to: '/discover',    label: 'Discover',    icon: Compass },
  { to: '/feed',        label: 'Feed',        icon: Newspaper },
  { to: '/venues',      label: 'Sân thể thao', icon: Building2 },
  { to: '/marketplace', label: 'Chợ',         icon: ShoppingBag },
  { to: '/my-bookings', label: 'Booking',     icon: CalendarDays },
  { to: '/chat',        label: 'Chat',        icon: MessageSquare, badge: true },
];

const venueOwnerNavLinks = [
  { to: '/feed',             label: 'Feed',          icon: Newspaper },
  { to: '/my-venues',        label: 'Sân của tôi',   icon: Building2 },
  { to: '/venue/create',     label: 'Tạo sân mới',   icon: PlusCircle },
  { to: '/venue/dashboard',  label: 'Dashboard',     icon: TrendingUp },
  { to: '/venues',           label: 'Xem tất cả sân', icon: Compass },
  { to: '/chat',             label: 'Chat',          icon: MessageSquare, badge: true },
];

const adminNavLinks = [
  { to: '/feed',           label: 'Feed',         icon: Newspaper },
  { to: '/admin',          label: 'Tổng quan',    icon: BarChart3 },
  { to: '/admin/reports',  label: 'Báo cáo',      icon: Flag },
  { to: '/admin/users',    label: 'Người dùng',   icon: Users },
  { to: '/chat',           label: 'Chat',         icon: MessageSquare, badge: true },
];

// ─── ROLE THEME ───────────────────────────────────────────────────────────────

type RoleTheme = {
  accent: string;        // active button bg
  accentHover: string;
  badge: string;         // role badge pill in header
  logoBg: string;        // logo gradient
  roleLabel: string;
  roleBadgeStyle: string;
};

const ROLE_THEME: Record<string, RoleTheme> = {
  player: {
    accent: 'bg-teal-600 text-white hover:bg-teal-700',
    accentHover: 'hover:text-teal-600',
    badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    logoBg: 'from-teal-500 to-teal-700',
    roleLabel: 'Người chơi',
    roleBadgeStyle: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-200 dark:border-teal-700',
  },
  venueOwner: {
    accent: 'bg-blue-600 text-white hover:bg-blue-700',
    accentHover: 'hover:text-blue-600',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    logoBg: 'from-blue-500 to-blue-700',
    roleLabel: 'Chủ sân',
    roleBadgeStyle: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-700',
  },
  admin: {
    accent: 'bg-red-500 text-white hover:bg-red-600',
    accentHover: 'hover:text-red-500',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    logoBg: 'from-red-500 to-rose-700',
    roleLabel: 'Admin',
    roleBadgeStyle: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-700',
  },
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function Layout() {
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const { totalUnread, setChats } = useChatStore();

  const role = currentUser?.role ?? 'player';
  const theme = ROLE_THEME[role] ?? ROLE_THEME.player;

  const navLinks =
    role === 'admin'
      ? adminNavLinks
      : role === 'venueOwner'
      ? venueOwnerNavLinks
      : playerNavLinks;

  // Load chats for unread badge
  useEffect(() => {
    chatApi.getChats().then(setChats).catch(() => {});
  }, []);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      setIsDark(false);
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      setIsDark(true);
      localStorage.setItem('theme', 'dark');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công!');
    navigate('/login');
  };

  const initials = currentUser?.fullName
    ? currentUser.fullName.split(' ').map((n) => n[0]).slice(-2).join('').toUpperCase()
    : 'U';

  const isActive = (to: string) => {
    if (to === '/admin') return location.pathname === '/admin';
    if (to === '/feed') return location.pathname === '/feed';
    if (to === '/discover') return location.pathname === '/discover';
    return location.pathname.startsWith(to);
  };

  // Admin gets a subtle red top-border stripe
  const isAdmin = role === 'admin';
  const isVenueOwner = role === 'venueOwner';

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── STICKY WRAPPER: Ads bar + Navbar ── */}
      <div className="sticky top-0 z-50">
        {/* Ads notification bar */}
        <AdsNotificationBar />

        {/* Role stripe (admin/venueOwner only) */}
        {(isAdmin || isVenueOwner) && (
          <div
            className={`h-0.5 w-full ${
              isAdmin
                ? 'bg-gradient-to-r from-red-500 via-rose-500 to-red-600'
                : 'bg-gradient-to-r from-blue-500 via-sky-400 to-blue-600'
            }`}
          />
        )}

        {/* Navbar */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="border-b border-border bg-card/90 backdrop-blur-md"
        >
          <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

            {/* Logo */}
            <Link
              to={role === 'admin' ? '/admin' : role === 'venueOwner' ? '/my-venues' : '/discover'}
              className="flex items-center gap-2 shrink-0"
            >
              <div className={`w-8 h-8 bg-gradient-to-br ${theme.logoBg} rounded-lg flex items-center justify-center shadow-sm`}>
                {isAdmin ? (
                  <Shield className="w-4 h-4 text-white" />
                ) : isVenueOwner ? (
                  <Building2 className="w-4 h-4 text-white" />
                ) : (
                  <Sparkles className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xl font-semibold bg-gradient-to-r bg-clip-text text-transparent ${
                    isAdmin
                      ? 'from-red-500 to-rose-700 dark:from-red-400 dark:to-rose-500'
                      : isVenueOwner
                      ? 'from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-500'
                      : 'from-teal-600 to-teal-800 dark:from-teal-400 dark:to-teal-500'
                  }`}
                >
                  Matchill
                </span>
                {/* Role badge */}
                <span className={`hidden sm:inline text-xs font-bold px-2 py-0.5 rounded-full ${theme.roleBadgeStyle}`}>
                  {isAdmin ? '🛡️ Admin' : isVenueOwner ? '🏟️ Chủ sân' : 'Người chơi'}
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-0.5 overflow-x-auto">
              {navLinks.map(({ to, label, icon: Icon, badge }) => {
                const active = isActive(to);
                return (
                  <Link key={to} to={to} className="relative shrink-0">
                    <Button
                      variant={active ? 'default' : 'ghost'}
                      size="sm"
                      className={`gap-1.5 text-xs ${active ? theme.accent : `text-muted-foreground ${theme.accentHover}`}`}
                    >
                      <span className="relative">
                        <Icon className="w-3.5 h-3.5" />
                        {badge && totalUnread > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center leading-none font-bold">
                            {totalUnread > 9 ? '9+' : totalUnread}
                          </span>
                        )}
                      </span>
                      {label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Chat icon mobile */}
              <Link to="/chat" className="md:hidden relative">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MessageSquare className="w-5 h-5" />
                  {totalUnread > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                  )}
                </Button>
              </Link>

              <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-full">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              {currentUser && (
                <>
                  {/* Avatar */}
                  <button
                    onClick={() => navigate('/profile')}
                    className="hidden md:flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-secondary transition-colors"
                  >
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.fullName}
                        className={`w-7 h-7 rounded-full object-cover ring-2 ${
                          isAdmin ? 'ring-red-400/40' : isVenueOwner ? 'ring-blue-400/40' : 'ring-teal-400/40'
                        }`}
                      />
                    ) : (
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br ${theme.logoBg}`}>
                        {initials}
                      </div>
                    )}
                    <span className="text-xs font-medium text-foreground/80 max-w-24 truncate hidden lg:block">
                      {currentUser.fullName.split(' ').pop()}
                    </span>
                  </button>

                  <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full hidden md:flex text-muted-foreground hover:text-destructive">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Mobile hamburger */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full"
                onClick={() => setMenuOpen((o) => !o)}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                key="mobile-menu"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden border-t border-border bg-card overflow-hidden"
              >
                <div className="px-4 py-3 flex flex-col gap-1">

                  {/* Role indicator */}
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-1 ${
                    isAdmin
                      ? 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800'
                      : isVenueOwner
                      ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800'
                      : 'bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800'
                  }`}>
                    {currentUser?.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br ${theme.logoBg}`}>
                        {initials}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold">{currentUser?.fullName}</p>
                      <p className={`text-xs font-medium ${isAdmin ? 'text-red-600 dark:text-red-400' : isVenueOwner ? 'text-blue-600 dark:text-blue-400' : 'text-teal-600 dark:text-teal-400'}`}>
                        {theme.roleLabel}
                      </p>
                    </div>
                  </div>

                  {/* Nav links */}
                  {navLinks.map(({ to, label, icon: Icon, badge }) => {
                    const active = location.pathname === to;
                    return (
                      <Link key={to} to={to}>
                        <Button
                          variant={active ? 'default' : 'ghost'}
                          className={`w-full justify-start gap-3 ${active ? theme.accent : ''}`}
                        >
                          <span className="relative">
                            <Icon className="w-4 h-4" />
                            {badge && totalUnread > 0 && (
                              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center leading-none font-bold">
                                {totalUnread}
                              </span>
                            )}
                          </span>
                          {label}
                        </Button>
                      </Link>
                    );
                  })}

                  <div className="border-t border-border mt-2 pt-2 flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      className="justify-start gap-3"
                      onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                    >
                      <User className="w-4 h-4" />
                      Hồ sơ cá nhân
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start gap-3 text-destructive hover:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Find Partner FAB — only for players */}
      {role === 'player' && <FindPartnerFAB />}

      {/* Simulated real-time notifications */}
      <NotificationSystem />
    </div>
  );
}