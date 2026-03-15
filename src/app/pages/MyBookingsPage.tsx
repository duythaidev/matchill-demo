import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import {
  CalendarDays,
  MapPin,
  Clock,
  QrCode,
  Star,
  X,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useBookingStore, Booking } from '../stores/bookingStore';
import toast from 'react-hot-toast';

function StatusBadge({ status }: { status: Booking['status'] }) {
  const config = {
    upcoming: {
      label: 'Sắp tới',
      icon: AlertCircle,
      cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    },
    past: {
      label: 'Đã qua',
      icon: CheckCircle2,
      cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    },
    cancelled: {
      label: 'Đã hủy',
      icon: XCircle,
      cls: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    },
  };
  const { label, icon: Icon, cls } = config[status];
  return (
    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${cls}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function QRModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3>E-Ticket</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-center mb-4">
          <p className="font-medium">{booking.venueName}</p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(booking.start), 'HH:mm')} –{' '}
            {format(new Date(booking.end), 'HH:mm')} ·{' '}
            {format(new Date(booking.start), 'dd/MM/yyyy')}
          </p>
        </div>
        <div className="flex justify-center mb-4">
          <div className="bg-white dark:bg-white rounded-xl p-4">
            <QRCodeSVG
              value={booking.qrCode || booking.bookingId}
              size={160}
              level="H"
              fgColor="#0d9488"
            />
          </div>
        </div>
        <p className="text-center text-xs font-mono text-muted-foreground mb-4">
          {booking.qrCode || booking.bookingId}
        </p>
        <Button
          className="w-full gap-2"
          variant="outline"
          onClick={() => toast.success('QR ticket đã được tải!')}
        >
          <Download className="w-4 h-4" />
          Tải xuống
        </Button>
      </motion.div>
    </motion.div>
  );
}

function BookingCard({ booking, index }: { booking: Booking; index: number }) {
  const [showQR, setShowQR] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="flex gap-4 p-4">
          <img
            src={booking.venueImage}
            alt={booking.venueName}
            className="w-20 h-20 rounded-xl object-cover shrink-0"
          />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium line-clamp-1">{booking.venueName}</p>
              <StatusBadge status={booking.status} />
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-1">{booking.venueAddress}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>
                {format(new Date(booking.start), 'HH:mm')} –{' '}
                {format(new Date(booking.end), 'HH:mm')} ·{' '}
                {format(new Date(booking.start), 'dd/MM/yyyy')}
              </span>
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                {booking.totalAmount.toLocaleString('vi-VN')}₫
              </span>
              <div className="flex gap-2">
                {booking.status === 'upcoming' && booking.qrCode && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={() => setShowQR(true)}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    QR
                  </Button>
                )}
                {booking.status === 'past' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={() => toast.success('Cảm ơn đánh giá của bạn!')}
                  >
                    <Star className="w-3.5 h-3.5" />
                    Đánh giá
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showQR && <QRModal booking={booking} onClose={() => setShowQR(false)} />}
      </AnimatePresence>
    </>
  );
}

export function MyBookingsPage() {
  const { myBookings } = useBookingStore();

  const upcoming = myBookings.filter((b) => b.status === 'upcoming');
  const past = myBookings.filter((b) => b.status === 'past');
  const cancelled = myBookings.filter((b) => b.status === 'cancelled');

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-teal-600" />
          Lịch đặt sân của tôi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {myBookings.length} booking
        </p>
      </motion.div>

      <Tabs defaultValue="upcoming">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="upcoming" className="text-sm">
            Sắp tới ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="text-sm">
            Đã qua ({past.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="text-sm">
            Đã hủy ({cancelled.length})
          </TabsTrigger>
        </TabsList>

        {[
          { key: 'upcoming', list: upcoming },
          { key: 'past', list: past },
          { key: 'cancelled', list: cancelled },
        ].map(({ key, list }) => (
          <TabsContent key={key} value={key} className="space-y-3">
            {list.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Chưa có booking nào</p>
                {key === 'upcoming' && (
                  <Button
                    className="mt-4 bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={() => window.location.assign('/venues')}
                  >
                    Đặt sân ngay
                  </Button>
                )}
              </div>
            ) : (
              list.map((booking, i) => (
                <BookingCard key={booking.bookingId} booking={booking} index={i} />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
