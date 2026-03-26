import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Plus, MapPin, Star, Building2, Settings, LayoutDashboard,
  Clock, TrendingUp, Pause, Play, Eye, CalendarCheck,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { useVenueManagementStore } from '../stores/venueManagementStore';

const AMENITY_ICONS: Record<string, string> = {
  Parking: '🅿️', Shower: '🚿', AC: '❄️', Water: '💧',
  Locker: '🔐', WC: '🚻', Coach: '👨‍🏫', Café: '☕',
  Wifi: '📶', Floodlight: '💡', 'Paddle Rental': '🏓',
};

const TODAY = '2026-03-26';

export function MyVenuesPage() {
  const navigate = useNavigate();
  const { managedVenues, isLoading, calendarSlots, bookingRequests } = useVenueManagementStore();

  const activeCount = managedVenues.filter((v) => v.status === 'active').length;
  const pausedCount = managedVenues.filter((v) => v.status === 'paused').length;
  const totalPending = bookingRequests.length;

  // Count today available slots for each venue
  const getTodayAvail = (venueId: string) => {
    const todaySlots = calendarSlots.filter(
      (s) => s.venueId === venueId && s.date === TODAY
    );
    return todaySlots.filter((s) => s.status === 'available').length;
  };

  const getVenuePending = (venueId: string) =>
    bookingRequests.filter((r) => r.venueId === venueId).length;

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-6 gap-4"
      >
        <div>
          <h1 className="flex items-center gap-2 mb-1">
            <Building2 className="w-6 h-6 text-blue-600" />
            Sân của tôi
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý và theo dõi các sân thể thao của bạn
          </p>
        </div>
        <Button
          className="bg-teal-600 hover:bg-teal-700 text-white gap-2 shrink-0"
          onClick={() => navigate('/venue/create')}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tạo sân mới</span>
          <span className="sm:hidden">Tạo mới</span>
        </Button>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
      >
        {[
          { label: 'Tổng sân', value: managedVenues.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Đang hoạt động', value: activeCount, icon: Play, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Tạm dừng', value: pausedCount, icon: Pause, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Chờ xác nhận', value: totalPending, icon: Clock, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Venue List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden p-4 flex gap-4">
              <Skeleton className="w-28 h-28 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-40" />
              </div>
            </div>
          ))}
        </div>
      ) : managedVenues.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-card border border-border rounded-2xl"
        >
          <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
          <h3 className="text-muted-foreground mb-2">Bạn chưa có sân nào</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            Tạo sân thể thao đầu tiên để bắt đầu nhận đặt chỗ và quản lý lịch
          </p>
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
            onClick={() => navigate('/venue/create')}
          >
            <Plus className="w-4 h-4" />
            Tạo sân đầu tiên
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {managedVenues.map((venue, i) => {
            const availToday = getTodayAvail(venue.id);
            const pendingCount = getVenuePending(venue.id);
            return (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`bg-card border rounded-2xl overflow-hidden transition-all hover:shadow-md ${
                  venue.status === 'paused'
                    ? 'border-border opacity-80'
                    : 'border-border hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <div className="flex gap-0">
                  {/* Image */}
                  <div className="relative w-28 sm:w-36 shrink-0">
                    <img
                      src={venue.images[0]}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                    />
                    {venue.status === 'paused' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-medium bg-black/60 px-2 py-1 rounded">
                          Tạm dừng
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 p-4 flex flex-col gap-2">
                    {/* Name + Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold line-clamp-1">{venue.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="line-clamp-1">{venue.address}</span>
                        </div>
                      </div>
                      <Badge
                        className={`text-xs border-0 shrink-0 ${
                          venue.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {venue.status === 'active' ? '🟢 Hoạt động' : '⏸ Tạm dừng'}
                      </Badge>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="font-medium">{venue.rating > 0 ? venue.rating.toFixed(1) : 'Mới'}</span>
                        {venue.reviewCount > 0 && (
                          <span className="text-muted-foreground">({venue.reviewCount})</span>
                        )}
                      </div>
                      <span className="text-muted-foreground">·</span>
                      <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>{availToday} slot trống hôm nay</span>
                      </div>
                      {pendingCount > 0 && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <div className="flex items-center gap-1 text-amber-600">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{pendingCount} chờ duyệt</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Price + Amenities */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {venue.pricePerHour.toLocaleString('vi-VN')}₫/giờ
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">
                        {venue.type === 'indoor' ? '🏠 Trong nhà' : '🌳 Ngoài trời'}
                      </span>
                    </div>

                    {/* Amenity chips */}
                    <div className="flex flex-wrap gap-1">
                      {venue.amenities.slice(0, 4).map((a) => (
                        <span
                          key={a}
                          className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded"
                        >
                          {AMENITY_ICONS[a] ?? '•'} {a}
                        </span>
                      ))}
                      {venue.amenities.length > 4 && (
                        <span className="text-xs text-muted-foreground px-1.5 py-0.5">
                          +{venue.amenities.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                        onClick={() => navigate(`/venue/dashboard/${venue.id}`)}
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Quản lý
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs gap-1.5"
                        onClick={() => navigate(`/venues/${venue.id}`)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Xem sân
                      </Button>
                      {pendingCount > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs gap-1.5 text-amber-600 border-amber-300 hover:bg-amber-50"
                          onClick={() => navigate(`/venue/dashboard/${venue.id}?tab=pending`)}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {pendingCount} chờ
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
