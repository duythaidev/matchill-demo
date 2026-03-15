import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Users, Flag, BarChart3, CheckCircle2, XCircle,
  AlertTriangle, Ban, UserCheck, Search, ChevronRight,
  TrendingUp, CalendarDays, Star,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { adminApi, Report, AdminUser } from '../api/feedChatApi';
import toast from 'react-hot-toast';

// ─── STAT CARD ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Users} label="Tổng người dùng" value="127" sub="+12 tuần này" color="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" />
        <StatCard icon={Shield} label="Đội đang hoạt động" value="23" sub="5 đội mới hôm nay" color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" />
        <StatCard icon={Flag} label="Báo cáo chờ xử lý" value="3" sub="2 người dùng, 1 bài đăng" color="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" />
        <StatCard icon={CalendarDays} label="Booking tháng này" value="89" sub="↑ 23% so với tháng trước" color="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" />
      </div>

      {/* Quick actions */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-muted-foreground">Truy cập nhanh</p>
        <div className="space-y-2">
          <Link to="/admin/reports">
            <button className="w-full flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3 hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-colors">
              <div className="flex items-center gap-3">
                <Flag className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium">Xem báo cáo</span>
                <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">3 chờ xử lý</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </Link>
          <Link to="/admin/users">
            <button className="w-full flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3 hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-colors">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-medium">Quản lý người dùng</span>
                <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">2 bị cảnh báo</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </Link>
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground mb-3">Hoạt động gần đây</p>
        <div className="space-y-2">
          {[
            { icon: '👤', text: 'Nguyen Van Anh đã đăng ký tài khoản mới', time: '5p trước' },
            { icon: '📋', text: 'Booking #bk_089 tại Sky Court được xác nhận', time: '12p trước' },
            { icon: '⚽', text: 'Team "Weekend Warriors" đủ 5 thành viên', time: '1h trước' },
            { icon: '🚩', text: 'Báo cáo mới: Post spam trong feed', time: '2h trước' },
            { icon: '⭐', text: 'Dang Minh Khoa nhận đánh giá 5 sao mới', time: '3h trước' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm py-1.5">
              <span className="text-base">{item.icon}</span>
              <span className="flex-1 text-foreground/80">{item.text}</span>
              <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── REPORTS TAB ──────────────────────────────────────────────────────────────

function ReportsTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await adminApi.getReports();
        setReports(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAction = async (reportId: string, action: 'resolve' | 'dismiss') => {
    await adminApi.resolveReport(reportId, action);
    setReports((prev) =>
      prev.map((r) => r.id === reportId ? { ...r, status: action === 'resolve' ? 'resolved' : 'dismissed' } : r)
    );
    toast.success(action === 'resolve' ? '✅ Đã xử lý báo cáo' : '🗑️ Đã bỏ qua báo cáo');
  };

  const filtered = filter === 'all' ? reports : reports.filter((r) => r.status === 'pending');

  const statusStyle: Record<string, string> = {
    pending: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    dismissed: 'bg-secondary text-muted-foreground',
  };
  const statusLabel: Record<string, string> = {
    pending: 'Chờ xử lý',
    resolved: 'Đã xử lý',
    dismissed: 'Bỏ qua',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        {(['pending', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
              filter === f ? 'bg-teal-600 text-white border-teal-600' : 'border-border text-muted-foreground hover:border-teal-400'
            }`}
          >
            {f === 'pending' ? 'Chờ xử lý' : 'Tất cả'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-3xl mb-2">✅</p>
          <p>Không có báo cáo nào chờ xử lý!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{report.type === 'user' ? '👤' : '📝'}</span>
                  <div>
                    <p className="font-semibold text-sm">{report.targetName}</p>
                    <p className="text-xs text-muted-foreground">
                      Báo cáo bởi: {report.reporterName}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[report.status]}`}>
                  {statusLabel[report.status]}
                </span>
              </div>

              <p className="text-sm text-muted-foreground bg-secondary/40 rounded-lg p-3 leading-relaxed">
                "{report.reason}"
              </p>

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {new Date(report.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                {report.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs h-8"
                      onClick={() => handleAction(report.id, 'dismiss')}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Bỏ qua
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs h-8"
                      onClick={() => handleAction(report.id, 'resolve')}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Xử lý
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── USERS TAB ────────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await adminApi.getUsers(search || undefined);
        setUsers(data);
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(load, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [search]);

  const handleStatusChange = async (userId: string, status: AdminUser['status']) => {
    await adminApi.changeUserStatus(userId, status);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status } : u));
    const labels = { active: 'kích hoạt', warned: 'cảnh báo', banned: 'khóa' };
    toast.success(`✅ Đã ${labels[status]} tài khoản!`);
  };

  const statusBadge: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warned: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    banned: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  const statusLabel: Record<string, string> = { active: 'Hoạt động', warned: 'Cảnh báo', banned: 'Bị khóa' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên hoặc email..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-xl p-3 flex items-center gap-3"
            >
              {/* Avatar placeholder */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 ${
                user.status === 'banned' ? 'bg-red-400' : 'bg-teal-600'
              }`}>
                {user.name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusBadge[user.status]}`}>
                    {statusLabel[user.status]}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span>{user.email}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {user.reputation}
                  </span>
                  <span>·</span>
                  <span>{user.totalMatches} trận</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 shrink-0">
                {user.status !== 'active' && (
                  <button
                    onClick={() => handleStatusChange(user.id, 'active')}
                    className="flex items-center gap-1 text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 px-2 py-1 rounded-lg transition-colors"
                  >
                    <UserCheck className="w-3 h-3" />
                    Bỏ phạt
                  </button>
                )}
                {user.status !== 'warned' && user.status !== 'banned' && (
                  <button
                    onClick={() => handleStatusChange(user.id, 'warned')}
                    className="flex items-center gap-1 text-xs text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 px-2 py-1 rounded-lg transition-colors"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Cảnh báo
                  </button>
                )}
                {user.status !== 'banned' && (
                  <button
                    onClick={() => handleStatusChange(user.id, 'banned')}
                    className="flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg transition-colors"
                  >
                    <Ban className="w-3 h-3" />
                    Khóa
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview', label: 'Tổng quan', icon: BarChart3, path: '/admin' },
  { id: 'reports', label: 'Báo cáo', icon: Flag, path: '/admin/reports' },
  { id: 'users', label: 'Người dùng', icon: Users, path: '/admin/users' },
];

export function AdminPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = location.pathname === '/admin'
    ? 'overview'
    : location.pathname.includes('/reports')
    ? 'reports'
    : 'users';

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center shadow-sm shadow-red-500/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1>Admin <span className="text-red-500">Panel</span></h1>
        </div>
        <p className="text-muted-foreground text-sm ml-12">Quản lý hệ thống Matchill</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex bg-secondary/60 p-1 rounded-xl mb-6 gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                active
                  ? 'bg-card text-red-500 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && <OverviewTab key="overview" />}
        {activeTab === 'reports' && <ReportsTab key="reports" />}
        {activeTab === 'users' && <UsersTab key="users" />}
      </AnimatePresence>
    </div>
  );
}
