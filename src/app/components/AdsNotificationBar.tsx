import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Megaphone, Upload, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

// ─── FORM SCHEMA ──────────────────────────────────────────────────────────────

const adsSchema = z.object({
  fullName: z.string().min(2, 'Vui lòng nhập họ và tên'),
  email: z.string().email('Email không hợp lệ'),
  content: z.string().min(10, 'Vui lòng mô tả nội dung quảng cáo (tối thiểu 10 ký tự)'),
});
type AdsFormData = z.infer<typeof adsSchema>;

// ─── ADS MODAL ────────────────────────────────────────────────────────────────

function AdsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AdsFormData>({
    resolver: zodResolver(adsSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (_data: AdsFormData) => {
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Đã gửi yêu cầu quảng cáo! Chúng tôi sẽ liên hệ lại sớm. 📢', { duration: 4000 });
    reset();
    setBannerFile(null);
    setBannerPreview(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="ads-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="ads-modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-500 to-teal-700 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-white">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Quảng cáo trên Matchill</p>
                    <p className="text-xs text-teal-100">Tiếp cận hàng nghìn người chơi thể thao</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label>Họ và tên <span className="text-destructive">*</span></Label>
                  <Input placeholder="Nguyễn Văn A" {...register('fullName')} />
                  {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label>Email liên hệ <span className="text-destructive">*</span></Label>
                  <Input type="email" placeholder="email@company.com" {...register('email')} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label>Nội dung quảng cáo <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="Mô tả sản phẩm/dịch vụ bạn muốn quảng cáo, đối tượng mục tiêu, ngân sách dự kiến..."
                    {...register('content')}
                  />
                  {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
                </div>

                {/* Banner upload */}
                <div className="space-y-1.5">
                  <Label>Upload banner <span className="text-xs text-muted-foreground">(tùy chọn)</span></Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative cursor-pointer border-2 border-dashed rounded-xl transition-all ${
                      bannerPreview
                        ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/10'
                        : 'border-border hover:border-teal-400 bg-muted/30 hover:bg-teal-50 dark:hover:bg-teal-900/10'
                    }`}
                  >
                    {bannerPreview ? (
                      <div className="relative">
                        <img src={bannerPreview} alt="Banner preview" className="w-full h-28 object-cover rounded-xl" />
                        <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-medium">Thay đổi ảnh</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 flex flex-col items-center justify-center gap-1.5">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          Click để upload banner (JPG, PNG, GIF)
                        </p>
                        <p className="text-xs text-muted-foreground/60">Tối đa 5MB</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  {bannerFile && (
                    <p className="text-xs text-teal-600 flex items-center gap-1">
                      ✓ {bannerFile.name}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2 h-11"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Chúng tôi sẽ phản hồi trong vòng 24h làm việc
                </p>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── ADS NOTIFICATION BAR ─────────────────────────────────────────────────────

export function AdsNotificationBar() {
  const [visible, setVisible] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden bg-teal-600"
          >
            <div className="flex items-center justify-between px-4 h-9 gap-2">
              <div className="flex-1 flex items-center justify-center">
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 text-white hover:text-teal-100 transition-colors text-xs sm:text-sm font-medium"
                >
                  <Megaphone className="w-4 h-4 shrink-0 animate-pulse" />
                  <span className="hidden sm:inline">
                    📢 Liên hệ quảng cáo – Click để gửi thông tin và tiếp cận cộng đồng Matchill!
                  </span>
                  <span className="sm:hidden">📢 Liên hệ quảng cáo với Matchill!</span>
                </button>
              </div>
              <button
                onClick={() => setVisible(false)}
                className="text-white/70 hover:text-white transition-colors shrink-0"
                aria-label="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdsModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
