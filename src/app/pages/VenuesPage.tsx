import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Search, Star, MapPin, Clock, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { useBookingStore, Venue } from '../stores/bookingStore';
import { venueApi } from '../api/matchVenueApi';

const SPORT_FILTERS = ['All', 'Badminton', 'Tennis', 'Pickleball', 'Football', 'Swimming'];
const TYPE_FILTERS = ['all', 'indoor', 'outdoor'];
const TYPE_LABELS: Record<string, string> = { all: '🌐 Tất cả', indoor: '🏠 Trong nhà', outdoor: '🌳 Ngoài trời' };
const SPORT_EMOJI: Record<string, string> = {
  Badminton: '🏸',
  Tennis: '🎾',
  Pickleball: '🏓',
  Football: '⚽',
  Swimming: '🏊',
};

function VenueCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <Skeleton className="w-full h-48" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex justify-between pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function StarRating({ value, count }: { value: number; count?: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i <= Math.round(value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {value.toFixed(1)}{count ? ` (${count})` : ''}
      </span>
    </div>
  );
}

function VenueCard({ venue, index }: { venue: Venue; index: number }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(13,148,136,0.12)' }}
      className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/venues/${venue.id}`)}
    >
      {/* Image */}
      <div className="relative overflow-hidden h-48">
        <img
          src={venue.images[0]}
          alt={venue.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {/* Badges on image */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge
            className={`text-xs border-0 ${
              venue.type === 'indoor'
                ? 'bg-blue-500/90 text-white'
                : 'bg-green-500/90 text-white'
            }`}
          >
            {venue.type === 'indoor' ? '🏠 Indoor' : '🌳 Outdoor'}
          </Badge>
        </div>
        {venue.isAvailableNow && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-emerald-500/90 text-white border-0 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Available
            </Badge>
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <span className="text-white text-sm font-medium">
            {SPORT_EMOJI[venue.sport] || '🏅'} {venue.sport}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2.5">
        <h3 className="group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
          {venue.name}
        </h3>
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="line-clamp-1">{venue.address}</span>
        </div>
        <StarRating value={venue.rating} count={venue.reviewCount} />

        {/* Amenities preview */}
        <div className="flex flex-wrap gap-1">
          {venue.amenities.slice(0, 3).map((a) => (
            <span
              key={a}
              className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
            >
              {a}
            </span>
          ))}
          {venue.amenities.length > 3 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
              +{venue.amenities.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-teal-600 dark:text-teal-400 font-semibold">
              {venue.pricePerHour.toLocaleString('vi-VN')}₫
            </span>
            <span className="text-muted-foreground text-sm">/giờ</span>
          </div>
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/booking/${venue.id}`);
            }}
          >
            Đặt sân
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function VenuesPage() {
  const [search, setSearch] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { venues, setVenues } = useBookingStore();

  useEffect(() => {
    const fetchVenues = async () => {
      setIsLoading(true);
      try {
        const data = await venueApi.getVenues();
        setVenues(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVenues();
  }, []);

  const filteredVenues = useMemo(() => {
    let list = [...venues];
    if (selectedSport !== 'All') {
      list = list.filter((v) => v.sport === selectedSport);
    }
    if (selectedType !== 'all') {
      list = list.filter((v) => v.type === selectedType);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.address.toLowerCase().includes(q) ||
          v.sport.toLowerCase().includes(q)
      );
    }
    return list;
  }, [venues, selectedSport, selectedType, search]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="mb-1">
          Sân thể thao{' '}
          <span className="text-teal-600 dark:text-teal-400">gần bạn</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          {filteredVenues.length} sân khả dụng
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Tìm sân theo tên, địa chỉ, môn thể thao..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setSearch('')}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 mb-3">
        {TYPE_FILTERS.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              selectedType === t
                ? 'bg-teal-600 text-white border-teal-600'
                : 'border-border text-muted-foreground hover:border-teal-400 bg-card'
            }`}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Sport Filter Chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {SPORT_FILTERS.map((sport) => (
          <button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              selectedSport === sport
                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                : 'border-border text-muted-foreground hover:border-teal-400 bg-card'
            }`}
          >
            {sport === 'All' ? '🌟 Tất cả' : `${SPORT_EMOJI[sport] || ''} ${sport}`}
          </button>
        ))}
      </div>

      {/* Venue Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <VenueCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredVenues.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-3">🏟️</p>
          <p>Không tìm thấy sân phù hợp.</p>
          <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVenues.map((venue, i) => (
            <VenueCard key={venue.id} venue={venue} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
