import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import type { BadgeDefinition } from '../lib/badgeSystem';

interface AchievementBadgeProps {
  badge: BadgeDefinition & { unlocked: boolean; progress: number };
  index?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadge({ badge, index = 0, size = 'md' }: AchievementBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { icon: Icon, unlocked, colorClass, glowClass, progress } = badge;

  const sizeMap = {
    sm: { card: 'p-2.5', icon: 'w-5 h-5', name: 'text-xs' },
    md: { card: 'p-3',   icon: 'w-6 h-6', name: 'text-xs' },
    lg: { card: 'p-4',   icon: 'w-8 h-8', name: 'text-sm' },
  };
  const s = sizeMap[size];

  return (
    <div className="relative" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.04, type: 'spring', damping: 14, stiffness: 200 }}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex flex-col items-center gap-1.5 rounded-2xl border-2 cursor-pointer select-none transition-all ${s.card}
          ${unlocked
            ? `bg-white dark:bg-slate-800 border-current/20 shadow-lg ${glowClass} shadow-md`
            : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 grayscale opacity-50'
          }`}
      >
        {/* Glow ring for unlocked */}
        {unlocked && (
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute inset-0 rounded-2xl blur-sm -z-10 opacity-30 bg-current ${colorClass}`}
          />
        )}

        {/* Icon */}
        <div className={`relative ${unlocked ? colorClass : 'text-slate-400'}`}>
          <Icon className={s.icon} strokeWidth={unlocked ? 2 : 1.5} />
          {unlocked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.04 + 0.3, type: 'spring' }}
              className="absolute -top-1 -right-1"
            >
              <CheckCircle2 className="w-3 h-3 text-teal-500 fill-white dark:fill-slate-800" />
            </motion.div>
          )}
          {!unlocked && <Lock className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 text-slate-400" />}
        </div>

        {/* Name */}
        <span className={`text-center leading-tight font-semibold ${s.name} ${unlocked ? 'text-foreground' : 'text-slate-400'}`}>
          {badge.name}
        </span>

        {/* Progress bar for locked */}
        {!unlocked && progress > 0 && (
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ delay: index * 0.04 + 0.2, duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-teal-400 rounded-full"
            />
          </div>
        )}
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-52 pointer-events-none"
          >
            <div className="bg-popover text-popover-foreground border border-border shadow-xl rounded-xl p-3 text-xs text-center">
              <div className={`font-bold mb-1 ${unlocked ? colorClass : 'text-foreground'}`}>
                {badge.name}
                {unlocked && ' ✓'}
              </div>
              <p className="text-muted-foreground leading-snug mb-1.5">{badge.description}</p>
              <div className={`text-xs px-2 py-1 rounded-lg font-medium ${
                unlocked
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
              }`}>
                {unlocked ? '🏆 Đã mở khóa!' : `🔒 Mở khóa: ${badge.unlockCondition}`}
              </div>
              {!unlocked && progress > 0 && (
                <div className="mt-1.5 text-xs text-muted-foreground">
                  Tiến độ: <span className="font-semibold text-teal-600">{Math.min(progress, 100)}%</span>
                </div>
              )}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ACHIEVEMENTS GRID ────────────────────────────────────────────────────────

interface AchievementsGridProps {
  badges: (BadgeDefinition & { unlocked: boolean; progress: number })[];
  size?: 'sm' | 'md' | 'lg';
  showHeader?: boolean;
}

export function AchievementsGrid({ badges, size = 'md', showHeader = true }: AchievementsGridProps) {
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalCount = badges.length;

  return (
    <div className="space-y-3">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold">Thành tựu</span>
            <motion.span
              key={unlockedCount}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
            >
              {unlockedCount}/{totalCount} đã mở khóa
            </motion.span>
          </div>
          {/* Progress bar total */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round((unlockedCount / totalCount) * 100)}%
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {badges.map((badge, i) => (
          <AchievementBadge key={badge.id} badge={badge} index={i} size={size} />
        ))}
      </div>
    </div>
  );
}
