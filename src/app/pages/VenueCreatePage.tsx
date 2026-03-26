import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, Loader2, Building2, MapPin, Image as ImageIcon,
  DollarSign, CheckSquare, Layers,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useVenueManagementStore, type ManagedVenue } from '../stores/venueManagementStore';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const SPORTS = [
  { value: 'Badminton', icon: '🏸' },
  { value: 'Tennis', icon: '🎾' },
  { value: 'Pickleball', icon: '🏓' },
  { value: 'Football', icon: '⚽' },
  { value: 'Basketball', icon: '🏀' },
  { value: 'Swimming', icon: '🏊' },
];

const AMENITIES: { key: string; icon: string; label: string }[] = [
  { key: 'Parking', icon: '🅿️', label: 'Bãi đỗ xe' },
  { key: 'Shower', icon: '🚿', label: 'Phòng tắm' },
  { key: 'AC', icon: '❄️', label: 'Điều hòa' },
  { key: 'Water', icon: '💧', label: 'Nước uống' },
  { key: 'Locker', icon: '🔐', label: 'Tủ khóa' },
  { key: 'WC', icon: '🚻', label: 'WC' },
  { key: 'Coach', icon: '👨‍🏫', label: 'HLV' },
  { key: 'Café', icon: '☕', label: 'Café' },
  { key: 'Wifi', icon: '📶', label: 'WiFi' },
  { key: 'Floodlight', icon: '💡', label: 'Đèn sân' },
  { key: 'Paddle Rental', icon: '🏓', label: 'Thuê vợt' },
  { key: 'Roof', icon: '🏠', label: 'Mái che' },
];

const CITIES = [
  'Hà Nội',
];

const schema = z.object({
  name: z.string().min(3, 'Tên sân phải có ít nhất 3 ký tự'),
  address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  city: z.string().min(1, 'Chọn thành phố'),
  sport: z.string().min(1, 'Chọn môn thể thao'),
  type: z.enum(['indoor', 'outdoor']),
  pricePerHour: z.number().min(10000, 'Giá tối thiểu 10,000₫').max(2000000),
  description: z.string().optional(),
  imageUrls: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1771854400123-2a23cb720c04?w=800&fit=crop',
  'https://images.unsplash.com/photo-1760599348992-ce335f8036c3?w=800&fit=crop',
];

export function VenueCreatePage() {
  const navigate = useNavigate();
  const { addManagedVenue } = useVenueManagementStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(DEFAULT_IMAGES[0]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'indoor',
      sport: '',
      city: 'Hà Nội',
      pricePerHour: 100000,
    },
  });

  const watchedPrice = watch('pricePerHour');

  const toggleAmenity = (key: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800)); // simulate API

    const rawUrls = data.imageUrls
      ? data.imageUrls.split('\n').map((u) => u.trim()).filter(Boolean)
      : [];
    const images = rawUrls.length > 0 ? rawUrls : DEFAULT_IMAGES;

    const newVenue: ManagedVenue = {
      id: `v${Date.now()}`,
      name: data.name,
      address: data.address,
      city: data.city,
      images,
      amenities: selectedAmenities,
      pricePerHour: data.pricePerHour,
      rating: 0,
      reviewCount: 0,
      type: data.type,
      sport: data.sport,
      description: data.description ?? '',
      status: 'active',
      ownerId: currentUser?.uid ?? 'owner_1',
      totalDailySlots: 16,
      availableTodaySlots: 16,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    addManagedVenue(newVenue);
    setIsSubmitting(false);
    toast.success('🎉 Tạo sân thành công! Sân đã sẵn sàng nhận đặt chỗ.');
    navigate('/my-venues');
  };

  // Section wrapper
  const Section = ({
    icon: Icon,
    title,
    children,
  }: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 pb-1 border-b border-border">
        <Icon className="w-4 h-4 text-teal-600" />
        <p className="font-medium text-sm">{title}</p>
      </div>
      {children}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Button variant="ghost" size="icon" onClick={() => navigate('/my-venues')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1>Tạo sân mới</h1>
          <p className="text-sm text-muted-foreground">Điền đầy đủ thông tin để bắt đầu nhận đặt chỗ</p>
        </div>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* Basic Info */}
        <Section icon={Building2} title="Thông tin cơ bản">
          <div>
            <Label className="mb-1.5 block text-sm">Tên sân *</Label>
            <Input placeholder="VD: Sky Court Badminton" {...register('name')} />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5 text-sm">
                <MapPin className="w-3.5 h-3.5" /> Địa chỉ *
              </Label>
              <Input placeholder="VD: Thạch Hòa, Thạch Thất, Hà Nội" {...register('address')} />
              {errors.address && <p className="text-destructive text-xs mt-1">{errors.address.message}</p>}
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Thành phố *</Label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-sm">Mô tả ngắn</Label>
            <Textarea
              placeholder="Mô tả về sân, tiện ích đặc biệt, lưu ý cho người đặt..."
              rows={3}
              {...register('description')}
            />
          </div>
        </Section>

        {/* Sport + Type */}
        <Section icon={Layers} title="Loại sân">
          <div>
            <Label className="mb-2 block text-sm">Môn thể thao *</Label>
            <div className="grid grid-cols-3 gap-2">
              <Controller
                name="sport"
                control={control}
                render={({ field }) => (
                  <>
                    {SPORTS.map(({ value, icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={`p-2.5 rounded-xl border text-sm transition-all flex items-center gap-2 ${
                          field.value === value
                            ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                            : 'border-border text-muted-foreground hover:border-teal-400'
                        }`}
                      >
                        <span>{icon}</span>
                        <span className="text-xs">{value}</span>
                      </button>
                    ))}
                  </>
                )}
              />
            </div>
            {errors.sport && <p className="text-destructive text-xs mt-1">{errors.sport.message}</p>}
          </div>

          <div>
            <Label className="mb-2 block text-sm">Hình thức *</Label>
            <div className="flex gap-3">
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <>
                    {[
                      { val: 'indoor', label: '🏠 Trong nhà', desc: 'Có mái che' },
                      { val: 'outdoor', label: '🌳 Ngoài trời', desc: 'Sân hở' },
                    ].map(({ val, label, desc }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => field.onChange(val)}
                        className={`flex-1 py-3 px-3 rounded-xl border text-sm transition-all text-left ${
                          field.value === val
                            ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                            : 'border-border text-muted-foreground hover:border-teal-400'
                        }`}
                      >
                        <div className="font-medium">{label}</div>
                        <div className="text-xs mt-0.5 opacity-70">{desc}</div>
                      </button>
                    ))}
                  </>
                )}
              />
            </div>
          </div>
        </Section>

        {/* Amenities */}
        <Section icon={CheckSquare} title="Tiện ích sân">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AMENITIES.map(({ key, icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleAmenity(key)}
                className={`py-2.5 px-3 rounded-xl border text-sm transition-all flex items-center gap-2 ${
                  selectedAmenities.includes(key)
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                    : 'border-border text-muted-foreground hover:border-teal-400'
                }`}
              >
                <span>{icon}</span>
                <span className="text-xs">{label}</span>
                {selectedAmenities.includes(key) && (
                  <span className="ml-auto text-teal-600 text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
          {selectedAmenities.length > 0 && (
            <p className="text-xs text-teal-600 dark:text-teal-400">
              Đã chọn {selectedAmenities.length} tiện ích
            </p>
          )}
        </Section>

        {/* Price */}
        <Section icon={DollarSign} title="Giá thuê sân">
          <div>
            <Label className="mb-1.5 block text-sm">Giá / giờ (VNĐ) *</Label>
            <div className="relative">
              <Input
                type="number"
                min={10000}
                step={10000}
                placeholder="100000"
                className="pr-12"
                {...register('pricePerHour', { valueAsNumber: true })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₫/h</span>
            </div>
            {watchedPrice > 0 && (
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                ≈ {(watchedPrice || 0).toLocaleString('vi-VN')}₫ mỗi giờ
              </p>
            )}
            {errors.pricePerHour && (
              <p className="text-destructive text-xs mt-1">{errors.pricePerHour.message}</p>
            )}
          </div>
        </Section>

        {/* Images */}
        <Section icon={ImageIcon} title="Ảnh sân">
          {/* Preview */}
          <div className="relative rounded-xl overflow-hidden h-40 bg-secondary">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => setPreviewUrl(DEFAULT_IMAGES[0])}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className="absolute bottom-2 left-3 text-white text-xs">Preview</span>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm text-muted-foreground">
              Nhập URL ảnh (mỗi URL một dòng)
            </Label>
            <Textarea
              placeholder={DEFAULT_IMAGES.join('\n')}
              rows={3}
              {...register('imageUrls', {
                onChange: (e) => {
                  const first = e.target.value.split('\n')[0].trim();
                  if (first) setPreviewUrl(first);
                },
              })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Nếu để trống, ảnh mặc định sẽ được sử dụng
            </p>
          </div>
        </Section>

        {/* Map placeholder */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border mb-3">
            <MapPin className="w-4 h-4 text-teal-600" />
            <p className="font-medium text-sm">Vị trí trên bản đồ</p>
          </div>
          <div className="relative h-36 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10 rounded-xl border border-dashed border-teal-200 dark:border-teal-800 flex flex-col items-center justify-center gap-2">
            <MapPin className="w-8 h-8 text-teal-400" />
            <p className="text-sm text-muted-foreground">Tích hợp Google Maps</p>
            <p className="text-xs text-muted-foreground">Vị trí sẽ được xác định tự động từ địa chỉ</p>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-2 h-12"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang tạo sân...
            </>
          ) : (
            <>
              <Building2 className="w-5 h-5" />
              Tạo sân ngay
            </>
          )}
        </Button>
      </motion.form>
    </div>
  );
}
