import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  Plus, MapPin, X, Image as ImageIcon, Send, Flag, Link as LinkIcon,
  Newspaper,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { useFeedStore } from '../stores/feedStore';
import { feedApi, Post, PostComment } from '../api/feedChatApi';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const SPORTS = ['All', 'Badminton', 'Tennis', 'Pickleball', 'Football', 'Table Tennis', 'Swimming'];
const SPORT_EMOJI: Record<string, string> = {
  Badminton: '🏸', Tennis: '🎾', Pickleball: '🏓', Football: '⚽', 'Table Tennis': '🏓', Swimming: '🏊',
};

const SAMPLE_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1771854400123-2a23cb720c04?w=600&fit=crop', label: 'Cầu lông' },
  { url: 'https://images.unsplash.com/photo-1762423570069-6926efe1232a?w=600&fit=crop', label: 'Tennis' },
  { url: 'https://images.unsplash.com/photo-1652085155924-ae8b2c414c80?w=600&fit=crop', label: 'Bóng đá' },
  { url: 'https://images.unsplash.com/photo-1760599348992-ce335f8036c3?w=600&fit=crop', label: 'Thể thao' },
  { url: 'https://images.unsplash.com/photo-1730244548329-4ae2f4fcaa7c?w=600&fit=crop', label: 'Bơi lội' },
  { url: 'https://images.unsplash.com/photo-1761286753856-2f39b4413c1c?w=600&fit=crop', label: 'Pickleball' },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
}

// ─── IMAGE GRID ───────────────────────────────────────────────────────────────

function ImageGrid({ images }: { images: string[] }) {
  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="rounded-xl overflow-hidden">
        <img src={images[0]} alt="" className="w-full max-h-80 object-cover" />
      </div>
    );
  }
  if (images.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
        {images.map((img, i) => (
          <img key={i} src={img} alt="" className="w-full h-48 object-cover" />
        ))}
      </div>
    );
  }
  if (images.length === 3) {
    return (
      <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
        <img src={images[0]} alt="" className="w-full h-56 object-cover row-span-2" />
        <img src={images[1]} alt="" className="w-full h-[108px] object-cover" />
        <img src={images[2]} alt="" className="w-full h-[108px] object-cover" />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
      {images.slice(0, 4).map((img, i) => (
        <div key={i} className="relative">
          <img src={img} alt="" className="w-full h-36 object-cover" />
          {i === 3 && images.length > 4 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
              +{images.length - 4}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── CREATE POST MODAL ────────────────────────────────────────────────────────

function CreatePostModal({ onClose, onCreated }: { onClose: () => void; onCreated: (post: Post) => void }) {
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedSport, setSelectedSport] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const currentUser = useAuthStore((s) => s.currentUser);

  const handleSubmit = async () => {
    if (!content.trim()) { toast.error('Vui lòng nhập nội dung bài đăng!'); return; }
    setSubmitting(true);
    try {
      const post = await feedApi.createPost({
        content: content.trim(),
        images: selectedImages.length > 0 ? selectedImages : undefined,
        sport: selectedSport || undefined,
        location: location.trim() || undefined,
      });
      // Personalize with current user info
      if (currentUser) {
        post.authorName = currentUser.fullName;
        post.authorAvatar = currentUser.avatarUrl || 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=200&h=200&fit=crop';
      }
      toast.success('✅ Đã đăng bài!');
      onCreated(post);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const toggleImage = (url: string) => {
    setSelectedImages((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : prev.length < 4 ? [...prev, url] : prev
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-base">Tạo bài đăng</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {currentUser?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-medium text-sm">{currentUser?.fullName || 'Bạn'}</p>
              <p className="text-xs text-muted-foreground">Đăng lên cộng đồng</p>
            </div>
          </div>

          {/* Content */}
          <Textarea
            placeholder="Chia sẻ điều gì đó về thể thao... tìm đội, kết quả trận đấu, tips kỹ thuật..."
            className="min-h-28 resize-none border-0 bg-transparent p-0 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/60"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />

          {/* Sport Chips */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Tag môn thể thao (tùy chọn)</p>
            <div className="flex flex-wrap gap-1.5">
              {SPORTS.filter((s) => s !== 'All').map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSport(selectedSport === s ? '' : s)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                    selectedSport === s
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'border-border text-muted-foreground hover:border-teal-400'
                  }`}
                >
                  {SPORT_EMOJI[s]} {s}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Thêm địa điểm (tùy chọn)"
              className="pl-9 text-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Image Gallery */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              <ImageIcon className="inline w-3.5 h-3.5 mr-1" />
              Chọn ảnh (tối đa 4)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_IMAGES.map((img) => (
                <button
                  key={img.url}
                  onClick={() => toggleImage(img.url)}
                  className={`relative rounded-lg overflow-hidden aspect-square border-2 transition-all ${
                    selectedImages.includes(img.url) ? 'border-teal-500' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  {selectedImages.includes(img.url) && (
                    <div className="absolute inset-0 bg-teal-600/30 flex items-center justify-center">
                      <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {selectedImages.indexOf(img.url) + 1}
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-xs text-center py-0.5">{img.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="px-5 py-4 border-t border-border">
          <Button
            className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2"
            onClick={handleSubmit}
            disabled={submitting || !content.trim()}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Đang đăng...
              </span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Đăng bài
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── COMMENT SECTION ──────────────────────────────────────────────────────────

function CommentSection({ post, onAddComment }: { post: Post; onAddComment: (text: string) => void }) {
  const [text, setText] = useState('');
  const [showAll, setShowAll] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const visible = showAll ? post.comments : post.comments.slice(0, 2);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAddComment(text.trim());
    setText('');
  };

  return (
    <div className="mt-3 space-y-2">
      {post.comments.length > 2 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="text-xs text-muted-foreground hover:text-teal-600 transition-colors"
        >
          Xem tất cả {post.comments.length} bình luận
        </button>
      )}
      <AnimatePresence>
        {visible.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <img src={c.authorAvatar} alt={c.authorName} className="w-7 h-7 rounded-full object-cover shrink-0" />
            <div className="bg-secondary/50 rounded-2xl px-3 py-2 flex-1">
              <p className="text-xs font-semibold">{c.authorName}</p>
              <p className="text-xs text-foreground/90">{c.content}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {/* Input */}
      <div className="flex gap-2 items-center">
        <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs shrink-0">B</div>
        <div className="flex-1 flex gap-2">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Thêm bình luận..."
            className="flex-1 bg-secondary/50 rounded-full px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-teal-500 transition-all"
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="text-teal-600 disabled:text-muted-foreground transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── POST CARD ────────────────────────────────────────────────────────────────

function PostCard({ post, index }: { post: Post; index: number }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.likes.includes('me'));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [saved, setSaved] = useState(post.saves.includes('me'));
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [comments, setComments] = useState<PostComment[]>(post.comments);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toggleLike, toggleSave, addComment } = useFeedStore();

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => (next ? c + 1 : c - 1));
    toggleLike(post.id, 'me');
    await feedApi.likePost(post.id, 'me');
  };

  const handleSave = async () => {
    setSaved((s) => !s);
    toggleSave(post.id, 'me');
    await feedApi.savePost(post.id, 'me');
    toast.success(saved ? 'Đã bỏ lưu' : '🔖 Đã lưu bài');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`https://matchill.app/feed/${post.id}`).catch(() => {});
    toast.success('🔗 Đã sao chép link!');
  };

  const handleReport = () => {
    setMenuOpen(false);
    toast.success('🚩 Đã báo cáo bài đăng này');
  };

  const handleAddComment = async (text: string) => {
    const c = await feedApi.addComment(post.id, text);
    const updated = [...comments, c];
    setComments(updated);
    addComment(post.id, c);
    setShowComments(true);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(`/profile/${post.authorId}`)}
        >
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/20"
          />
          <div>
            <p className="font-semibold text-sm">{post.authorName}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{timeAgo(post.createdAt)}</span>
              {post.location && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />{post.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {post.sport && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {SPORT_EMOJI[post.sport]} {post.sport}
            </span>
          )}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  className="absolute right-0 top-8 w-40 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden"
                >
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-secondary transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" /> Copy link
                  </button>
                  <button
                    onClick={handleReport}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Flag className="w-4 h-4" /> Báo cáo
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm leading-relaxed whitespace-pre-line">{post.content}</p>
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="px-4 pb-3">
          <ImageGrid images={post.images} />
        </div>
      )}

      {/* Stats */}
      <div className="px-4 pb-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          {likeCount > 0 && (
            <>
              <span className="text-red-500">❤️</span>
              <span>{likeCount} lượt thích</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {comments.length > 0 && <span>{comments.length} bình luận</span>}
          {post.shareCount > 0 && <span>{post.shareCount} chia sẻ</span>}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-border" />

      {/* Actions */}
      <div className="grid grid-cols-4 divide-x divide-border">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all hover:bg-secondary/50 ${
            liked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">Thích</span>
        </button>
        {/* Comment */}
        <button
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Bình luận</span>
        </button>
        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Chia sẻ</span>
        </button>
        {/* Save */}
        <button
          onClick={handleSave}
          className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all hover:bg-secondary/50 ${
            saved ? 'text-teal-600 dark:text-teal-400' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">Lưu</span>
        </button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border pt-3">
              <CommentSection
                post={{ ...post, comments }}
                onAddComment={handleAddComment}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────

function PostSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export function FeedPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { posts, isLoading, selectedSport, setPosts, addPost, setLoading, setSelectedSport } = useFeedStore();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { posts: p } = await feedApi.getPosts({ sport: selectedSport });
        setPosts(p);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedSport]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm shadow-teal-600/30">
            <Newspaper className="w-5 h-5 text-white" />
          </div>
          <h1>Cộng đồng <span className="text-teal-600 dark:text-teal-400">thể thao</span></h1>
        </div>
        <p className="text-muted-foreground text-sm ml-12">{posts.length} bài đăng mới nhất</p>
      </motion.div>

      {/* Create Post Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => setShowCreateModal(true)}
        className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-3 mb-5 hover:border-teal-400 hover:shadow-sm transition-all text-left group"
      >
        <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm shrink-0">
          B
        </div>
        <span className="text-muted-foreground text-sm flex-1 group-hover:text-teal-600 transition-colors">
          Bạn muốn chia sẻ gì hôm nay?
        </span>
        <div className="flex items-center gap-1.5 text-teal-600">
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Đăng</span>
        </div>
      </motion.button>

      {/* Sport Filters */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {SPORTS.map((sport) => (
          <button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              selectedSport === sport
                ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-500/20'
                : 'border-border text-muted-foreground hover:border-teal-400 hover:text-teal-600 bg-card'
            }`}
          >
            {sport === 'All' ? '🌟 Tất cả' : `${SPORT_EMOJI[sport] || ''} ${sport}`}
          </button>
        ))}
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-3">📭</p>
          <p>Chưa có bài đăng nào cho môn này.</p>
          <Button className="mt-4 bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" /> Là người đầu tiên đăng!
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      )}

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 z-40 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-5 py-3.5 flex items-center gap-2 shadow-2xl shadow-teal-600/40 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span className="font-semibold">Đăng bài</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreatePostModal
            onClose={() => setShowCreateModal(false)}
            onCreated={(post) => addPost(post)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
