import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import {
  ArrowLeft,
  Star,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Wifi,
  Car,
  Droplets,
  Wind,
  ShoppingBag,
  Users,
  Lock,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Venue, TimeSlot } from '../stores/bookingStore';
import { venueApi } from '../api/matchVenueApi';
import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  Parking: <Car className="w-4 h-4" />,
  Shower: <Droplets className="w-4 h-4" />,
  AC: <Wind className="w-4 h-4" />,
  Water: <Droplets className="w-4 h-4" />,
  Locker: <Lock className="w-4 h-4" />,
  WC: <Droplets className="w-4 h-4" />,
  Coach: <Users className="w-4 h-4" />,
  Café: <ShoppingBag className="w-4 h-4" />,
  Wifi: <Wifi className="w-4 h-4" />,
};

function SlotCell({ slot, onClick }: { slot: TimeSlot; onClick?: () => void }) {
  const hour = new Date(slot.start).getHours();
  const label = `${String(hour).padStart(2, '0')}:00`;

  const colors = {
    available:
      'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 cursor-pointer dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-400',
    booked:
      'bg-red-50 border-red-200 text-red-500 cursor-not-allowed dark:bg-red-900/20 dark:border-red-700 dark:text-red-400',
    pending:
      'bg-amber-50 border-amber-200 text-amber-600 cursor-not-allowed dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-400',
  };

  const statusLabel = { available: 'Trống', booked: 'Đã đặt', pending: 'Chờ xác nhận' };

  return (
    <motion.button
      whileHover={slot.status === 'available' ? { scale: 1.04 } : {}}
      whileTap={slot.status === 'available' ? { scale: 0.97 } : {}}
      disabled={slot.status !== 'available'}
      onClick={slot.status === 'available' ? onClick : undefined}
      className={`rounded-lg border p-2 text-xs flex flex-col items-center gap-0.5 transition-all ${colors[slot.status]}`}
    >
      <span className="font-semibold">{label}</span>
      <span className="opacity-75">{statusLabel[slot.status]}</span>
    </motion.button>
  );
}

export function VenueDetailPage() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  // Load venue
  useEffect(() => {
    if (!venueId) return;
    const fetch = async () => {
      setIsLoading(true);
      const data = await venueApi.getVenueById(venueId);
      setVenue(data);
      setIsLoading(false);
    };
    fetch();
  }, [venueId]);

  // Load availability
  useEffect(() => {
    if (!venueId) return;
    const fetch = async () => {
      setSlotsLoading(true);
      const data = await venueApi.getAvailability(venueId, selectedDate);
      setSlots(data);
      setSlotsLoading(false);
    };
    fetch();
  }, [venueId, selectedDate]);

  // Days selector (next 7 days)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i);
    return {
      iso: d.toISOString().split('T')[0],
      label: format(d, 'EEE', { locale: vi }),
      day: format(d, 'd'),
    };
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="w-full h-72 rounded-2xl mb-6" />
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-6" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <p className="text-muted-foreground">Không tìm thấy sân này.</p>
        <Button className="mt-4" onClick={() => navigate('/venues')}>
          Quay lại
        </Button>
      </div>
    );
  }

  const availableCount = slots.filter((s) => s.status === 'available').length;

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 mb-4"
        onClick={() => navigate('/venues')}
      >
        <ArrowLeft className="w-4 h-4" />
        Danh sách sân
      </Button>

      {/* Image Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden mb-6 bg-secondary"
      >
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {venue.images.map((img, i) => (
              <div key={i} className="relative flex-none w-full">
                <img src={img} alt={`${venue.name} ${i + 1}`} className="w-full h-72 object-cover" />
              </div>
            ))}
          </div>
        </div>
        {/* Prev / Next */}
        {venue.images.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {venue.images.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === selectedIndex ? 'bg-white w-4' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Venue Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h1 className="mb-1">{venue.name}</h1>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{venue.address}</span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-teal-600 dark:text-teal-400 font-semibold text-lg">
              {venue.pricePerHour.toLocaleString('vi-VN')}₫
            </p>
            <p className="text-muted-foreground text-sm">/giờ</p>
          </div>
        </div>

        {/* Rating + Type */}
        <div className="flex items-center flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i <= Math.round(venue.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground/30'
                }`}
              />
            ))}
            <span className="text-sm ml-1">
              {venue.rating} ({venue.reviewCount} đánh giá)
            </span>
          </div>
          <span
            className={`px-2 py-0.5 text-xs rounded-full border ${
              venue.type === 'indoor'
                ? 'border-blue-300 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                : 'border-green-300 text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
            }`}
          >
            {venue.type === 'indoor' ? '🏠 Trong nhà' : '🌳 Ngoài trời'}
          </span>
          {venue.isAvailableNow && (
            <span className="px-2 py-0.5 text-xs rounded-full border border-emerald-300 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Available now
            </span>
          )}
        </div>

        {/* Description */}
        {venue.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {venue.description}
          </p>
        )}

        {/* Amenities */}
        <div>
          <p className="text-sm font-medium mb-2">Tiện ích</p>
          <div className="flex flex-wrap gap-2">
            {venue.amenities.map((a) => (
              <div
                key={a}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground"
              >
                {AMENITY_ICONS[a] || <Star className="w-3.5 h-3.5" />}
                {a}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Availability Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-card border border-border rounded-2xl p-5 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-teal-600" />
          <h3>Lịch đặt sân</h3>
          <span className="ml-auto text-xs text-muted-foreground">
            {availableCount} slot trống hôm nay
          </span>
        </div>

        {/* Day Selector */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {days.map((d) => (
            <button
              key={d.iso}
              onClick={() => setSelectedDate(d.iso)}
              className={`shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border text-sm transition-all ${
                selectedDate === d.iso
                  ? 'border-teal-600 bg-teal-600 text-white'
                  : 'border-border hover:border-teal-400 text-muted-foreground'
              }`}
            >
              <span className="text-xs opacity-75">{d.label}</span>
              <span className="font-semibold">{d.day}</span>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-700" />
            Trống
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-200 dark:bg-amber-700" />
            Chờ xác nhận
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-200 dark:bg-red-700" />
            Đã đặt
          </div>
        </div>

        {/* Slots Grid */}
        {slotsLoading ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {slots.map((slot, i) => (
              <SlotCell
                key={i}
                slot={slot}
                onClick={() => navigate(`/booking/${venueId}?date=${selectedDate}&slot=${new Date(slot.start).getHours()}`)}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Book CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          size="lg"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-500/20 gap-2"
          onClick={() => navigate(`/booking/${venueId}`)}
        >
          📅 Đặt sân ngay
        </Button>
      </motion.div>
    </div>
  );
}
