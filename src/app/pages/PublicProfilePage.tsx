import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  MapPin, Star, Calendar, Trophy, Activity, TrendingUp,
  MessageSquare, UserPlus, Gamepad2, ArrowLeft, Flag,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { api } from '../api/api';
import { User } from '../stores/authStore';
import { getBadgeProgress } from '../lib/badgeSystem';
import { AchievementsGrid } from '../components/AchievementBadge';

const SPORT_ICONS: Record<string, string> = {
  Badminton: '🏸', Tennis: '🎾', Pickleball: '🏓', Football: '⚽',
  Basketball: '🏀', Volleyball: '🏐', 'Table Tennis': '🏓', Squash: '🎯',
  Swimming: '🏊', Golf: '⛳',
};
const SKILL_LABELS = ['', 'Mới bắt đầu', 'Cơ bản', 'Trung bình', 'Khá', 'Chuyên nghiệp'];

const MOCK_ACTIVITIES = [
  { id: 1, type: 'match', title: 'Cầu lông đôi tại Sky Court', date: '2 ngày trước', rating: 5, sport: '🏸' },
  { id: 2, type: 'match', title: 'Tennis cuối tuần tại VTF Academy', date: '5 ngày trước', rating: 4, sport: '🎾' },
  { id: 3, type: 'achievement', title: 'Đạt huy hiệu "On-time Player"', date: '1 tuần trước', sport: '🏆' },
  { id: 4, type: 'match', title: 'Cầu lông doubles tại City Arena', date: '2 tuần trước', rating: 5, sport: '🏸' },
];

export function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getPublicProfile(id)
      .then(setUser)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 animate-pulse" />
          <div className="text-muted-foreground text-sm">Đang tải hồ sơ...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold">Không tìm thấy người dùng</p>
        <Button variant="outline" onClick={() => navigate(-1)}>← Quay lại</Button>
      </div>
    );
  }

  const enrichedUser = { ...user, totalGames: 42, teamRequestsCreated: 6 };
  const badgeProgress = getBadgeProgress(enrichedUser);
  const unlockedCount = badgeProgress.filter((b) => b.unlocked).length;
  const initials = user.fullName.split(' ').map((n) => n[0]).slice(-2).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <div className="relative">
        {/* Cover */}
        <div className="h-40 sm:h-52 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
          />
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 p-2 rounded-xl bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm flex items-center gap-1.5 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
        </div>

        {/* Avatar row */}
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 sm:-mt-16 pb-4">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 14 }}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-700 ring-4 ring-background shadow-xl overflow-hidden shrink-0"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">{initials}</div>
              )}
            </motion.div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold">{user.fullName}</h1>
                {user.age && (
                  <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                    {user.age} tuổi
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 font-medium">
                  🏆 {unlockedCount}/{badgeProgress.length} thành tựu
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.location.city && (
                  <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />{user.location.city}
                  </span>
                )}
                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                  <span className="flex gap-0.5">
                    {[1,2,3,4,5].map((n) => (
                      <Star key={n} className={`w-3 h-3 ${n <= user.skillLevel ? 'fill-teal-500 text-teal-500' : 'text-slate-300'}`} />
                    ))}
                  </span>
                  {SKILL_LABELS[user.skillLevel]}
                </span>
              </div>
              {user.bio && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{user.bio}</p>}
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              <Button size="sm" className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white" onClick={() => navigate('/chat')}>
                <MessageSquare className="w-4 h-4" /> Nhắn tin
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5">
                <UserPlus className="w-4 h-4" /> Mời chơi
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 pb-12 space-y-5">

        {/* ── STATS ─────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: TrendingUp, label: 'Điểm danh tiếng', value: user.reputation.score, color: 'text-teal-600' },
            { icon: Activity, label: 'Tỷ lệ tham gia', value: `${user.reputation.attendanceRate}%`, color: 'text-blue-500' },
            { icon: Star, label: 'Đánh giá TB', value: user.reputation.avgRating ? `${user.reputation.avgRating}★` : 'N/A', color: 'text-yellow-500' },
            { icon: Gamepad2, label: 'Trận đã chơi', value: enrichedUser.totalGames, color: 'text-purple-500' },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card border border-border rounded-2xl p-3 text-center"
            >
              <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
              <div className="text-lg font-bold">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── SPORTS ────────────────────────────────────────────────────────── */}
        {user.sports.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {user.sports.map((s) => (
              <span key={s} className="flex items-center gap-1 px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium border border-teal-200 dark:border-teal-700">
                {SPORT_ICONS[s] ?? '🏅'} {s}
              </span>
            ))}
          </div>
        )}

        {/* ── ACHIEVEMENTS ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-4 sm:p-5"
        >
          <AchievementsGrid badges={badgeProgress} size="md" showHeader />
        </motion.div>

        {/* ── RECENT ACTIVITIES ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold">Hoạt động gần đây</h3>
          </div>
          <div className="space-y-2">
            {MOCK_ACTIVITIES.map((act, i) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.06 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-card flex items-center justify-center text-lg shrink-0 border border-border">
                  {act.sport}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{act.title}</p>
                  <p className="text-xs text-muted-foreground">{act.date}</p>
                </div>
                {act.rating && (
                  <div className="flex gap-0.5 shrink-0">
                    {[1,2,3,4,5].map((n) => (
                      <Star key={n} className={`w-3 h-3 ${n <= act.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── REPORT ────────────────────────────────────────────────────────── */}
        <div className="text-center">
          <button className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 mx-auto">
            <Flag className="w-3 h-3" /> Báo cáo tài khoản này
          </button>
        </div>
      </div>
    </div>
  );
}
