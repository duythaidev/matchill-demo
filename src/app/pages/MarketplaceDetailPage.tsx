import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Star, MapPin, Eye, Share2, Heart, MessageCircle,
  ChevronLeft, ChevronRight, RefreshCw, ShoppingBag, X,
  Clock, Shield, CheckCircle2, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { useMarketplaceStore, type ItemCondition } from '../stores/marketplaceStore';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const CONDITION_LABELS: Record<ItemCondition, string> = {
  new: '✨ Mới',
  like_new: '👍 Như mới',
  used: '📦 Đã dùng',
};
const CONDITION_COLORS: Record<ItemCondition, string> = {
  new: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  like_new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  used: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

function formatPrice(p: number) {
  if (p >= 1_000_000) return `${(p / 1_000_000).toFixed(p % 1_000_000 === 0 ? 0 : 1).replace('.', ',')} triệu đồng`;
  return `${p.toLocaleString('vi-VN')} đồng`;
}

// ─── CONTACT MODAL ────────────────────────────────────────────────────────────

function ContactModal({
  open,
  onClose,
  sellerName,
  itemTitle,
  mode,
}: {
  open: boolean;
  onClose: () => void;
  sellerName: string;
  itemTitle: string;
  mode: 'buy' | 'exchange' | 'contact';
}) {
  const [msg, setMsg] = useState(
    mode === 'buy'
      ? `Xin chào ${sellerName}! Mình quan tâm đến "${itemTitle}". Bạn có thể cho mình biết thêm chi tiết không?`
      : mode === 'exchange'
      ? `Xin chào ${sellerName}! Mình muốn trao đổi "${itemTitle}" với sản phẩm của mình. Bạn có muốn xem không?`
      : `Xin chào ${sellerName}! Mình cần hỏi về "${itemTitle}".`
  );
  const [sending, setSending] = useState(false);

  const send = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 700));
    setSending(false);
    toast.success('Đã gửi tin nhắn đến người bán! 💬');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="contact-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            key="contact-modal"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-[201] sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4"
          >
            <div className="bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div>
                  <p className="font-bold text-sm">
                    {mode === 'buy' ? '🛒 Hỏi mua' : mode === 'exchange' ? '🔄 Đề nghị trao đổi' : '💬 Liên hệ người bán'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Gửi tin nhắn đến {sellerName}</p>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-5 pb-6 space-y-3">
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  rows={4}
                  className="w-full p-3 text-sm bg-muted/30 border border-border rounded-xl resize-none focus:ring-2 focus:ring-teal-400 outline-none"
                />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={onClose}>Hủy</Button>
                  <Button
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white gap-2"
                    onClick={send}
                    disabled={sending || !msg.trim()}
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <MessageCircle className="w-4 h-4" />
                    )}
                    {sending ? 'Đang gửi...' : 'Gửi tin nhắn'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export function MarketplaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const item = useMarketplaceStore((s) => s.items.find((i) => i.id === id));
  const [imgIdx, setImgIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [contactMode, setContactMode] = useState<'buy' | 'exchange' | 'contact' | null>(null);

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-14 h-14 text-muted-foreground/40" />
        <p className="font-bold text-lg">Không tìm thấy sản phẩm</p>
        <Button variant="outline" onClick={() => navigate('/marketplace')}>← Quay lại Marketplace</Button>
      </div>
    );
  }

  const prevImg = () => setImgIdx((i) => (i - 1 + item.images.length) % item.images.length);
  const nextImg = () => setImgIdx((i) => (i + 1) % item.images.length);

  const handleShare = async () => {
    try {
      await navigator.share({ title: item.title, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã copy link sản phẩm!');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-card/90 backdrop-blur border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/marketplace')} className="p-1.5 rounded-xl hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="p-1.5 rounded-xl hover:bg-secondary transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => { setLiked(!liked); toast(liked ? 'Đã bỏ yêu thích' : '❤️ Đã thêm vào yêu thích'); }}
              className={`p-1.5 rounded-xl transition-colors ${liked ? 'text-red-500' : 'hover:bg-secondary'}`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── LEFT: IMAGE CAROUSEL ─────────────────────────────────────── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
              <AnimatePresence mode="wait">
                <motion.img
                  key={imgIdx}
                  src={item.images[imgIdx]}
                  alt={item.title}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {item.images.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {item.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? 'bg-white scale-125' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${CONDITION_COLORS[item.condition]}`}>
                  {CONDITION_LABELS[item.condition]}
                </span>
                {item.type === 'exchange' && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    🔄 Trao đổi
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {item.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {item.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      i === imgIdx ? 'border-teal-500' : 'border-border opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{item.views} lượt xem</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(item.createdAt).toLocaleDateString('vi-VN')}
              </span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{item.location}</span>
            </div>
          </div>

          {/* ── RIGHT: INFO ──────────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Title + Price */}
            <div>
              <div className="flex items-start gap-2 flex-wrap mb-2">
                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                  {item.category}
                </span>
                {item.sport && (
                  <span className="text-xs bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-700">
                    {item.sport}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold leading-snug">{item.title}</h1>
              <div className="mt-3">
                {item.type === 'sell' && item.price ? (
                  <span className="text-2xl font-bold text-teal-600">{formatPrice(item.price)}</span>
                ) : (
                  <span className="text-xl font-bold text-purple-600 flex items-center gap-1.5">
                    <RefreshCw className="w-5 h-5" /> Muốn trao đổi
                  </span>
                )}
              </div>
            </div>

            {/* Seller card */}
            <div
              onClick={() => toast('Xem hồ sơ người bán')}
              className="flex items-center gap-3 p-3 bg-card border border-border rounded-2xl cursor-pointer hover:border-teal-300 transition-colors"
            >
              {item.sellerAvatar ? (
                <img src={item.sellerAvatar} alt={item.sellerName} className="w-11 h-11 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold shrink-0">
                  {item.sellerName[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{item.sellerName}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-yellow-500 flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-current" />{item.sellerRating}
                  </span>
                  <span className="flex items-center gap-0.5 text-xs text-green-600">
                    <CheckCircle2 className="w-3 h-3" /> Đã xác thực
                  </span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Xem hồ sơ →</span>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <p className="text-sm font-semibold">Mô tả sản phẩm</p>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{item.description}</p>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/30 rounded-xl">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{item.location}</span>
              {item.distanceKm && (
                <span className="ml-auto text-xs bg-card border border-border px-2 py-0.5 rounded-full shrink-0">
                  ~{item.distanceKm} km
                </span>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { icon: Shield, text: 'An toàn', sub: 'Giao dịch bảo đảm' },
                { icon: RefreshCw, text: 'Đổi trả', sub: 'Trong 24h nếu sai' },
                { icon: CheckCircle2, text: 'Xác thực', sub: 'Người dùng thật' },
              ].map(({ icon: Icon, text, sub }) => (
                <div key={text} className="p-2 bg-muted/20 rounded-xl">
                  <Icon className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold">{text}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY BOTTOM ACTIONS ─────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur border-t border-border">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setContactMode('contact')}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Liên hệ</span>
          </Button>

          {item.type === 'sell' ? (
            <Button
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white gap-2 h-11 rounded-xl"
              onClick={() => setContactMode('buy')}
            >
              <ShoppingBag className="w-4 h-4" />
              Mua ngay
            </Button>
          ) : (
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white gap-2 h-11 rounded-xl"
              onClick={() => setContactMode('exchange')}
            >
              <RefreshCw className="w-4 h-4" />
              Đề nghị trao đổi
            </Button>
          )}
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        open={contactMode !== null}
        onClose={() => setContactMode(null)}
        sellerName={item.sellerName}
        itemTitle={item.title}
        mode={contactMode ?? 'contact'}
      />
    </div>
  );
}
