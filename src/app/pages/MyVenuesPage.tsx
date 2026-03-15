import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Plus, MapPin, Star, Building2, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { useBookingStore } from '../stores/bookingStore';
import { venueApi } from '../api/matchVenueApi';

export function MyVenuesPage() {
  const navigate = useNavigate();
  const { myVenues, setMyVenues, isLoading, setLoading } = useBookingStore();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await venueApi.getMyVenues();
      setMyVenues(data);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-600" />
            Sân của tôi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý các sân thể thao bạn sở hữu
          </p>
        </div>
        <Button
          className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
          onClick={() => navigate('/venue/create')}
        >
          <Plus className="w-4 h-4" />
          Tạo sân mới
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden flex gap-4 p-4">
              <Skeleton className="w-24 h-24 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : myVenues.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
          <h3 className="text-muted-foreground mb-2">Bạn chưa có sân nào</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Tạo sân thể thao để bắt đầu nhận đặt chỗ
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
          {myVenues.map((venue, i) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:border-teal-400 transition-colors"
            >
              <div className="flex gap-4 p-4">
                <img
                  src={venue.images[0]}
                  alt={venue.name}
                  className="w-24 h-24 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium line-clamp-1">{venue.name}</p>
                    <Badge
                      className={`text-xs border-0 shrink-0 ${
                        venue.isAvailableNow
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {venue.isAvailableNow ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="line-clamp-1">{venue.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{venue.rating}</span>
                      {venue.reviewCount !== undefined && (
                        <span className="text-muted-foreground">({venue.reviewCount})</span>
                      )}
                    </div>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-teal-600 dark:text-teal-400 font-medium">
                      {venue.pricePerHour.toLocaleString('vi-VN')}₫/giờ
                    </span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-3 text-xs gap-1.5"
                      onClick={() => navigate('/venue/dashboard')}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Quản lý
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 px-3 text-xs bg-teal-600 hover:bg-teal-700 text-white"
                      onClick={() => navigate(`/venues/${venue.id}`)}
                    >
                      Xem sân
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
