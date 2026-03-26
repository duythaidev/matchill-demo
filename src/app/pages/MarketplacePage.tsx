import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, SlidersHorizontal, Plus, MapPin, Star, RefreshCw,
  Tag, Package, ChevronDown, X, Eye, ArrowUpDown,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useMarketplaceStore, type ItemCategory, type ItemCondition, type ItemType } from '../stores/marketplaceStore';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const CATEGORIES: ItemCategory[] = ['Vợt', 'Giày', 'Quần áo', 'Phụ kiện', 'Bóng', 'Túi', 'Khác'];
const CATEGORY_ICONS: Record<string, string> = {
  'Vợt': '🏸', 'Giày': '👟', 'Quần áo': '👕', 'Phụ kiện': '🎯', 'Bóng': '⚽', 'Túi': '🎒', 'Khác': '📦',
};
const CONDITION_LABELS: Record<ItemCondition, string> = {
  new: 'Mới',
  like_new: 'Như mới',
  used: 'Đã dùng',
};
const CONDITION_COLORS: Record<ItemCondition, string> = {
  new: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  like_new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  used: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

function formatPrice(p?: number) {
  if (!p) return null;
  if (p >= 1_000_000) return `${(p / 1_000_000).toFixed(p % 1_000_000 === 0 ? 0 : 1)}tr`;
  return `${(p / 1000).toFixed(0)}k`;
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────

function ItemSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="h-44 bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-5 bg-muted rounded w-1/3" />
        <div className="flex gap-2 mt-2">
          <div className="w-6 h-6 rounded-full bg-muted" />
          <div className="h-3 bg-muted rounded w-24 mt-1.5" />
        </div>
      </div>
    </div>
  );
}

// ─── ITEM CARD ────────────────────────────────────────────────────────────────

function ItemCard({ item, index }: { item: ReturnType<typeof useMarketplaceStore.getState>['items'][0]; index: number }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      onClick={() => navigate(`/marketplace/${item.id}`)}
      className="group cursor-pointer bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-700 transition-all"
    >
      {/* Image */}
      <div className="relative h-44 bg-muted overflow-hidden">
        <img
          src={item.images[0]}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CONDITION_COLORS[item.condition]}`}>
            {CONDITION_LABELS[item.condition]}
          </span>
          {item.type === 'exchange' && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              🔄 Trao đổi
            </span>
          )}
        </div>
        <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
          <Eye className="w-3 h-3" /> {item.views}
        </div>
        {/* Category tag */}
        <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
          {CATEGORY_ICONS[item.category]} {item.category}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <h3 className="text-sm font-semibold line-clamp-2 leading-snug group-hover:text-teal-600 transition-colors">
          {item.title}
        </h3>

        {/* Price */}
        <div className="flex items-center justify-between">
          {item.type === 'sell' && item.price ? (
            <span className="text-teal-600 font-bold text-base">{formatPrice(item.price)}đ</span>
          ) : (
            <span className="text-purple-600 font-bold text-sm">🔄 Trao đổi</span>
          )}
          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
            <MapPin className="w-3 h-3" />
            {item.distanceKm ? `${item.distanceKm}km` : item.location.split(',')[0]}
          </span>
        </div>

        {/* Seller */}
        <div className="flex items-center gap-2 pt-1 border-t border-border">
          {item.sellerAvatar ? (
            <img src={item.sellerAvatar} alt={item.sellerName} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">
              {item.sellerName[0]}
            </div>
          )}
          <span className="text-xs text-muted-foreground truncate flex-1">{item.sellerName}</span>
          <span className="text-xs text-yellow-500 flex items-center gap-0.5 shrink-0">
            <Star className="w-3 h-3 fill-current" />{item.sellerRating}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

export function MarketplacePage() {
  const navigate = useNavigate();
  const allItems = useMarketplaceStore((s) => s.items);

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<ItemCategory | ''>('');
  const [selectedType, setSelectedType] = useState<ItemType | ''>('');
  const [selectedCond, setSelectedCond] = useState<ItemCondition | ''>('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'distance'>('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Simulate initial load
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  // Filter + sort
  const filtered = allItems
    .filter((item) => {
      if (item.isSold) return false;
      if (search && !item.title.toLowerCase().includes(search.toLowerCase()) &&
          !item.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedCat && item.category !== selectedCat) return false;
      if (selectedType && item.type !== selectedType) return false;
      if (selectedCond && item.condition !== selectedCond) return false;
      if (priceMin && item.price && item.price < Number(priceMin) * 1000) return false;
      if (priceMax && item.price && item.price > Number(priceMax) * 1000) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return (a.price ?? 0) - (b.price ?? 0);
      if (sortBy === 'price_desc') return (b.price ?? 0) - (a.price ?? 0);
      if (sortBy === 'distance') return (a.distanceKm ?? 99) - (b.distanceKm ?? 99);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore) {
        setVisibleCount((c) => c + PAGE_SIZE);
      }
    },
    [hasMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCat('');
    setSelectedType('');
    setSelectedCond('');
    setPriceMin('');
    setPriceMax('');
    setSortBy('newest');
    setVisibleCount(PAGE_SIZE);
  };

  const hasActiveFilters = selectedCat || selectedType || selectedCond || priceMin || priceMax;

  return (
    <div className="min-h-screen bg-background">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-700 px-4 pt-6 pb-16">
        <div className="container max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-white text-xl font-bold flex items-center gap-2">
                <Package className="w-5 h-5" /> Chợ Đồ Thể Thao
              </h1>
              <p className="text-teal-100 text-xs mt-0.5">{allItems.filter(i => !i.isSold).length} sản phẩm đang bán</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE); }}
              placeholder="Tìm vợt, giày, quần áo..."
              className="w-full pl-9 pr-4 h-11 rounded-xl bg-white dark:bg-card border-0 text-sm focus:ring-2 focus:ring-teal-300 outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-4 -mt-10 pb-24 space-y-4">
        {/* ── CATEGORY CHIPS ─────────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => { setSelectedCat(''); setVisibleCount(PAGE_SIZE); }}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              !selectedCat
                ? 'bg-teal-600 border-teal-600 text-white'
                : 'bg-card border-border text-foreground hover:border-teal-400'
            }`}
          >
            Tất cả
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCat(selectedCat === cat ? '' : cat); setVisibleCount(PAGE_SIZE); }}
              className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedCat === cat
                  ? 'bg-teal-600 border-teal-600 text-white'
                  : 'bg-card border-border text-foreground hover:border-teal-400'
              }`}
            >
              {CATEGORY_ICONS[cat]} {cat}
            </button>
          ))}
        </div>

        {/* ── FILTER + SORT BAR ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              hasActiveFilters
                ? 'bg-teal-50 border-teal-400 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300'
                : 'bg-card border-border text-foreground hover:border-teal-400'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Bộ lọc
            {hasActiveFilters && (
              <span className="w-4 h-4 bg-teal-600 text-white rounded-full text-xs flex items-center justify-center">
                !
              </span>
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-border bg-card text-foreground hover:border-teal-400 cursor-pointer outline-none"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá: thấp → cao</option>
            <option value="price_desc">Giá: cao → thấp</option>
            <option value="distance">Gần nhất</option>
          </select>

          <div className="ml-auto text-xs text-muted-foreground">
            {filtered.length} kết quả
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-destructive hover:underline flex items-center gap-0.5">
              <X className="w-3 h-3" /> Xóa lọc
            </button>
          )}
        </div>

        {/* ── ADVANCED FILTERS ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
                {/* Type + Condition */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Loại tin</p>
                    <div className="flex flex-col gap-1.5">
                      {(['', 'sell', 'exchange'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => { setSelectedType(t as ItemType | ''); setVisibleCount(PAGE_SIZE); }}
                          className={`text-left px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            selectedType === t
                              ? 'bg-teal-600 border-teal-600 text-white'
                              : 'bg-background border-border hover:border-teal-400'
                          }`}
                        >
                          {t === '' ? 'Tất cả' : t === 'sell' ? '🏷️ Bán' : '🔄 Trao đổi'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Tình trạng</p>
                    <div className="flex flex-col gap-1.5">
                      {(['', 'new', 'like_new', 'used'] as const).map((c) => (
                        <button
                          key={c}
                          onClick={() => { setSelectedCond(c as ItemCondition | ''); setVisibleCount(PAGE_SIZE); }}
                          className={`text-left px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            selectedCond === c
                              ? 'bg-teal-600 border-teal-600 text-white'
                              : 'bg-background border-border hover:border-teal-400'
                          }`}
                        >
                          {c === '' ? 'Tất cả' : CONDITION_LABELS[c]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Khoảng giá (nghìn đồng)</p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Từ"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      type="number"
                      placeholder="Đến"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">nghìn đ</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── GRID ──────────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <ItemSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <Package className="w-14 h-14 text-muted-foreground/40" />
            <p className="font-semibold text-muted-foreground">Không tìm thấy sản phẩm nào</p>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {visible.map((item, i) => (
                <ItemCard key={item.id} item={item} index={i} />
              ))}
            </div>

            {/* Infinite scroll loader */}
            <div ref={loaderRef} className="flex justify-center py-4">
              {hasMore && (
                <div className="flex gap-1">
                  {[0,1,2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      className="w-2 h-2 rounded-full bg-teal-500"
                    />
                  ))}
                </div>
              )}
              {!hasMore && filtered.length > PAGE_SIZE && (
                <p className="text-xs text-muted-foreground">Đã hiển thị tất cả {filtered.length} sản phẩm</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── FAB ────────────────────────────────────────────────────────────── */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', damping: 12 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/marketplace/post')}
        className="fixed bottom-6 right-6 z-40 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-4 h-12 flex items-center gap-2 shadow-lg shadow-teal-600/30 font-semibold text-sm"
      >
        <Plus className="w-5 h-5" />
        Đăng bán / Trao đổi
      </motion.button>
    </div>
  );
}
