import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Skeleton } from '../components/ui/skeleton';
import { ratingApi } from '../api/feedChatApi';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const RATING_TAGS = [
  { id: 'punctual', label: '⏰ Đúng giờ' },
  { id: 'friendly', label: '😊 Thân thiện' },
  { id: 'skilled', label: '🏆 Kỹ thuật tốt' },
  { id: 'fair', label: '🤝 Fair play' },
  { id: 'comeback', label: '🎉 Muốn tái đấu' },
  { id: 'team-player', label: '👥 Tinh thần đồng đội' },
];

const STAR_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Tệ', color: 'text-red-500' },
  2: { label: 'Không hài lòng', color: 'text-orange-400' },
  3: { label: 'Bình thường', color: 'text-amber-400' },
  4: { label: 'Tốt', color: 'text-teal-500' },
  5: { label: 'Xuất sắc!', color: 'text-teal-600' },
};

export function RatingPage() {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);

  const [activity, setActivity] = useState<{ type: string; targetName: string; targetAvatar: string; date: string } | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [newReputation, setNewReputation] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!activityId) return;
      setLoadingActivity(true);
      try {
        const info = await ratingApi.getActivityInfo(activityId);
        setActivity(info);
      } finally {
        setLoadingActivity(false);
      }
    };
    load();
  }, [activityId]);

  const toggleTag = (id: string) => {
    setSelectedTags((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Vui lòng chọn số sao!'); return; }
    if (!activityId) return;
    setSubmitting(true);
    try {
      const result = await ratingApi.submitRating({
        activityId,
        activityType: activity?.type === 'booking' ? 'booking' : 'match',
        targetId: activityId,
        rating,
        comment: comment.trim(),
        tags: selectedTags,
      });
      setNewReputation(result.newReputation);
      setDone(true);
      toast.success('⭐ Đánh giá đã được ghi nhận!');
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const activeRating = hovered || rating;

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1>Đánh giá hoạt động</h1>
          <p className="text-sm text-muted-foreground">Giúp cộng đồng bằng phản hồi của bạn</p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {done ? (
          /* ─── Success Screen ─── */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 space-y-5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto"
            >
              <CheckCircle2 className="w-10 h-10 text-teal-600 dark:text-teal-400" />
            </motion.div>
            <div>
              <h2 className="font-bold text-xl">Cảm ơn bạn!</h2>
              <p className="text-muted-foreground text-sm mt-1">Đánh giá của bạn đã được ghi nhận</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`w-7 h-7 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
              ))}
            </div>
            {newReputation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-2xl p-4"
              >
                <p className="text-sm text-muted-foreground">Điểm uy tín mới của {activity?.targetName}</p>
                <p className="text-3xl font-bold text-teal-600 dark:text-teal-400 mt-1">{newReputation} ⭐</p>
              </motion.div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                Quay lại
              </Button>
              <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white" onClick={() => navigate('/discover')}>
                Tìm team mới
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Activity Card */}
            <div className="bg-card border border-border rounded-2xl p-4">
              {loadingActivity ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="w-14 h-14 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-secondary shrink-0">
                    {activity?.targetAvatar ? (
                      <img src={activity.targetAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {activity?.type === 'booking' ? '🏟️' : '⚽'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{activity?.targetName}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {activity?.type === 'booking' ? '📋 Booking sân' : '🏃 Trận đấu'} · {activity?.date}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Star Rating */}
            <div className="bg-card border border-border rounded-2xl p-5 text-center space-y-4">
              <p className="font-semibold">Trải nghiệm của bạn như thế nào?</p>
              <div
                className="flex items-center justify-center gap-2"
                onMouseLeave={() => setHovered(0)}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setHovered(i)}
                    onClick={() => setRating(i)}
                    className="transition-transform"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        i <= activeRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/25'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              {activeRating > 0 && (
                <motion.p
                  key={activeRating}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`font-semibold text-lg ${STAR_LABELS[activeRating].color}`}
                >
                  {STAR_LABELS[activeRating].label}
                </motion.p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Điểm nổi bật (tùy chọn)</p>
              <div className="flex flex-wrap gap-2">
                {RATING_TAGS.map((tag) => (
                  <motion.button
                    key={tag.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      selectedTags.includes(tag.id)
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-600/20'
                        : 'border-border text-muted-foreground hover:border-teal-400'
                    }`}
                  >
                    {tag.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Nhận xét thêm (tùy chọn)</p>
              <Textarea
                placeholder="Chia sẻ trải nghiệm chi tiết hơn để giúp cộng đồng..."
                className="min-h-24 resize-none"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-right">{comment.length}/200</p>
            </div>

            {/* Submit */}
            <Button
              size="lg"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2"
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Đang gửi...
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Gửi đánh giá
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
