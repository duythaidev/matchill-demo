import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Wallet,
  CheckCircle2,
  Download,
  Loader2,
  Info,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { useBookingStore } from '../stores/bookingStore';
import { venueApi, bookingApi } from '../api/matchVenueApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';

function SlotPicker({
  slots,
  selectedSlots,
  onToggle,
}: {
  slots: TimeSlot[];
  selectedSlots: TimeSlot[];
  onToggle: (slot: TimeSlot) => void;
}) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
      {slots.map((slot, i) => {
        const hour = new Date(slot.start).getHours();
        const isSelected = selectedSlots.some((s) => s.start === slot.start);
        const colors = {
          available: isSelected
            ? 'bg-teal-600 border-teal-600 text-white'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 cursor-pointer dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-300',
          booked: 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed dark:bg-red-900/10 dark:border-red-800',
          pending: 'bg-amber-50 border-amber-200 text-amber-500 cursor-not-allowed dark:bg-amber-900/10 dark:border-amber-800',
        };
        return (
          <motion.button
            key={i}
            whileHover={slot.status === 'available' ? { scale: 1.04 } : {}}
            whileTap={slot.status === 'available' ? { scale: 0.96 } : {}}
            disabled={slot.status !== 'available'}
            onClick={() => slot.status === 'available' && onToggle(slot)}
            className={`rounded-lg border p-2 text-xs flex flex-col items-center gap-0.5 transition-all ${colors[slot.status]}`}
          >
            <span className="font-semibold">{String(hour).padStart(2, '0')}:00</span>
            <span className="opacity-75">
              {slot.status === 'available' ? (isSelected ? '✓' : 'Trống') : slot.status === 'booked' ? 'Đã đặt' : 'Chờ'}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function SuccessScreen({
  booking,
  venueName,
  refundTimeLeft,
  onRefund,
  isRefunding
}: {
  booking: { qrCode: string; start: string; end: string; depositAmount: number; totalAmount: number; bookingId: string };
  venueName: string;
  refundTimeLeft: number;
  onRefund: () => void;
  isRefunding: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.1 }}
        className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4"
      >
        <CheckCircle2 className="w-9 h-9 text-emerald-500" />
      </motion.div>

      <h2 className="mb-1">Đặt sân thành công!</h2>
      <p className="text-muted-foreground text-sm mb-6">
        {venueName} · {format(new Date(booking.start), 'HH:mm')} – {format(new Date(booking.end), 'HH:mm')}{' '}
        · {format(new Date(booking.start), 'dd/MM/yyyy')}
      </p>

      {/* QR Code */}
      <div className="bg-white dark:bg-white rounded-2xl p-6 mb-6 shadow-lg shadow-black/5">
        <QRCodeSVG
          value={booking.qrCode}
          size={200}
          level="H"
          includeMargin={false}
          fgColor="#0d9488"
        />
        <p className="text-xs text-gray-500 mt-3 font-mono">{booking.qrCode}</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 w-full text-sm mb-6 space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Đặt cọc (30%)</span>
          <span className="font-medium">{booking.depositAmount.toLocaleString('vi-VN')}₫</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tổng tiền</span>
          <span className="font-semibold text-teal-600 dark:text-teal-400">{booking.totalAmount.toLocaleString('vi-VN')}₫</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Còn lại thanh toán tại sân</span>
          <span>{(booking.totalAmount - booking.depositAmount).toLocaleString('vi-VN')}₫</span>
        </div>
      </div>

      <div className="flex gap-3 w-full">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => {
            toast.success('QR ticket đã được lưu!');
          }}
        >
          <Download className="w-4 h-4" />
          Tải QR
        </Button>
        <Button
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white gap-2"
          onClick={() => window.location.assign('/my-bookings')}
        >
          <Calendar className="w-4 h-4" />
          Xem lịch đặt
        </Button>
      </div>

      {/* Refund Section */}
      {refundTimeLeft > 0 ? (
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Hoàn tiền trong {Math.floor(refundTimeLeft / 60)}:{(refundTimeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
            Bạn có thể yêu cầu hoàn tiền đặt cọc trong vòng 5 phút sau khi đặt sân thành công.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"
            onClick={onRefund}
            disabled={isRefunding}
          >
            {isRefunding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Đang xử lý...
              </>
            ) : (
              'Yêu cầu hoàn tiền'
            )}
          </Button>
        </div>
      ) : (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Quá thời hạn hoàn tiền
            </span>
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            Thời hạn hoàn tiền đã hết. Vui lòng liên hệ hỗ trợ nếu cần hỗ trợ.
          </p>
        </div>
      )}
    </motion.div>
  );
}

export function BookingPage() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get('date') || new Date().toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<null | {
    qrCode: string;
    start: string;
    end: string;
    depositAmount: number;
    totalAmount: number;
    bookingId: string;
  }>(null);
  const [refundTimeLeft, setRefundTimeLeft] = useState(300); // 5 minutes in seconds
  const [isRefunding, setIsRefunding] = useState(false);

  const { selectedSlots, toggleSlot, clearSlots, walletBalance, deductWallet, addBooking, requestRefund } =
    useBookingStore();

  const today = new Date().toISOString().split('T')[0];

  // Countdown for refund
  useEffect(() => {
    if (!completedBooking) return;
    const interval = setInterval(() => {
      setRefundTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [completedBooking]);

  const handleRefund = async () => {
    if (!completedBooking?.bookingId) return;

    setIsRefunding(true);
    try {
      await requestRefund(completedBooking.bookingId);
      toast.success('Yêu cầu hoàn tiền đã được gửi. Chúng tôi sẽ xử lý trong 24h.');
    } catch (error) {
      toast.error('Không thể gửi yêu cầu hoàn tiền. Vui lòng liên hệ hỗ trợ.');
    } finally {
      setIsRefunding(false);
    }
  };

  // Days picker
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().split('T')[0],
      label: format(d, 'EEE', { locale: vi }),
      day: format(d, 'd'),
    };
  });

  useEffect(() => {
    if (!venueId) return;
    const fetch = async () => {
      setIsLoading(true);
      const data = await venueApi.getVenueById(venueId);
      setVenue(data);
      setIsLoading(false);
    };
    fetch();
    clearSlots();
  }, [venueId]);

  useEffect(() => {
    if (!venueId) return;
    const fetch = async () => {
      const data = await venueApi.getAvailability(venueId, selectedDate);
      setSlots(data);
      clearSlots();
    };
    fetch();
  }, [venueId, selectedDate]);

  const totalHours = selectedSlots.length;
  const totalAmount = venue ? totalHours * venue.pricePerHour : 0;
  const depositAmount = Math.round(totalAmount * 0.3);
  const canAfford = walletBalance >= depositAmount;

  const handlePay = async () => {
    if (!venue || selectedSlots.length === 0) return;
    if (!canAfford) {
      toast.error('Số dư ví không đủ để đặt cọc!');
      return;
    }
    setIsPaying(true);
    try {
      const sorted = [...selectedSlots].sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      );
      const booking = await bookingApi.createBooking({
        venueId: venue.id,
        slots: sorted.map((s) => ({ start: s.start, end: s.end })),
        depositAmount,
        totalAmount,
      });
      addBooking(booking);
      setCompletedBooking({
        qrCode: booking.qrCode || `MATCHILL-${Date.now()}`,
        start: booking.start,
        end: booking.end,
        depositAmount,
        totalAmount,
        bookingId: booking.bookingId,
      });
      toast.success('🎉 Đặt sân thành công!');
    } catch {
      toast.error('Thanh toán thất bại, vui lòng thử lại!');
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-6" />
        <div className="grid grid-cols-4 gap-2 mb-6">
          {Array.from({ length: 16 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!venue) return null;

  if (completedBooking) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md">
        <SuccessScreen
          booking={completedBooking}
          venueName={venue.name}
          refundTimeLeft={refundTimeLeft}
          onRefund={handleRefund}
          isRefunding={isRefunding}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/venues/${venueId}`)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1>Đặt sân</h1>
          <p className="text-sm text-muted-foreground">{venue.name}</p>
        </div>
      </div>

      {/* Day Picker */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-teal-600" />
          <p className="text-sm font-medium">Chọn ngày</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => (
            <button
              key={d.iso}
              onClick={() => setSelectedDate(d.iso)}
              className={`shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border text-sm transition-all ${selectedDate === d.iso
                  ? 'border-teal-600 bg-teal-600 text-white'
                  : 'border-border hover:border-teal-400 text-muted-foreground'
                }`}
            >
              <span className="text-xs opacity-75">{d.label}</span>
              <span className="font-semibold">{d.day}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slot Picker */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-teal-600" />
          <p className="text-sm font-medium">Chọn khung giờ</p>
          <span className="text-xs text-muted-foreground ml-auto">
            {selectedSlots.length} giờ đã chọn
          </span>
        </div>
        {/* Legend */}
        <div className="flex gap-4 mb-3 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-teal-200 dark:bg-teal-700" />Đã chọn
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-700" />Trống
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-200 dark:bg-amber-700" />Đang chờ
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-200 dark:bg-red-700" />Đã đặt
          </div>
        </div>
        <SlotPicker slots={slots} selectedSlots={selectedSlots} onToggle={toggleSlot} />
      </div>

      {/* Summary */}
      <AnimatePresence>
        {selectedSlots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card border border-border rounded-2xl p-4 mb-5">
              <h3 className="mb-3 text-sm">Tóm tắt đặt sân</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sân</span>
                  <span className="font-medium">{venue.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày</span>
                  <span>{format(new Date(selectedDate), 'dd/MM/yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số giờ</span>
                  <span>{totalHours} giờ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giá/giờ</span>
                  <span>{venue.pricePerHour.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Tổng tiền</span>
                    <span className="text-teal-600 dark:text-teal-400">
                      {totalAmount.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Đặt cọc 30%</span>
                    <span>{depositAmount.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet + Pay */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="w-4 h-4 text-teal-600" />
          <p className="text-sm font-medium">Ví Matchill</p>
        </div>
        <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
          {walletBalance.toLocaleString('vi-VN')}₫
        </p>
        {selectedSlots.length > 0 && !canAfford && (
          <div className="mt-2 flex items-center gap-2 text-xs text-destructive">
            <Info className="w-3.5 h-3.5" />
            Số dư không đủ để đặt cọc ({depositAmount.toLocaleString('vi-VN')}₫)
          </div>
        )}
      </div>

      <Button
        size="lg"
        className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-2 disabled:opacity-50"
        disabled={selectedSlots.length === 0 || !canAfford || isPaying}
        onClick={handlePay}
      >
        {isPaying ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Đang thanh toán...
          </>
        ) : (
          <>
            <Wallet className="w-5 h-5" />
            {selectedSlots.length === 0
              ? 'Chọn khung giờ để tiếp tục'
              : `Thanh toán ${depositAmount.toLocaleString('vi-VN')}₫ (cọc 30%)`}
          </>
        )}
      </Button>
    </div>
  );
}
