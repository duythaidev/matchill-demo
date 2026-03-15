import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Star,
  MapPin,
  Plus,
  SlidersHorizontal,
  X,
  Users,
  Clock,
  UserPlus,
  Swords,
  ChevronRight,
  Crown,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { useMatchStore, OpenTeam, MatchSuggestion } from '../stores/matchStore';
import { matchApi, MOCK_PLAYERS, MOCK_OPEN_TEAMS } from '../api/matchVenueApi';
import toast from 'react-hot-toast';

const SPORTS = ['All', 'Badminton', 'Tennis', 'Pickleball', 'Football', 'Table Tennis', 'Swimming'];
const DISTANCES = [5, 10, 20, 50];

const SPORT_EMOJI: Record<string, string> = {
  Badminton: '🏸',
  Tennis: '🎾',
  Pickleball: '🏓',
  Football: '⚽',
  'Table Tennis': '🏓',
  Swimming: '🏊',
};

const SKILL_LABELS: Record<number, string> = {
  1: 'Mới bắt đầu',
  2: 'Cơ bản',
  3: 'Trung bình',
  4: 'Khá giỏi',
  5: 'Chuyên nghiệp',
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return 'Hôm nay';
  if (d.toDateString() === tomorrow.toDateString()) return 'Ngày mai';
  return d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' });
}

function StarRating({ value, size = 'sm' }: { value: number; size?: 'sm' | 'xs' }) {
  const sz = size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sz} ${i <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/25'}`}
        />
      ))}
    </div>
  );
}

// ─── SKELETON CARDS ──────────────────────────────────────────────────────────

function TeamCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-11 h-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

function PlayerCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-9 w-full rounded-xl" />
    </div>
  );
}

// ─── MEMBER AVATARS ───────────────────────────────────────────────────────────

function MemberAvatarStack({
  members,
  slotsLeft,
  totalSlots,
}: {
  members: OpenTeam['members'];
  slotsLeft: number;
  totalSlots: number;
}) {
  const filled = totalSlots - slotsLeft;
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {members.map((m, i) => (
          <div key={m.userId} style={{ zIndex: members.length - i }} className="relative">
            <img
              src={m.avatar}
              alt={m.name}
              title={`${m.name} (${m.skill}★)`}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-card"
            />
            {i === 0 && (
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center">
                <Crown className="w-2 h-2 text-amber-900" />
              </div>
            )}
          </div>
        ))}
        {/* Empty slots */}
        {Array.from({ length: slotsLeft }).map((_, i) => (
          <div
            key={`empty-${i}`}
            style={{ zIndex: -i }}
            className="w-8 h-8 rounded-full ring-2 ring-card bg-secondary/60 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center"
          >
            <Plus className="w-3 h-3 text-muted-foreground/50" />
          </div>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {filled}/{totalSlots} thành viên
      </span>
    </div>
  );
}

// ─── TEAM CARD ────────────────────────────────────────────────────────────────

function TeamCard({ team, index }: { team: OpenTeam; index: number }) {
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleJoin = async () => {
    if (joined) return;
    setJoining(true);
    try {
      await matchApi.joinTeam(team.requestId);
      setJoined(true);
      const isFull = team.slotsLeft === 1;
      if (isFull) {
        toast.success('🎉 Team đã đầy! Group chat đã được tạo cho cả đội!', { duration: 4000 });
      } else {
        toast.success(`✅ Đã tham gia team của ${team.leaderName}!`);
      }
    } catch {
      toast.error('Có lỗi xảy ra. Thử lại nhé!');
    } finally {
      setJoining(false);
    }
  };

  const urgencyColor =
    team.slotsLeft === 1
      ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      : team.slotsLeft <= 2
      ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
      : 'bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(13,148,136,0.12)' }}
      className={`bg-card border rounded-2xl p-5 flex flex-col gap-4 cursor-default group transition-all ${
        joined ? 'border-teal-500 ring-1 ring-teal-500/30' : 'border-border'
      }`}
    >
      {/* Header: leader + sport badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={team.leaderAvatar}
              alt={team.leaderName}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-teal-500/20 group-hover:ring-teal-500/50 transition-all"
            />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
              <Crown className="w-3 h-3 text-amber-900" />
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{team.leaderName}</p>
            <p className="text-xs text-muted-foreground">Leader</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-sm">{SPORT_EMOJI[team.sport] || '🏅'}</span>
          <Badge
            variant="outline"
            className={`text-xs border ${urgencyColor}`}
          >
            Còn {team.slotsLeft} chỗ
          </Badge>
        </div>
      </div>

      {/* Time + Distance */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-teal-500" />
          <span className="font-medium text-foreground">{formatDate(team.timeStart)}</span>
          <span>{formatTime(team.timeStart)} – {formatTime(team.timeEnd)}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-teal-500" />
          <span>{team.distanceKm} km</span>
        </div>
      </div>

      {/* Skill avg */}
      <div className="flex items-center gap-2">
        <StarRating value={team.skillAvg} />
        <span className="text-xs text-muted-foreground">{SKILL_LABELS[team.skillAvg] || ''} (trung bình đội)</span>
      </div>

      {/* Description */}
      {team.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{team.description}</p>
      )}

      {/* Member avatars + slot bar */}
      <MemberAvatarStack
        members={team.members}
        slotsLeft={team.slotsLeft}
        totalSlots={team.totalSlots}
      />

      {/* Slot progress bar */}
      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((team.totalSlots - team.slotsLeft) / team.totalSlots) * 100}%` }}
          transition={{ delay: index * 0.07 + 0.3, duration: 0.6, ease: 'easeOut' }}
          className="h-full bg-teal-500 rounded-full"
        />
      </div>

      {/* Join button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleJoin}
        disabled={joining || joined}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
          joined
            ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400 border border-teal-500/40 cursor-default'
            : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/20'
        }`}
      >
        {joining ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Đang tham gia...
          </span>
        ) : joined ? (
          <>✅ Đã tham gia</>
        ) : (
          <>
            <Users className="w-4 h-4" />
            Tham gia Team
          </>
        )}
      </motion.button>
    </motion.div>
  );
}

// ─── PLAYER (TEAMMATE SUGGESTION) CARD ───────────────────────────────────────

function TeammateCard({ player, index }: { player: MatchSuggestion; index: number }) {
  const navigate = useNavigate();
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState(false);

  const handleInvite = async () => {
    if (invited) return;
    setInviting(true);
    try {
      await matchApi.inviteTeammate('my_team', player.userId);
      setInvited(true);
      toast.success(`📩 Đã gửi lời mời đến ${player.fullName}!`);
    } catch {
      toast.error('Lỗi khi gửi lời mời.');
    } finally {
      setInviting(false);
    }
  };

  const matchPct = player.matchScore;
  const matchColor =
    matchPct >= 90
      ? 'text-teal-600 dark:text-teal-400'
      : matchPct >= 80
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(13,148,136,0.12)' }}
      className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3 group"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="relative shrink-0 cursor-pointer"
          onClick={() => navigate(`/profile/${player.userId}`)}
        >
          <img
            src={player.avatar}
            alt={player.fullName}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-teal-500/20 group-hover:ring-teal-500/50 transition-all"
          />
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card flex items-center justify-center ${player.isAvailable ? 'bg-green-500' : 'bg-slate-400'}`}>
            {player.isAvailable
              ? <Wifi className="w-2.5 h-2.5 text-white" />
              : <WifiOff className="w-2.5 h-2.5 text-white" />
            }
          </div>
        </div>

        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => navigate(`/profile/${player.userId}`)}
        >
          <p className="truncate font-semibold text-sm">{player.fullName}</p>
          <StarRating value={player.skillLevel} />
          <p className="text-xs text-muted-foreground mt-0.5">{SKILL_LABELS[player.skillLevel]}</p>
        </div>

        {/* Match % ring */}
        <div className="shrink-0 flex flex-col items-center">
          <div className={`text-lg font-bold ${matchColor}`}>{matchPct}%</div>
          <div className="text-xs text-muted-foreground">match</div>
        </div>
      </div>

      {/* Sports */}
      <div className="flex flex-wrap gap-1">
        {player.sports.map((s) => (
          <span
            key={s}
            className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
          >
            {SPORT_EMOJI[s] || '🏅'} {s}
          </span>
        ))}
        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground flex items-center gap-1">
          <MapPin className="w-2.5 h-2.5" />
          {player.distanceKm} km
        </span>
      </div>

      {/* Bio */}
      {player.bio && (
        <p className="text-xs text-muted-foreground line-clamp-2">{player.bio}</p>
      )}

      {/* Mini score bars */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-secondary/50 rounded-lg p-2">
          <p className="text-muted-foreground mb-1">Sport</p>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div
                style={{ width: `${player.sportMatchScore}%` }}
                className="h-full bg-teal-500 rounded-full"
              />
            </div>
            <span className="font-semibold text-teal-600 dark:text-teal-400">{player.sportMatchScore}%</span>
          </div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-2">
          <p className="text-muted-foreground mb-1">Lịch</p>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div
                style={{ width: `${player.timeMatchScore}%` }}
                className="h-full bg-amber-400 rounded-full"
              />
            </div>
            <span className="font-semibold text-amber-600 dark:text-amber-400">{player.timeMatchScore}%</span>
          </div>
        </div>
      </div>

      {/* Action */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleInvite}
        disabled={inviting || invited || !player.isAvailable}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
          invited
            ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400 border border-teal-500/40 cursor-default'
            : !player.isAvailable
            ? 'bg-secondary text-muted-foreground cursor-not-allowed'
            : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/20'
        }`}
      >
        {inviting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Đang gửi...
          </span>
        ) : invited ? (
          <>✅ Đã mời</>
        ) : !player.isAvailable ? (
          <>Đang bận</>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            Mời vào Team
          </>
        )}
      </motion.button>
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export function DiscoverPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedDistance, setSelectedDistance] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const {
    allPlayers,
    openTeams,
    isLoading,
    hasMatchedFromRequest,
    activeTab,
    setAllPlayers,
    setOpenTeams,
    setLoading,
    setActiveTab,
  } = useMatchStore();

  // Switch to "suggested" tab after creating a team request
  useEffect(() => {
    if (hasMatchedFromRequest) {
      setActiveTab('suggested');
      toast.success('✅ Đây là danh sách đồng đội phù hợp với yêu cầu của bạn!', { duration: 3500 });
    }
  }, [hasMatchedFromRequest]);

  // Load data based on active tab
  useEffect(() => {
    const sport = selectedSport === 'All' ? undefined : selectedSport;
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'open-teams') {
          const teams = await matchApi.getOpenTeams({ sport, maxDistance: selectedDistance });
          setOpenTeams(teams);
        } else {
          const players = await matchApi.getAllPlayers({ sport, maxDistance: selectedDistance });
          setAllPlayers(players);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSport, selectedDistance, activeTab]);

  // Filtered open teams
  const filteredTeams = useMemo(() => {
    let list = [...(openTeams.length > 0 ? openTeams : MOCK_OPEN_TEAMS)];
    if (selectedSport !== 'All') {
      list = list.filter((t) => t.sport.toLowerCase() === selectedSport.toLowerCase());
    }
    list = list.filter((t) => t.distanceKm <= selectedDistance);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.leaderName.toLowerCase().includes(q) ||
          t.sport.toLowerCase().includes(q) ||
          (t.description?.toLowerCase().includes(q) ?? false)
      );
    }
    return list;
  }, [openTeams, selectedSport, selectedDistance, search]);

  // Filtered players
  const filteredPlayers = useMemo(() => {
    let list = [...(allPlayers.length > 0 ? allPlayers : MOCK_PLAYERS)];
    if (selectedSport !== 'All') {
      list = list.filter((p) =>
        p.sports.some((s) => s.toLowerCase() === selectedSport.toLowerCase())
      );
    }
    list = list.filter((p) => p.distanceKm <= selectedDistance);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.sports.some((s) => s.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => b.matchScore - a.matchScore);
  }, [allPlayers, selectedSport, selectedDistance, search]);

  const visibleTeams = filteredTeams.slice(0, page * PAGE_SIZE);
  const visiblePlayers = filteredPlayers.slice(0, page * PAGE_SIZE);
  const hasMore =
    activeTab === 'open-teams'
      ? visibleTeams.length < filteredTeams.length
      : visiblePlayers.length < filteredPlayers.length;

  const handleTabChange = (tab: 'open-teams' | 'suggested') => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm shadow-teal-600/30">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <h1>
            Ghép đội{' '}
            <span className="text-teal-600 dark:text-teal-400">thể thao</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-12">
          {activeTab === 'open-teams'
            ? `${filteredTeams.length} đội đang tìm thêm thành viên`
            : `${filteredPlayers.length} đồng đội tiềm năng gần bạn`}
        </p>
      </motion.div>

      {/* Search + Filter bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={
              activeTab === 'open-teams'
                ? 'Tìm đội theo tên, môn...'
                : 'Tìm đồng đội theo tên, môn...'
            }
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch('')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="icon"
          className={showFilters ? 'bg-teal-600 text-white hover:bg-teal-700' : ''}
          onClick={() => setShowFilters((f) => !f)}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <p className="text-sm text-muted-foreground">Khoảng cách tối đa</p>
              <div className="flex gap-2 flex-wrap">
                {DISTANCES.map((d) => (
                  <button
                    key={d}
                    onClick={() => { setSelectedDistance(d); setPage(1); }}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      selectedDistance === d
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'border-border text-muted-foreground hover:border-teal-500 hover:text-teal-600'
                    }`}
                  >
                    {d} km
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sport Chips */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {SPORTS.map((sport) => (
          <button
            key={sport}
            onClick={() => { setSelectedSport(sport); setPage(1); }}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              selectedSport === sport
                ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-500/20'
                : 'border-border text-muted-foreground hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400 bg-card'
            }`}
          >
            {sport === 'All' ? '🌟 Tất cả' : `${SPORT_EMOJI[sport] || ''} ${sport}`}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-secondary/60 p-1 rounded-xl mb-6 gap-1">
        <button
          onClick={() => handleTabChange('open-teams')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'open-teams'
              ? 'bg-card text-teal-600 dark:text-teal-400 shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" />
          Open Teams
          {filteredTeams.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === 'open-teams'
                ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
                : 'bg-muted text-muted-foreground'
            }`}>
              {filteredTeams.length}
            </span>
          )}
        </button>
        <button
          onClick={() => handleTabChange('suggested')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'suggested'
              ? 'bg-card text-teal-600 dark:text-teal-400 shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Gợi ý đồng đội
          {filteredPlayers.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === 'suggested'
                ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
                : 'bg-muted text-muted-foreground'
            }`}>
              {filteredPlayers.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {Array.from({ length: 6 }).map((_, i) =>
              activeTab === 'open-teams' ? (
                <TeamCardSkeleton key={i} />
              ) : (
                <PlayerCardSkeleton key={i} />
              )
            )}
          </motion.div>
        ) : activeTab === 'open-teams' ? (
          <motion.div
            key="teams"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
          >
            {filteredTeams.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-4xl mb-3">🏟️</p>
                <p className="font-medium">Không có đội nào đang tuyển thành viên.</p>
                <p className="text-sm mt-1">Thử thay đổi môn thể thao hoặc khoảng cách.</p>
                <Button
                  className="mt-4 bg-teal-600 hover:bg-teal-700 text-white gap-2"
                  onClick={() => navigate('/match-request/create')}
                >
                  <Plus className="w-4 h-4" /> Tạo Team Request
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleTeams.map((team, i) => (
                    <TeamCard key={team.requestId} team={team} index={i} />
                  ))}
                </div>
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Xem thêm ({filteredTeams.length - visibleTeams.length} đội)
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="players"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25 }}
          >
            {/* Invite tip banner */}
            <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-3 mb-4 flex items-start gap-2">
              <UserPlus className="w-4 h-4 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
              <p className="text-xs text-teal-700 dark:text-teal-300">
                Tạo Team Request trước, rồi mời đồng đội bên dưới để hệ thống tự tạo group chat khi đủ người!
              </p>
            </div>

            {filteredPlayers.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-4xl mb-3">🔍</p>
                <p>Không tìm thấy đồng đội nào phù hợp.</p>
                <p className="text-sm mt-1">Thử thay đổi môn thể thao hoặc khoảng cách.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visiblePlayers.map((player, i) => (
                    <TeammateCard key={player.userId} player={player} index={i} />
                  ))}
                </div>
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Xem thêm ({filteredPlayers.length - visiblePlayers.length} người)
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB – Create Team Request */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/match-request/create')}
        className="fixed bottom-6 right-6 z-40 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-5 py-3.5 flex items-center gap-2 shadow-2xl shadow-teal-600/40 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span className="font-semibold">Tạo Team</span>
      </motion.button>
    </div>
  );
}
