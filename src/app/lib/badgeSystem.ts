import {
  Sprout, Clock, Users, Star, Trophy, Sunrise, Shield,
  Zap, Target, Flame, Crown, Swords,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { User } from '../stores/authStore';

// ─── BADGE DEFINITION ─────────────────────────────────────────────────────────

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  unlockCondition: string;
  icon: LucideIcon;
  /** Tailwind color token used for teal/colored state */
  colorClass: string;
  glowClass: string;
  /** Check against user stats; totalGames optional for extended stat */
  check: (user: User & { totalGames?: number; teamRequestsCreated?: number }) => boolean;
  /** 0‑100 progress hint when locked */
  progressHint?: (user: User & { totalGames?: number; teamRequestsCreated?: number }) => number;
}

export const ALL_BADGES: BadgeDefinition[] = [
  // ── NEWCOMER ─────────────────────────────────────────────────────────────
  {
    id: 'active_newcomer',
    name: 'Active Newcomer',
    description: 'Thành viên mới năng động của Matchill',
    unlockCondition: 'Đăng ký tài khoản và hoàn thiện hồ sơ',
    icon: Sprout,
    colorClass: 'text-emerald-500',
    glowClass: 'shadow-emerald-400/40',
    check: (user) => user.badges.includes('Active Newcomer') || !!user.fullName,
    progressHint: () => 100,
  },
  // ── ON-TIME ───────────────────────────────────────────────────────────────
  {
    id: 'on_time_player',
    name: 'On-time Player',
    description: 'Luôn đúng giờ, là người đáng tin cậy trong đội',
    unlockCondition: 'Tỷ lệ tham gia đúng hẹn ≥ 90%',
    icon: Clock,
    colorClass: 'text-teal-500',
    glowClass: 'shadow-teal-400/40',
    check: (u) => u.reputation.attendanceRate >= 90,
    progressHint: (u) => Math.round((u.reputation.attendanceRate / 90) * 100),
  },
  // ── TEAM BUILDER ──────────────────────────────────────────────────────────
  {
    id: 'team_builder',
    name: 'Team Builder',
    description: 'Nhà kiến tạo đội — luôn chủ động ghép nhóm',
    unlockCondition: 'Tạo ≥ 5 match request',
    icon: Users,
    colorClass: 'text-blue-500',
    glowClass: 'shadow-blue-400/40',
    check: (u) => (u.teamRequestsCreated ?? 0) >= 5,
    progressHint: (u) => Math.min(100, Math.round(((u.teamRequestsCreated ?? 0) / 5) * 100)),
  },
  // ── 5-STAR HOST ───────────────────────────────────────────────────────────
  {
    id: 'five_star_host',
    name: '5-Star Host',
    description: 'Được đồng đội đánh giá xuất sắc',
    unlockCondition: 'Điểm đánh giá trung bình ≥ 4.8',
    icon: Star,
    colorClass: 'text-yellow-500',
    glowClass: 'shadow-yellow-400/40',
    check: (u) => u.reputation.avgRating >= 4.8,
    progressHint: (u) => Math.round((u.reputation.avgRating / 4.8) * 100),
  },
  // ── MARATHON RUNNER ───────────────────────────────────────────────────────
  {
    id: 'marathon_runner',
    name: 'Marathon Runner',
    description: 'Chiến binh bền bỉ — không bỏ lỡ trận nào',
    unlockCondition: 'Tham gia ≥ 50 trận đấu',
    icon: Trophy,
    colorClass: 'text-orange-500',
    glowClass: 'shadow-orange-400/40',
    check: (u) => (u.totalGames ?? 0) >= 50,
    progressHint: (u) => Math.min(100, Math.round(((u.totalGames ?? 0) / 50) * 100)),
  },
  // ── EARLY BIRD ────────────────────────────────────────────────────────────
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Luôn là người đầu tiên đến sân mỗi sáng',
    unlockCondition: 'Tham gia ≥ 3 trận sáng sớm (trước 8:00)',
    icon: Sunrise,
    colorClass: 'text-amber-500',
    glowClass: 'shadow-amber-400/40',
    check: (u) => u.badges.includes('Early Bird'),
    progressHint: () => 40,
  },
  // ── RELIABLE TEAMMATE ─────────────────────────────────────────────────────
  {
    id: 'reliable_teammate',
    name: 'Reliable Teammate',
    description: 'Không có vi phạm, đồng đội tin tưởng',
    unlockCondition: 'Không bị báo cáo vi phạm trong 30 ngày',
    icon: Shield,
    colorClass: 'text-cyan-500',
    glowClass: 'shadow-cyan-400/40',
    check: (u) => u.badges.includes('Reliable Teammate') || u.reputation.score >= 500,
    progressHint: (u) => Math.min(100, Math.round((u.reputation.score / 500) * 100)),
  },
  // ── QUICK RESPONDER ───────────────────────────────────────────────────────
  {
    id: 'quick_responder',
    name: 'Quick Responder',
    description: 'Phản hồi lời mời nhanh như chớp',
    unlockCondition: 'Phản hồi 10 lời mời trong vòng 5 phút',
    icon: Zap,
    colorClass: 'text-violet-500',
    glowClass: 'shadow-violet-400/40',
    check: (u) => u.badges.includes('Quick Responder'),
    progressHint: () => 60,
  },
  // ── SHARPSHOOTER ─────────────────────────────────────────────────────────
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: 'Kỹ thuật chuẩn xác — tỷ lệ thắng cao',
    unlockCondition: 'Đạt skill level 5 và tham gia ≥ 20 trận',
    icon: Target,
    colorClass: 'text-rose-500',
    glowClass: 'shadow-rose-400/40',
    check: (u) => u.skillLevel >= 5 && (u.totalGames ?? 0) >= 20,
    progressHint: (u) => {
      const skillPct = (u.skillLevel / 5) * 50;
      const gamePct = Math.min(50, Math.round(((u.totalGames ?? 0) / 20) * 50));
      return Math.round(skillPct + gamePct);
    },
  },
  // ── HOT STREAK ────────────────────────────────────────────────────────────
  {
    id: 'hot_streak',
    name: 'Hot Streak',
    description: 'Thể hiện phong độ liên tục ổn định',
    unlockCondition: 'Tham gia ≥ 7 trận liên tiếp không bỏ lỡ',
    icon: Flame,
    colorClass: 'text-red-500',
    glowClass: 'shadow-red-400/40',
    check: (u) => u.badges.includes('Hot Streak'),
    progressHint: () => 30,
  },
  // ── LEGEND ────────────────────────────────────────────────────────────────
  {
    id: 'legend',
    name: 'Legend',
    description: 'Huyền thoại Matchill — người truyền cảm hứng',
    unlockCondition: 'Điểm danh tiếng ≥ 900 và tham gia ≥ 100 trận',
    icon: Crown,
    colorClass: 'text-yellow-400',
    glowClass: 'shadow-yellow-300/50',
    check: (u) => u.reputation.score >= 900 && (u.totalGames ?? 0) >= 100,
    progressHint: (u) => {
      const scorePct = Math.min(50, Math.round((u.reputation.score / 900) * 50));
      const gamePct = Math.min(50, Math.round(((u.totalGames ?? 0) / 100) * 50));
      return scorePct + gamePct;
    },
  },
  // ── RIVAL SLAYER ─────────────────────────────────────────────────────────
  {
    id: 'rival_slayer',
    name: 'Rival Slayer',
    description: 'Thách đấu và chinh phục các đối thủ mạnh hơn',
    unlockCondition: 'Thắng 5 trận với đối thủ skill cao hơn mình',
    icon: Swords,
    colorClass: 'text-fuchsia-500',
    glowClass: 'shadow-fuchsia-400/40',
    check: (u) => u.badges.includes('Rival Slayer'),
    progressHint: () => 20,
  },
];

// ─── COMPUTE UNLOCKED BADGES ─────────────────────────────────────────────────

export function computeUnlockedBadgeIds(
  user: User & { totalGames?: number; teamRequestsCreated?: number }
): string[] {
  return ALL_BADGES.filter((b) => b.check(user)).map((b) => b.id);
}

export function getBadgeProgress(
  user: User & { totalGames?: number; teamRequestsCreated?: number }
) {
  return ALL_BADGES.map((badge) => ({
    ...badge,
    unlocked: badge.check(user),
    progress: badge.progressHint?.(user) ?? 0,
  }));
}
