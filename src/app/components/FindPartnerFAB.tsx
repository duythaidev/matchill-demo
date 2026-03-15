import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Users, X, ChevronRight, Star, MapPin, Clock, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useFindPartnerStore } from '../stores/findPartnerStore';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const SPORTS = [
  { value: 'Badminton', emoji: '🏸' },
  { value: 'Tennis', emoji: '🎾' },
  { value: 'Pickleball', emoji: '🏓' },
  { value: 'Football', emoji: '⚽' },
  { value: 'Table Tennis', emoji: '🏓' },
  { value: 'Swimming', emoji: '🏊' },
];

// Pages where FAB should NOT appear (already have their own FABs or not relevant)
const HIDDEN_ON = ['/find-partner', '/login', '/register', '/chat/', '/rating/'];

function shouldShowFAB(pathname: string) {
  return !HIDDEN_ON.some((p) => pathname.startsWith(p)) && pathname !== '/';
}

export function FindPartnerFAB() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { showQuickModal, matchingStatus, setShowQuickModal, setRequest } = useFindPartnerStore();

  const [sport, setSport] = useState('Badminton');
  const [playersNeeded, setPlayersNeeded] = useState(2);
  const [radiusKm, setRadiusKm] = useState(10);
  const [skillMin, setSkillMin] = useState(1);
  const [skillMax, setSkillMax] = useState(5);
  const [timePreset, setTimePreset] = useState<'morning' | 'evening' | 'weekend'>('evening');
  const [starting, setStarting] = useState(false);
  const [fabTooltip, setFabTooltip] = useState(false);

  if (!isAuthenticated || !shouldShowFAB(location.pathname)) return null;

  const isSearching = matchingStatus === 'searching';

  const getTimeRange = () => {
    const now = new Date();
    const base = new Date();
    if (timePreset === 'morning') {
      base.setHours(7, 0, 0, 0);
      const end = new Date(base);
      end.setHours(9, 0, 0, 0);
      return { timeStart: base.toISOString(), timeEnd: end.toISOString() };
    } else if (timePreset === 'evening') {
      base.setHours(18, 0, 0, 0);
      const end = new Date(base);
      end.setHours(20, 0, 0, 0);
      return { timeStart: base.toISOString(), timeEnd: end.toISOString() };
    } else {
      // Weekend
      const day = base.getDay();
      const daysUntilSat = day === 6 ? 7 : (6 - day);
      base.setDate(base.getDate() + daysUntilSat);
      base.setHours(8, 0, 0, 0);
      const end = new Date(base);
      end.setHours(10, 0, 0, 0);
      return { timeStart: base.toISOString(), timeEnd: end.toISOString() };
    }
  };

  const handleStartSearch = () => {
    setStarting(true);
    const { timeStart, timeEnd } = getTimeRange();
    const request = {
      sport,
      location: { lat: 10.776, lng: 106.7009 },
      radiusKm,
      timeStart,
      timeEnd,
      skillMin,
      skillMax,
      playersNeeded,
    };
    setRequest(request);
    setShowQuickModal(false);
    setTimeout(() => {
      setStarting(false);
      navigate('/find-partner');
    }, 300);
  };

  const TIME_PRESETS = [
    { id: 'morning', label: 'Sáng sớm', sub: '7h–9h', emoji: '🌅' },
    { id: 'evening', label: 'Buổi tối', sub: '18h–20h', emoji: '🌆' },
    { id: 'weekend', label: 'Cuối tuần', sub: 'Thứ 7 8h', emoji: '🏖️' },
  ] as const;

  return (
    <>
      {/* FAB Button */}
      <AnimatePresence>
        {!showQuickModal && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 300 }}
            className="fixed bottom-6 left-6 z-50"
          >
            <div className="relative">
              {/* Tooltip */}
              <AnimatePresence>
                {fabTooltip && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap pointer-events-none"
                  >
                    {isSearching ? 'Đang tìm kiếm...' : 'Tìm đồng đội ngay'}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onHoverStart={() => setFabTooltip(true)}
                onHoverEnd={() => setFabTooltip(false)}
                onClick={() => {
                  if (isSearching) {
                    navigate('/find-partner');
                    return;
                  }
                  setShowQuickModal(true);
                }}
                className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-colors ${
                  isSearching
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/40'
                    : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/40'
                }`}
              >
                {isSearching ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Users className="w-6 h-6 text-white" />
                )}

                {/* Pulse ring when searching */}
                {isSearching && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-amber-400"
                    animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Config Modal */}
      <AnimatePresence>
        {showQuickModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={(e) => e.target === e.currentTarget && setShowQuickModal(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-border overflow-hidden"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm shadow-teal-600/30">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Tìm đồng đội</h3>
                    <p className="text-xs text-muted-foreground">Ghép đội nhanh theo yêu cầu</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuickModal(false)}
                  className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">

                {/* Sport Selector */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-1.5">
                    🎯 Môn thể thao
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {SPORTS.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setSport(s.value)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                          sport === s.value
                            ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                            : 'border-border hover:border-teal-400 text-muted-foreground'
                        }`}
                      >
                        <span className="text-base">{s.emoji}</span>
                        <span className="text-xs">{s.value}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Presets */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-teal-500" /> Thời gian
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_PRESETS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTimePreset(t.id)}
                        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all ${
                          timePreset === t.id
                            ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20'
                            : 'border-border hover:border-teal-400'
                        }`}
                      >
                        <span className="text-xl">{t.emoji}</span>
                        <span className="text-xs font-medium">{t.label}</span>
                        <span className="text-xs text-muted-foreground">{t.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Radius */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-teal-500" /> Bán kính:{' '}
                    <span className="text-teal-600 dark:text-teal-400">{radiusKm} km</span>
                  </p>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(+e.target.value)}
                    className="w-full accent-teal-600"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 km</span>
                    <span>50 km</span>
                  </div>
                </div>

                {/* Skill Range */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400" /> Trình độ:{' '}
                    <span className="text-teal-600 dark:text-teal-400">{skillMin}★–{skillMax}★</span>
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          if (n <= skillMax) setSkillMin(n);
                          if (n >= skillMin) setSkillMax(n);
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs border transition-all ${
                          n >= skillMin && n <= skillMax
                            ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-400 text-amber-700 dark:text-amber-300'
                            : 'border-border text-muted-foreground hover:border-amber-300'
                        }`}
                      >
                        {n}★
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Bấm để chọn khoảng trình độ</p>
                </div>

                {/* Players Needed */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-teal-500" /> Cần thêm người
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setPlayersNeeded((n) => Math.max(1, n - 1))}
                      disabled={playersNeeded <= 1}
                      className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-lg font-bold hover:border-teal-400 disabled:opacity-40 transition-colors"
                    >
                      –
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-3xl font-bold text-teal-600 dark:text-teal-400">{playersNeeded}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">người</p>
                    </div>
                    <button
                      onClick={() => setPlayersNeeded((n) => Math.min(7, n + 1))}
                      disabled={playersNeeded >= 7}
                      className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-lg font-bold hover:border-teal-400 disabled:opacity-40 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-border bg-card">
                <Button
                  size="lg"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-lg shadow-teal-600/20"
                  onClick={handleStartSearch}
                  disabled={starting}
                >
                  {starting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Đang khởi động...
                    </span>
                  ) : (
                    <>
                      <Users className="w-5 h-5" />
                      Bắt đầu tìm đồng đội
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-2.5">
                  Thường ghép xong trong dưới 15 giây ⚡
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
