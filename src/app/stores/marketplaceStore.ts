import { create } from 'zustand';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type ItemCondition = 'new' | 'like_new' | 'used';
export type ItemType = 'sell' | 'exchange';
export type ItemCategory = 'Vợt' | 'Giày' | 'Quần áo' | 'Phụ kiện' | 'Bóng' | 'Túi' | 'Khác';

export interface MarketplaceItem {
  id: string;
  title: string;
  category: ItemCategory;
  price?: number;
  type: ItemType;
  condition: ItemCondition;
  description: string;
  images: string[];
  location: string;
  distanceKm?: number;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerRating: number;
  createdAt: string;
  sport?: string;
  views: number;
  isSold: boolean;
}

interface MarketplaceState {
  items: MarketplaceItem[];
  addItem: (item: MarketplaceItem) => void;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_ITEMS: MarketplaceItem[] = [
  {
    id: 'mp1',
    title: 'Vợt cầu lông Yonex Astrox 88D Pro',
    category: 'Vợt',
    price: 2_800_000,
    type: 'sell',
    condition: 'like_new',
    description: 'Vợt Yonex Astrox 88D Pro – dòng tấn công cao cấp. Dùng được 3 tháng, còn ~90% mới. Có đầy đủ hộp, phụ kiện gốc. Căng lại dây Bg80 Power 28 lbs. Lý do bán: nâng cấp lên vợt khác. Phù hợp tay đánh công.',
    images: [
      'https://images.unsplash.com/photo-1771854399722-240c2accbd0c?w=600&fit=crop',
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&fit=crop',
    ],
    location: 'Thạch Hòa, Thạch Thất',
    distanceKm: 1.2,
    sellerId: 'user_demo',
    sellerName: 'Nguyen Van Demo',
    sellerAvatar: 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=100&fit=crop',
    sellerRating: 4.8,
    createdAt: '2026-03-22T10:00:00Z',
    sport: 'Badminton',
    views: 142,
    isSold: false,
  },
  {
    id: 'mp2',
    title: 'Vợt tennis Wilson Blade 98 V8',
    category: 'Vợt',
    price: 3_500_000,
    type: 'sell',
    condition: 'used',
    description: 'Wilson Blade 98 V8 đã qua sử dụng khoảng 8 tháng. Khung vợt còn tốt, cán tay mới thay. Dây Luxilon ALU Power 1.25. Phù hợp người chơi baseline.',
    images: [
      'https://images.unsplash.com/photo-1615326882458-e0d45b097f55?w=600&fit=crop',
    ],
    location: 'Thạch Thất, Hà Nội',
    distanceKm: 3.7,
    sellerId: 'p1',
    sellerName: 'Nguyen Van Anh',
    sellerAvatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=100&fit=crop',
    sellerRating: 4.7,
    createdAt: '2026-03-21T08:30:00Z',
    sport: 'Tennis',
    views: 89,
    isSold: false,
  },
  {
    id: 'mp3',
    title: 'Giày cầu lông Victor SH-P9200 size 42',
    category: 'Giày',
    price: 1_200_000,
    type: 'sell',
    condition: 'like_new',
    description: 'Giày Victor SH-P9200 size 42, mua nhầm size chỉ mang 2 buổi. Còn hộp gốc. Đế keo còn nguyên, không vết xước.',
    images: [
      'https://images.unsplash.com/photo-1739132268718-53d64165d29a?w=600&fit=crop',
    ],
    location: 'Hà Nội',
    distanceKm: 5.1,
    sellerId: 'p2',
    sellerName: 'Tran Thi Mai',
    sellerAvatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=100&fit=crop',
    sellerRating: 4.5,
    createdAt: '2026-03-20T15:00:00Z',
    sport: 'Badminton',
    views: 210,
    isSold: false,
  },
  {
    id: 'mp4',
    title: 'Túi thể thao Victor BR9211 – trao đổi',
    category: 'Túi',
    type: 'exchange',
    condition: 'like_new',
    description: 'Túi Victor BR9211 màu đen/đỏ, đựng được 6 vợt. Muốn trao đổi lấy túi tương đương hoặc combo dây + quấn cán.',
    images: [
      'https://images.unsplash.com/photo-1717663625786-71e921774222?w=600&fit=crop',
    ],
    location: 'Thạch Thất',
    distanceKm: 7.3,
    sellerId: 'p3',
    sellerName: 'Le Minh Quan',
    sellerAvatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=100&fit=crop',
    sellerRating: 4.9,
    createdAt: '2026-03-19T09:00:00Z',
    sport: 'Badminton',
    views: 55,
    isSold: false,
  },
  {
    id: 'mp5',
    title: 'Paddle Pickleball Head Radical Pro',
    category: 'Vợt',
    price: 1_800_000,
    type: 'sell',
    condition: 'new',
    description: 'Paddle pickleball Head Radical Pro mua chưa đánh, có seal. Mua tặng nhưng người nhận không chơi. Giá gốc 2.6tr.',
    images: [
      'https://images.unsplash.com/photo-1710772099352-f8fbb7b30977?w=600&fit=crop',
    ],
    location: 'Thạch Hòa, Thạch Thất',
    distanceKm: 4.0,
    sellerId: 'p2',
    sellerName: 'Tran Thi Mai',
    sellerAvatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=100&fit=crop',
    sellerRating: 4.5,
    createdAt: '2026-03-18T14:00:00Z',
    sport: 'Pickleball',
    views: 178,
    isSold: false,
  },
  {
    id: 'mp6',
    title: 'Bộ áo quần cầu lông Yonex size M',
    category: 'Quần áo',
    price: 350_000,
    type: 'sell',
    condition: 'like_new',
    description: 'Bộ áo + quần Yonex màu xanh teal size M mặc 2 lần. Chất liệu thoáng mát, co giãn tốt. Phù hợp nam chiều cao 165-172cm.',
    images: [
      'https://images.unsplash.com/photo-1765791277994-33e886a83a9d?w=600&fit=crop',
    ],
    location: 'Hà Nội',
    distanceKm: 2.5,
    sellerId: 'user_demo',
    sellerName: 'Nguyen Van Demo',
    sellerAvatar: 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=100&fit=crop',
    sellerRating: 4.8,
    createdAt: '2026-03-17T11:00:00Z',
    sport: 'Badminton',
    views: 93,
    isSold: false,
  },
  {
    id: 'mp7',
    title: 'Bóng đá Nike Premier League size 5',
    category: 'Bóng',
    price: 480_000,
    type: 'sell',
    condition: 'used',
    description: 'Bóng Nike Premier League dùng được ~20 buổi, còn căng tốt. Bề mặt còn mịn, chưa bị bóc lớp ngoài.',
    images: [
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&fit=crop',
    ],
    location: 'Thạch Hòa',
    distanceKm: 11.2,
    sellerId: 'p3',
    sellerName: 'Le Minh Quan',
    sellerAvatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=100&fit=crop',
    sellerRating: 4.9,
    createdAt: '2026-03-16T16:00:00Z',
    sport: 'Football',
    views: 67,
    isSold: false,
  },
  {
    id: 'mp8',
    title: 'Bóng rổ Spalding NBA Official',
    category: 'Bóng',
    price: 650_000,
    type: 'sell',
    condition: 'like_new',
    description: 'Bóng rổ Spalding NBA Official size 7. Dùng khoảng 5 buổi trong nhà. Còn đẹp, grip tốt. Kèm kim bơm.',
    images: [
      'https://images.unsplash.com/photo-1772133720696-d983b128c23e?w=600&fit=crop',
    ],
    location: 'Hà Nội',
    distanceKm: 18.5,
    sellerId: 'p1',
    sellerName: 'Nguyen Van Anh',
    sellerAvatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=100&fit=crop',
    sellerRating: 4.7,
    createdAt: '2026-03-15T09:00:00Z',
    sport: 'Basketball',
    views: 44,
    isSold: false,
  },
  {
    id: 'mp9',
    title: 'Vợt cầu lông Li-Ning Aeronaut 9000D – trao đổi',
    category: 'Vợt',
    type: 'exchange',
    condition: 'used',
    description: 'Vợt Li-Ning Aeronaut 9000D đánh 1 năm. Trao đổi lấy Yonex Nanoflare 800 hoặc Victor TK-F speed. Có thể thêm tiền chênh lệch.',
    images: [
      'https://images.unsplash.com/photo-1771854399722-240c2accbd0c?w=600&fit=crop&sat=-100',
    ],
    location: 'Thạch Thất',
    distanceKm: 6.8,
    sellerId: 'p4',
    sellerName: 'Hoang Thi Lan',
    sellerAvatar: 'https://images.unsplash.com/photo-1761286753856-2f39b4413c1c?w=100&fit=crop',
    sellerRating: 4.3,
    createdAt: '2026-03-14T13:00:00Z',
    sport: 'Badminton',
    views: 112,
    isSold: false,
  },
  {
    id: 'mp10',
    title: 'Giày tennis Asics Gel Resolution 9 size 43',
    category: 'Giày',
    price: 2_100_000,
    type: 'sell',
    condition: 'like_new',
    description: 'Asics Gel Resolution 9 – dòng giày thi đấu chuyên nghiệp. Size 43, màu trắng/xanh. Đã mang 4-5 buổi sân cứng, đế còn mới.',
    images: [
      'https://images.unsplash.com/photo-1739132268718-53d64165d29a?w=600&fit=crop&hue=220',
    ],
    location: 'Hà Nội',
    distanceKm: 4.5,
    sellerId: 'user_demo',
    sellerName: 'Nguyen Van Demo',
    sellerAvatar: 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=100&fit=crop',
    sellerRating: 4.8,
    createdAt: '2026-03-13T08:00:00Z',
    sport: 'Tennis',
    views: 156,
    isSold: false,
  },
  {
    id: 'mp11',
    title: 'Phụ kiện cầu lông combo: dây + quấn cán',
    category: 'Phụ kiện',
    price: 180_000,
    type: 'sell',
    condition: 'new',
    description: 'Combo: 1 cuộn dây BG65 Ti (mới nguyên) + 5 cuộn quấn cán Yonex AC102 (mới). Mua thừa không dùng hết.',
    images: [
      'https://images.unsplash.com/photo-1717663625786-71e921774222?w=600&fit=crop&sat=-20',
    ],
    location: 'Thạch Hòa, Thạch Thất',
    distanceKm: 3.2,
    sellerId: 'p2',
    sellerName: 'Tran Thi Mai',
    sellerAvatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=100&fit=crop',
    sellerRating: 4.5,
    createdAt: '2026-03-12T10:00:00Z',
    sport: 'Badminton',
    views: 78,
    isSold: false,
  },
  {
    id: 'mp12',
    title: 'Áo thi đấu volleyball FIVB chính hãng',
    category: 'Quần áo',
    price: 420_000,
    type: 'sell',
    condition: 'new',
    description: 'Áo thi đấu volleyball chính hãng FIVB license size L. Màu xanh navy/trắng. Chất liệu polyester cao cấp, thoáng khí.',
    images: [
      'https://images.unsplash.com/photo-1765791277994-33e886a83a9d?w=600&fit=crop&hue=240',
    ],
    location: 'Hà Nội',
    distanceKm: 22.0,
    sellerId: 'p3',
    sellerName: 'Le Minh Quan',
    sellerAvatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=100&fit=crop',
    sellerRating: 4.9,
    createdAt: '2026-03-11T14:00:00Z',
    sport: 'Volleyball',
    views: 35,
    isSold: false,
  },
];

// ─── STORE ────────────────────────────────────────────────────────────────────

export const useMarketplaceStore = create<MarketplaceState>()((set) => ({
  items: MOCK_ITEMS,
  addItem: (item) =>
    set((state) => ({ items: [item, ...state.items] })),
}));
