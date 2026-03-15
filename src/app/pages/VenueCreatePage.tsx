import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Loader2,
  Building2,
  MapPin,
  Image as ImageIcon,
  DollarSign,
  CheckSquare,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useBookingStore } from '../stores/bookingStore';
import { venueApi } from '../api/matchVenueApi';
import toast from 'react-hot-toast';

const SPORTS = ['Badminton', 'Tennis', 'Pickleball', 'Football', 'Table Tennis', 'Swimming'];
const AMENITIES = ['Parking', 'Shower', 'AC', 'Water', 'Locker', 'WC', 'Coach', 'Café', 'Wifi', 'Floodlight'];

const schema = z.object({
  name: z.string().min(3, 'Tên sân phải có ít nhất 3 ký tự'),
  address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  sport: z.string().min(1, 'Chọn môn thể thao'),
  type: z.enum(['indoor', 'outdoor']),
  pricePerHour: z.number().min(10000, 'Giá tối thiểu 10,000₫'),
  description: z.string().optional(),
  imageUrls: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function VenueCreatePage() {
  const navigate = useNavigate();
  const { addVenue } = useBookingStore();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'indoor',
      sport: '',
      pricePerHour: 100000,
    },
  });

  const toggleAmenity = (a: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const imageUrls = data.imageUrls
        ? data.imageUrls.split('\n').map((u) => u.trim()).filter(Boolean)
        : [
            'https://images.unsplash.com/photo-1771854400123-2a23cb720c04?w=800&fit=crop',
          ];

      const venue = await venueApi.createVenue({
        name: data.name,
        address: data.address,
        sport: data.sport,
        type: data.type,
        pricePerHour: data.pricePerHour,
        description: data.description,
        amenities: selectedAmenities,
        images: imageUrls,
      });

      addVenue(venue);
      toast.success('🎉 Tạo sân thành công!');
      navigate('/my-venues');
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <p className="text-sm text-muted-foreground">Điền thông tin sân thể thao</p>
        </div>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Basic Info */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            <p className="font-medium">Thông tin cơ bản</p>
          </div>

          <div>
            <Label className="mb-1.5 block text-sm">Tên sân *</Label>
            <Input placeholder="VD: Sky Court Badminton" {...register('name')} />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label className="flex items-center gap-1.5 mb-1.5 text-sm">
              <MapPin className="w-3.5 h-3.5" />
              Địa chỉ *
            </Label>
            <Input placeholder="VD: 123 Nguyen Trai, Quận 1, TP.HCM" {...register('address')} />
            {errors.address && <p className="text-destructive text-xs mt-1">{errors.address.message}</p>}
          </div>

          <div>
            <Label className="mb-1.5 block text-sm">Mô tả</Label>
            <Textarea
              placeholder="Mô tả về sân, tiện ích đặc biệt..."
              rows={3}
              {...register('description')}
            />
          </div>
        </div>

        {/* Sport + Type */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <p className="font-medium">Loại sân</p>

          <div>
            <Label className="mb-2 block text-sm">Môn thể thao *</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Controller
                name="sport"
                control={control}
                render={({ field }) => (
                  <>
                    {SPORTS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => field.onChange(s)}
                        className={`p-2 rounded-lg border text-sm transition-all text-left ${
                          field.value === s
                            ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                            : 'border-border text-muted-foreground hover:border-teal-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </>
                )}
              />
            </div>
            {errors.sport && <p className="text-destructive text-xs mt-1">{errors.sport.message}</p>}
          </div>

          <div>
            <Label className="mb-2 block text-sm">Hình thức sân *</Label>
            <div className="flex gap-3">
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <>
                    {[
                      { val: 'indoor', label: '🏠 Trong nhà' },
                      { val: 'outdoor', label: '🌳 Ngoài trời' },
                    ].map(({ val, label }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => field.onChange(val)}
                        className={`flex-1 py-2 rounded-lg border text-sm transition-all ${
                          field.value === val
                            ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                            : 'border-border text-muted-foreground hover:border-teal-400'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </>
                )}
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-teal-600" />
            <p className="font-medium">Tiện ích</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AMENITIES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`py-2 px-3 rounded-lg border text-sm transition-all text-left ${
                  selectedAmenities.includes(a)
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                    : 'border-border text-muted-foreground hover:border-teal-400'
                }`}
              >
                {selectedAmenities.includes(a) ? '✓ ' : ''}
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-teal-600" />
            <p className="font-medium">Giá thuê</p>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Giá / giờ (VNĐ) *</Label>
            <Input
              type="number"
              min={10000}
              step={10000}
              placeholder="100000"
              {...register('pricePerHour', { valueAsNumber: true })}
            />
            {errors.pricePerHour && (
              <p className="text-destructive text-xs mt-1">{errors.pricePerHour.message}</p>
            )}
          </div>
        </div>

        {/* Images */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-teal-600" />
            <p className="font-medium">Ảnh sân</p>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm text-muted-foreground">
              Nhập URL ảnh (mỗi URL một dòng)
            </Label>
            <Textarea
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              rows={4}
              {...register('imageUrls')}
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-2"
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
              Tạo sân
            </>
          )}
        </Button>
      </motion.form>
    </div>
  );
}
