import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Users, RefreshCw, Settings2, CheckCircle2, Wifi, Star, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useFindPartnerStore, MatchedMember } from '../stores/findPartnerStore';
import { findPartnerApi } from '../api/findPartnerApi';
import { MOCK_CHATS } from '../api/feedChatApi';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const SPORT_EMOJI: Record<string, string> = {
  Badminton: '🏸', Tennis: '🎾', Pickleball: '🏓', Football: '⚽',
  'Table Tennis': '🏓', Swimming: '🏊',
};

const SEARCH_MESSAGES = [
  'Đang phân tích skill level của bạn...',
  'Tìm kiếm người chơi trong bán kính...',
  'Kiểm tra lịch trống của các ứng viên...',
  'Đánh giá độ phù hợp về phong cách chơi...',
  'Cân nhắc khoảng cách di chuyển...',
  'Xếp hạng các ứng viên tốt nhất...',
  'Đang ghép đội cuối cùng...',
  'Gần xong rồi...',
];

// ─── MEMBER CARD (success screen) ────────────────────────────────────────────

function MatchedMemberCard({ member, index }: { member: MatchedMember; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.15, type: 'spring', damping: 18 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative">
        <img
          src={member.avatar}
          alt={member.name}
          className="w-16 h-16 rounded-full object-cover ring-2 ring-teal-500/40 ring-offset-2 ring-offset-background"
        />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
          <Wifi className="w-2.5 h-2.5 text-white" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold truncate max-w-20">
          {member.name.split(' ').slice(-2).join(' ')}
        </p>
        <div className="flex items-center justify-center gap-0.5 mt-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`w-2.5 h-2.5 ${i <= member.skillLevel ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{member.distanceKm} km</p>
      </div>
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export function FindPartnerPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { currentRequest, matchingStatus, matchedGroup, setMatchingStatus, setMatchedGroup, setShowQuickModal, reset } =
    useFindPartnerStore();
  const { setChats } = useChatStore();

  const [msgIndex, setMsgIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didSearch = useRef(false);

  // If no request → redirect to discover
  useEffect(() => {
    if (!currentRequest && matchingStatus === 'idle') {
      navigate('/discover', { replace: true });
    }
  }, []);

  // Rotate search messages
  useEffect(() => {
    if (matchingStatus !== 'searching') return;
    intervalRef.current = setInterval(() => {
      setMsgIndex((i) => (i + 1) % SEARCH_MESSAGES.length);
    }, 2000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [matchingStatus]);

  // Elapsed timer
  useEffect(() => {
    if (matchingStatus !== 'searching') return;
    elapsedRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current); };
  }, [matchingStatus]);

  // Run the search
  useEffect(() => {
    if (!currentRequest || didSearch.current) return;
    didSearch.current = true;

    const run = async () => {
      setMatchingStatus('searching');
      try {
        const result = await findPartnerApi.findPartner(currentRequest);

        if (result.status === 'matched') {
          // Build a new chat room entry to add to the chat list
          const newChat = {
            id: result.chatId,
            type: 'group' as const,
            name: `Team ${result.sport} ${new Date(result.timeStart).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}`,
            groupAvatar: SPORT_EMOJI[result.sport] || '🏅',
            participants: [
              {
                userId: 'me',
                name: currentUser?.fullName || 'Bạn',
                avatar: currentUser?.avatarUrl || '',
              },
              ...result.members.map((m) => ({ userId: m.userId, name: m.name, avatar: m.avatar })),
            ],
            lastMessage: {
              id: `sys_${Date.now()}`,
              senderId: 'system',
              senderName: 'Hệ thống',
              senderAvatar: '',
              text: `🎉 Team ghép thành công! Chào mừng ${result.members.length + 1} thành viên!`,
              createdAt: new Date().toISOString(),
              seenBy: [],
              type: 'system' as const,
            },
            unreadCount: 1,
          };

          // Add to mock chats list
          MOCK_CHATS.unshift(newChat);

          setMatchedGroup({
            groupId: result.groupId,
            chatId: result.chatId,
            status: 'matched',
            members: result.members,
            sport: result.sport,
            timeStart: result.timeStart,
          });
          setMatchingStatus('matched');

          toast.success('🎉 Đã tìm thấy teammate! Group chat đã tạo!', { duration: 4000 });
        } else {
          setMatchingStatus('not_found');
          toast.error('Chưa tìm thấy teammate phù hợp trong bán kính của bạn.');
        }
      } catch {
        setMatchingStatus('not_found');
        toast.error('Có lỗi xảy ra khi tìm kiếm.');
      }
    };

    run();
  }, [currentRequest]);

  const handleRetry = () => {
    didSearch.current = false;
    setElapsed(0);
    setMsgIndex(0);
    setMatchingStatus('idle');
    setMatchedGroup(null);
    // Restart search
    setTimeout(() => {
      if (currentRequest) {
        didSearch.current = false;
        // Re-trigger via re-mount trick
        window.location.reload();
      }
    }, 100);
  };

  const handleGoToChat = () => {
    if (matchedGroup) {
      navigate(`/chat/chat_private_1`);
    }
  };

  const handleEditRequest = () => {
    reset();
    setShowQuickModal(true);
    navigate('/discover');
  };

  const sport = currentRequest?.sport || '';
  const sportEmoji = SPORT_EMOJI[sport] || '🏅';

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-background to-teal-50/30 dark:from-teal-950/20 dark:via-background dark:to-teal-950/10 flex flex-col items-center justify-center px-4">

      <AnimatePresence mode="wait">

        {/* ─── SEARCHING ─────────────────────────────────────────── */}
        {matchingStatus === 'searching' && (
          <motion.div
            key="searching"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-8 max-w-sm w-full text-center"
          >
            {/* Pulsing orb */}
            <div className="relative flex items-center justify-center">
              {/* Outer rings */}
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border-2 border-teal-400/30"
                  animate={{ scale: [1, 1.5 + i * 0.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
                  style={{ width: 80 + i * 50, height: 80 + i * 50 }}
                />
              ))}

              {/* Center icon */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-xl shadow-teal-500/30 relative z-10"
              >
                <Users className="w-9 h-9 text-white" />
              </motion.div>

              {/* Sport emoji floating */}
              <motion.span
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-2 -right-2 text-2xl z-20"
              >
                {sportEmoji}
              </motion.span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold">Đang tìm teammate...</h2>
              <AnimatePresence mode="wait">
                <motion.p
                  key={msgIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-muted-foreground"
                >
                  {SEARCH_MESSAGES[msgIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div className="w-full space-y-2">
              <div className="w-full h-1.5 bg-teal-100 dark:bg-teal-900/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: '50%' }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                ⏱ {elapsed}s · Thường mất dưới 15 giây
              </p>
            </div>

            {/* Request summary card */}
            {currentRequest && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 text-left"
              >
                <p className="text-xs text-muted-foreground mb-3 font-medium">Yêu cầu của bạn</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{sportEmoji}</span>
                    <div>
                      <p className="text-xs text-muted-foreground">Môn</p>
                      <p className="font-medium">{currentRequest.sport}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Cần thêm</p>
                      <p className="font-medium">{currentRequest.playersNeeded} người</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Bán kính</p>
                      <p className="font-medium">{currentRequest.radiusKm} km</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-xs text-muted-foreground">Trình độ</p>
                      <p className="font-medium">{currentRequest.skillMin}★–{currentRequest.skillMax}★</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <button
              onClick={() => { reset(); navigate('/discover'); }}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors underline-offset-2 hover:underline"
            >
              Hủy tìm kiếm
            </button>
          </motion.div>
        )}

        {/* ─── MATCHED ─────────────────────────────────────────────── */}
        {matchingStatus === 'matched' && matchedGroup && (
          <motion.div
            key="matched"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            className="flex flex-col items-center gap-6 max-w-sm w-full text-center"
          >
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, delay: 0.1 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-2xl shadow-teal-500/40"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>

            {/* Confetti-like particles */}
            {['🎉', '✨', '🏆', '🔥', '💪'].map((emoji, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [-20, -80 - i * 20],
                  x: [(i - 2) * 30, (i - 2) * 50],
                  scale: [0, 1.2, 0],
                }}
                transition={{ delay: 0.2 + i * 0.1, duration: 1.5 }}
                className="absolute text-2xl pointer-events-none"
              >
                {emoji}
              </motion.span>
            ))}

            <div>
              <h2 className="text-2xl font-bold">Tìm thấy đồng đội!</h2>
              <p className="text-muted-foreground text-sm mt-1">
                {matchedGroup.members.length + 1} thành viên sẵn sàng · Group chat đã được tạo
              </p>
            </div>

            {/* Members row */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {/* Me */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="flex flex-col items-center gap-2"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center text-white text-xl font-bold ring-2 ring-teal-500/40 ring-offset-2 ring-offset-background">
                    {currentUser?.fullName?.charAt(0) || 'B'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-500 rounded-full border-2 border-background flex items-center justify-center">
                    <Star className="w-2.5 h-2.5 text-white fill-white" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold">Bạn</p>
                  <p className="text-xs text-teal-600 dark:text-teal-400">Leader</p>
                </div>
              </motion.div>

              {matchedGroup.members.map((m, i) => (
                <MatchedMemberCard key={m.userId} member={m} index={i} />
              ))}
            </div>

            {/* Match info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-2xl p-4"
            >
              <div className="flex items-center justify-center gap-3 text-sm">
                <span className="text-2xl">{sportEmoji}</span>
                <div className="text-left">
                  <p className="font-semibold">{matchedGroup.sport}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(matchedGroup.timeStart).toLocaleDateString('vi-VN', {
                      weekday: 'long', day: 'numeric', month: 'numeric',
                    })} · {new Date(matchedGroup.timeStart).toLocaleTimeString('vi-VN', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="w-full flex flex-col gap-3"
            >
              <Button
                size="lg"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-lg shadow-teal-600/30"
                onClick={handleGoToChat}
              >
                💬 Vào Group Chat ngay
              </Button>
              <Button variant="outline" className="w-full" onClick={() => { reset(); navigate('/discover'); }}>
                Quay về Discover
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* ─── NOT FOUND ──────────────────────────────────────────── */}
        {matchingStatus === 'not_found' && (
          <motion.div
            key="not_found"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 max-w-sm w-full text-center"
          >
            {/* Sad icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-5xl"
            >
              😔
            </motion.div>

            <div>
              <h2 className="text-xl font-bold">Chưa tìm thấy đồng đội</h2>
              <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                Hiện tại chưa có ai phù hợp trong bán kính {currentRequest?.radiusKm || 20} km của bạn.
                Thử mở rộng bán kính hoặc đổi thời gian nhé!
              </p>
            </div>

            {/* Suggestions */}
            <div className="w-full bg-card border border-border rounded-2xl p-4 space-y-3 text-left">
              <p className="text-sm font-semibold">Gợi ý để tìm được đồng đội:</p>
              {[
                { emoji: '📍', tip: 'Tăng bán kính tìm kiếm lên 30-50 km' },
                { emoji: '🕐', tip: 'Thử giờ khác (buổi sáng sớm hoặc tối)' },
                { emoji: '⭐', tip: 'Nới lỏng yêu cầu trình độ (1★ – 5★)' },
                { emoji: '🏟️', tip: 'Xem "Open Teams" trên Discover' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span>{s.emoji}</span>
                  <span className="text-muted-foreground">{s.tip}</span>
                </div>
              ))}
            </div>

            <div className="w-full flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2"
                onClick={handleRetry}
              >
                <RefreshCw className="w-4 h-4" />
                Thử lại ngay
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleEditRequest}
              >
                <Settings2 className="w-4 h-4" />
                Chỉnh sửa yêu cầu
              </Button>
              <button
                onClick={() => { reset(); navigate('/discover'); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Xem Open Teams trên Discover →
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
