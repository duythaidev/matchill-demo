import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import {
  ArrowLeft, Upload, X, ImageIcon, Tag, MapPin,
  CheckCircle2, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuthStore } from '../stores/authStore';
import { useMarketplaceStore, type ItemCategory, type ItemCondition, type ItemType } from '../stores/marketplaceStore';

// ─── SCHEMA ───────────────────────────────────────────────────────────────────

const postSchema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự').max(100),
  category: z.enum(['Vợt', 'Giày', 'Quần áo', 'Phụ kiện', 'Bóng', 'Túi', 'Khác']),
  type: z.enum(['sell', 'exchange']),
  price: z.string().optional(),
  condition: z.enum(['new', 'like_new', 'used']),
  description: z.string().min(20, 'Mô tả phải có ít nhất 20 ký tự').max(1000),
  location: z.string().min(3, 'Vui lòng nhập vị trí'),
});

type PostFormData = z.infer<typeof postSchema>;

const CATEGORIES: ItemCategory[] = ['Vợt', 'Giày', 'Quần áo', 'Phụ kiện', 'Bóng', 'Túi', 'Khác'];
const CATEGORY_ICONS: Record<string, string> = {
  'Vợt': '🏸', 'Giày': '👟', 'Quần áo': '👕', 'Phụ kiện': '🎯', Bóng: '⚽', Túi: '🎒', Khác: '📦',
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function MarketplacePostPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const addItem = useMarketplaceStore((s) => s.addItem);

  const [images, setImages] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExchange, setIsExchange] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: { type: 'sell', condition: 'like_new', category: 'Vợt' },
  });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newPreviews = Array.from(files).slice(0, 5 - images.length).map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...newPreviews].slice(0, 5));
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const onSubmit = async (data: PostFormData) => {
    if (!currentUser) return;
    await new Promise((r) => setTimeout(r, 800));

    addItem({
      id: `mp_${Date.now()}`,
      title: data.title,
      category: data.category,
      price: isExchange ? undefined : Number(data.price) * 1000,
      type: isExchange ? 'exchange' : 'sell',
      condition: data.condition,
      description: data.description,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1771854399722-240c2accbd0c?w=600&fit=crop'],
      location: data.location,
      distanceKm: parseFloat((Math.random() * 10 + 0.5).toFixed(1)),
      sellerId: currentUser.uid,
      sellerName: currentUser.fullName,
      sellerAvatar: currentUser.avatarUrl,
      sellerRating: currentUser.reputation.avgRating || 4.5,
      createdAt: new Date().toISOString(),
      views: 0,
      isSold: false,
    });

    setSubmitted(true);
    toast.success('🎉 Đăng tin thành công!', { duration: 3000 });
    setTimeout(() => navigate('/marketplace'), 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4 p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle2 className="w-10 h-10 text-teal-600" />
          </motion.div>
          <h2 className="text-xl font-bold">Đăng tin thành công!</h2>
          <p className="text-muted-foreground text-sm">Tin của bạn đã được đăng lên Marketplace.</p>
          <div className="flex gap-1 justify-center">
            {[0,1,2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                className="w-2 h-2 rounded-full bg-teal-500"
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/90 backdrop-blur border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate('/marketplace')} className="p-1.5 rounded-xl hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-base">Đăng tin mua bán</h1>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-6 pb-20">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* ── IMAGES ───────────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label>Ảnh sản phẩm <span className="text-muted-foreground text-xs">(tối đa 5 ảnh)</span></Label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files); }}
              className="space-y-2"
            >
              {/* Upload zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl cursor-pointer transition-all flex items-center justify-center h-28 ${
                  isDragOver
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                    : 'border-border hover:border-teal-400 bg-muted/20 hover:bg-teal-50 dark:hover:bg-teal-900/10'
                }`}
              >
                <div className="text-center space-y-1">
                  <Upload className="w-7 h-7 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground font-medium">
                    {isDragOver ? 'Thả ảnh vào đây' : 'Click hoặc kéo thả ảnh vào đây'}
                  </p>
                  <p className="text-xs text-muted-foreground/60">JPG, PNG, WEBP – Tối đa 10MB mỗi ảnh</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Preview grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {images.map((src, i) => (
                    <motion.div
                      key={src}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative aspect-square rounded-xl overflow-hidden group border border-border"
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      {i === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-0.5">
                          Ảnh chính
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full items-center justify-center hidden group-hover:flex"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                  {images.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-teal-400 flex items-center justify-center text-muted-foreground hover:text-teal-600 transition-colors"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── TITLE ────────────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label>Tiêu đề <span className="text-destructive">*</span></Label>
            <Input placeholder="Vd: Vợt Yonex Astrox 88D Pro còn 90%" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* ── CATEGORY ─────────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label>Danh mục <span className="text-destructive">*</span></Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Controller
                  key={cat}
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => field.onChange(cat)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                        field.value === cat
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'bg-card border-border hover:border-teal-400'
                      }`}
                    >
                      {CATEGORY_ICONS[cat]} {cat}
                    </motion.button>
                  )}
                />
              ))}
            </div>
            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>

          {/* ── TYPE + PRICE ─────────────────────────────────────────────────── */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsExchange(false)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-2 ${
                  !isExchange ? 'bg-teal-600 border-teal-600 text-white' : 'bg-background border-border hover:border-teal-400'
                }`}
              >
                <Tag className="w-4 h-4" /> Đăng bán
              </button>
              <button
                type="button"
                onClick={() => setIsExchange(true)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-2 ${
                  isExchange ? 'bg-purple-600 border-purple-600 text-white' : 'bg-background border-border hover:border-purple-400'
                }`}
              >
                <RefreshCw className="w-4 h-4" /> Trao đổi
              </button>
            </div>

            {!isExchange && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <Label>Giá (nghìn đồng) <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Vd: 2800 (= 2.800.000đ)"
                    className="pr-12"
                    {...register('price')}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">nghìn đ</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── CONDITION ────────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label>Tình trạng sản phẩm <span className="text-destructive">*</span></Label>
            <Controller
              name="condition"
              control={control}
              render={({ field }) => (
                <div className="flex gap-2">
                  {([
                    { v: 'new', label: '✨ Mới', color: 'green' },
                    { v: 'like_new', label: '👍 Như mới', color: 'blue' },
                    { v: 'used', label: '📦 Đã dùng', color: 'orange' },
                  ] as const).map(({ v, label }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => field.onChange(v)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        field.value === v
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'bg-card border-border hover:border-teal-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* ── DESCRIPTION ──────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label>Mô tả chi tiết <span className="text-destructive">*</span></Label>
            <Textarea
              placeholder="Mô tả tình trạng, lý do bán, thương hiệu, thông số kỹ thuật... Càng chi tiết càng tốt!"
              rows={5}
              {...register('description')}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          {/* ── LOCATION ─────────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600" /> Vị trí <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Vd: Thạch Hòa, Thạch Thất, Hà Nội"
              defaultValue={currentUser?.location.city || ''}
              {...register('location')}
            />
            {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
          </div>

          {/* ── SUBMIT ───────────────────────────────────────────────────────── */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white text-base font-semibold gap-2 rounded-2xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đăng tin...
                </>
              ) : (
                <>
                  <Tag className="w-5 h-5" />
                  Đăng tin ngay
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-3">
              Bằng cách đăng tin, bạn đồng ý với{' '}
              <span className="text-teal-600 cursor-pointer hover:underline">Điều khoản sử dụng</span> của Matchill
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
