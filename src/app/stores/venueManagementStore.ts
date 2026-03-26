import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── TYPES ─────────────────────────────────────────────────────────────────────

export interface ManagedVenue {
  id: string;
  name: string;
  address: string;
  city: string;
  images: string[];
  amenities: string[];
  pricePerHour: number;
  rating: number;
  reviewCount: number;
  type: 'indoor' | 'outdoor';
  sport: string;
  description: string;
  status: 'active' | 'paused';
  ownerId: string;
  totalDailySlots: number; // 6am-10pm = 16 slots
  availableTodaySlots: number;
  createdAt: string;
}

export interface CalendarSlot {
  id: string;
  venueId: string;
  date: string; // 'YYYY-MM-DD'
  startHour: number; // 6–21
  status: 'available' | 'booked' | 'pending';
  bookingId?: string;
  userName?: string;
  userAvatar?: string;
  amount?: number;
  phone?: string;
}

export interface VenueBookingRequest {
  bookingId: string;
  venueId: string;
  venueName: string;
  userName: string;
  userAvatar: string;
  date: string; // 'YYYY-MM-DD'
  startHour: number;
  endHour: number;
  amount: number;
  deposit: number;
  phone: string;
  note?: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface RevenueTransaction {
  id: string;
  venueId: string;
  venueName: string;
  date: string;
  userName: string;
  type: 'booking' | 'withdraw';
  amount: number;
  hours?: number;
}

// ─── MOCK HELPERS ──────────────────────────────────────────────────────────────

const MOCK_USERS = [
  { name: 'Nguyen Van Anh', avatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=80&h=80&fit=crop', phone: '0901234567' },
  { name: 'Tran Thi Mai', avatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=80&h=80&fit=crop', phone: '0912345678' },
  { name: 'Le Minh Quan', avatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=80&h=80&fit=crop', phone: '0923456789' },
  { name: 'Pham Duc Anh', avatar: 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=80&h=80&fit=crop', phone: '0934567890' },
  { name: 'Hoang Thi Lan', avatar: 'https://images.unsplash.com/photo-1761286753856-2f39b4413c1c?w=80&h=80&fit=crop', phone: '0945678901' },
  { name: 'Vo Thanh Tung', avatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=80&h=80&fit=crop&seed=6', phone: '0956789012' },
  { name: 'Nguyen Thi Thu', avatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=80&h=80&fit=crop&seed=7', phone: '0967890123' },
  { name: 'Dang Minh Khoa', avatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=80&h=80&fit=crop&seed=8', phone: '0978901234' },
];

// Build slots for both venues across the week Mar 23-29, 2026
// Today = Thu Mar 26 (dayIdx 3)
const WEEK_DATES = [
  '2026-03-23', '2026-03-24', '2026-03-25', '2026-03-26',
  '2026-03-27', '2026-03-28', '2026-03-29',
];

type SlotDef = { hour: number; status: 'booked' | 'pending'; userIdx: number };

const V1_DEFS: SlotDef[][] = [
  // Mon Mar 23
  [
    { hour: 8, status: 'booked', userIdx: 0 }, { hour: 9, status: 'booked', userIdx: 0 },
    { hour: 14, status: 'booked', userIdx: 1 }, { hour: 15, status: 'booked', userIdx: 1 },
    { hour: 10, status: 'pending', userIdx: 4 },
  ],
  // Tue Mar 24
  [
    { hour: 7, status: 'booked', userIdx: 2 }, { hour: 8, status: 'booked', userIdx: 2 },
    { hour: 18, status: 'booked', userIdx: 3 }, { hour: 19, status: 'booked', userIdx: 3 },
    { hour: 16, status: 'pending', userIdx: 5 },
  ],
  // Wed Mar 25
  [
    { hour: 9, status: 'booked', userIdx: 1 }, { hour: 10, status: 'booked', userIdx: 1 },
    { hour: 14, status: 'booked', userIdx: 3 }, { hour: 15, status: 'booked', userIdx: 3 },
    { hour: 8, status: 'pending', userIdx: 6 },
  ],
  // Thu Mar 26 (today)
  [
    { hour: 8, status: 'booked', userIdx: 0 }, { hour: 9, status: 'booked', userIdx: 0 },
    { hour: 14, status: 'booked', userIdx: 3 }, { hour: 15, status: 'booked', userIdx: 3 },
    { hour: 18, status: 'booked', userIdx: 1 }, { hour: 19, status: 'booked', userIdx: 1 },
    { hour: 10, status: 'pending', userIdx: 7 }, { hour: 16, status: 'pending', userIdx: 4 },
  ],
  // Fri Mar 27
  [
    { hour: 9, status: 'booked', userIdx: 2 }, { hour: 10, status: 'booked', userIdx: 2 },
    { hour: 15, status: 'booked', userIdx: 5 }, { hour: 19, status: 'booked', userIdx: 6 },
    { hour: 8, status: 'pending', userIdx: 3 }, { hour: 17, status: 'pending', userIdx: 7 },
  ],
  // Sat Mar 28
  [
    { hour: 7, status: 'booked', userIdx: 0 }, { hour: 8, status: 'booked', userIdx: 0 },
    { hour: 9, status: 'booked', userIdx: 1 }, { hour: 10, status: 'booked', userIdx: 2 },
    { hour: 14, status: 'booked', userIdx: 3 }, { hour: 15, status: 'booked', userIdx: 3 },
    { hour: 16, status: 'booked', userIdx: 4 }, { hour: 17, status: 'booked', userIdx: 4 },
    { hour: 18, status: 'booked', userIdx: 5 }, { hour: 19, status: 'booked', userIdx: 5 },
    { hour: 11, status: 'pending', userIdx: 6 },
  ],
  // Sun Mar 29
  [
    { hour: 8, status: 'booked', userIdx: 6 }, { hour: 9, status: 'booked', userIdx: 6 },
    { hour: 10, status: 'booked', userIdx: 7 }, { hour: 14, status: 'booked', userIdx: 0 },
    { hour: 15, status: 'booked', userIdx: 0 }, { hour: 18, status: 'booked', userIdx: 1 },
    { hour: 19, status: 'booked', userIdx: 1 }, { hour: 20, status: 'booked', userIdx: 2 },
    { hour: 11, status: 'pending', userIdx: 3 },
  ],
];

const V3_DEFS: SlotDef[][] = [
  [
    { hour: 9, status: 'booked', userIdx: 1 }, { hour: 15, status: 'booked', userIdx: 3 },
    { hour: 11, status: 'pending', userIdx: 4 },
  ],
  [
    { hour: 8, status: 'booked', userIdx: 2 }, { hour: 9, status: 'booked', userIdx: 2 },
    { hour: 15, status: 'booked', userIdx: 6 }, { hour: 16, status: 'booked', userIdx: 6 },
    { hour: 14, status: 'pending', userIdx: 5 },
  ],
  [
    { hour: 10, status: 'booked', userIdx: 0 }, { hour: 16, status: 'booked', userIdx: 4 },
    { hour: 9, status: 'pending', userIdx: 3 },
  ],
  // Thu Mar 26 (today)
  [
    { hour: 9, status: 'booked', userIdx: 5 }, { hour: 10, status: 'booked', userIdx: 5 },
    { hour: 15, status: 'booked', userIdx: 2 }, { hour: 19, status: 'booked', userIdx: 7 },
    { hour: 11, status: 'pending', userIdx: 1 }, { hour: 16, status: 'pending', userIdx: 6 },
  ],
  [
    { hour: 10, status: 'booked', userIdx: 4 }, { hour: 15, status: 'booked', userIdx: 0 },
    { hour: 16, status: 'booked', userIdx: 0 }, { hour: 8, status: 'pending', userIdx: 7 },
  ],
  [
    { hour: 8, status: 'booked', userIdx: 1 }, { hour: 9, status: 'booked', userIdx: 1 },
    { hour: 10, status: 'booked', userIdx: 3 }, { hour: 15, status: 'booked', userIdx: 4 },
    { hour: 16, status: 'booked', userIdx: 4 }, { hour: 17, status: 'booked', userIdx: 5 },
    { hour: 19, status: 'booked', userIdx: 6 }, { hour: 12, status: 'pending', userIdx: 2 },
  ],
  [
    { hour: 9, status: 'booked', userIdx: 7 }, { hour: 10, status: 'booked', userIdx: 7 },
    { hour: 15, status: 'booked', userIdx: 3 }, { hour: 16, status: 'booked', userIdx: 3 },
    { hour: 19, status: 'booked', userIdx: 0 }, { hour: 14, status: 'pending', userIdx: 5 },
  ],
];

function buildSlots(venueId: string, defs: SlotDef[][], pricePerHour: number): CalendarSlot[] {
  const slots: CalendarSlot[] = [];
  defs.forEach((dayDefs, dayIdx) => {
    const date = WEEK_DATES[dayIdx];
    const definedHours = new Set(dayDefs.map((d) => d.hour));
    // All hours 6-21
    for (let h = 6; h <= 21; h++) {
      const def = dayDefs.find((d) => d.hour === h);
      if (def) {
        const user = MOCK_USERS[def.userIdx];
        slots.push({
          id: `slot_${venueId}_${date}_${h}`,
          venueId,
          date,
          startHour: h,
          status: def.status,
          bookingId: `bk_${venueId}_${date}_${h}`,
          userName: user.name,
          userAvatar: user.avatar,
          amount: pricePerHour,
          phone: user.phone,
        });
      } else {
        slots.push({
          id: `slot_${venueId}_${date}_${h}`,
          venueId,
          date,
          startHour: h,
          status: 'available',
        });
      }
    }
  });
  return slots;
}

// ─── INITIAL DATA ──────────────────────────────────────────────────────────────

const INITIAL_VENUES: ManagedVenue[] = [
  {
    id: 'v1',
    name: 'Sky Court Badminton',
    address: 'Khu công nghệ cao Hòa Lạc, Thạch Thất',
    city: 'Hà Nội',
    images: [
      'https://images.unsplash.com/photo-1771854400123-2a23cb720c04?w=800&fit=crop',
      'https://images.unsplash.com/photo-1760599348992-ce335f8036c3?w=800&fit=crop',
    ],
    amenities: ['Parking', 'Shower', 'AC', 'Water', 'Locker', 'WC'],
    pricePerHour: 100000,
    rating: 4.7,
    reviewCount: 132,
    type: 'indoor',
    sport: 'Badminton',
    description: 'Sân cầu lông tiêu chuẩn Olympic, hệ thống ánh sáng LED cao cấp, sàn gỗ chuyên dụng. Phù hợp cho cả luyện tập và thi đấu chuyên nghiệp.',
    status: 'active',
    ownerId: 'owner_1',
    totalDailySlots: 16,
    availableTodaySlots: 6,
    createdAt: '2024-01-15',
  },
  {
    id: 'v3',
    name: 'Pickleball Zone Hòa Lạc',
    address: 'Thạch Hòa, Thạch Thất',
    city: 'Hà Nội',
    images: [
      'https://images.unsplash.com/photo-1679261546032-4a2770d2f360?w=800&fit=crop',
      'https://images.unsplash.com/photo-1771854400123-2a23cb720c04?w=800&fit=crop',
    ],
    amenities: ['Parking', 'WC', 'Paddle Rental', 'Café', 'Floodlight'],
    pricePerHour: 120000,
    rating: 4.3,
    reviewCount: 54,
    type: 'outdoor',
    sport: 'Pickleball',
    description: 'Khu vui chơi pickleball đầu tiên tại Thạch Thất. Có 6 sân tiêu chuẩn, mái che chống nắng. Thuê vợt và bóng tại chỗ.',
    status: 'active',
    ownerId: 'owner_1',
    totalDailySlots: 16,
    availableTodaySlots: 8,
    createdAt: '2024-06-01',
  },
  {
    id: 'v6',
    name: 'Pro Badminton Club Thạch Thất',
    address: 'Thạch Hòa, Thạch Thất',
    city: 'Hà Nội',
    images: [
      'https://images.unsplash.com/photo-1545255678-30015d3842b0?w=800&fit=crop',
      'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=800&fit=crop',
    ],
    amenities: ['AC', 'Water', 'Shuttle Sale', 'Locker', 'WC'],
    pricePerHour: 90000,
    rating: 4.4,
    reviewCount: 98,
    type: 'indoor',
    sport: 'Badminton',
    description: 'Câu lạc bộ cầu lông thành lập 2010, có cộng đồng thành viên đông đảo. Đang tạm dừng hoạt động để nâng cấp cơ sở vật chất.',
    status: 'paused',
    ownerId: 'owner_1',
    totalDailySlots: 16,
    availableTodaySlots: 0,
    createdAt: '2023-08-20',
  },
];

const v1Slots = buildSlots('v1', V1_DEFS, 100000);
const v3Slots = buildSlots('v3', V3_DEFS, 120000);

// Booking requests (pending ones from the calendar)
const INITIAL_REQUESTS: VenueBookingRequest[] = [
  {
    bookingId: 'pending_v1_2026-03-26_10',
    venueId: 'v1',
    venueName: 'Sky Court Badminton',
    userName: 'Dang Minh Khoa',
    userAvatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=80&h=80&fit=crop&seed=8',
    date: '2026-03-26',
    startHour: 10,
    endHour: 12,
    amount: 200000,
    deposit: 60000,
    phone: '0978901234',
    note: 'Đặt 2 tiếng để luyện doubles. Mang theo vợt riêng.',
    status: 'pending',
  },
  {
    bookingId: 'pending_v1_2026-03-26_16',
    venueId: 'v1',
    venueName: 'Sky Court Badminton',
    userName: 'Hoang Thi Lan',
    userAvatar: 'https://images.unsplash.com/photo-1761286753856-2f39b4413c1c?w=80&h=80&fit=crop',
    date: '2026-03-26',
    startHour: 16,
    endHour: 18,
    amount: 200000,
    deposit: 60000,
    phone: '0945678901',
    note: '',
    status: 'pending',
  },
  {
    bookingId: 'pending_v3_2026-03-26_11',
    venueId: 'v3',
    venueName: 'Pickleball Zone',
    userName: 'Tran Thi Mai',
    userAvatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=80&h=80&fit=crop',
    date: '2026-03-26',
    startHour: 11,
    endHour: 13,
    amount: 240000,
    deposit: 72000,
    phone: '0912345678',
    note: 'Nhóm 4 người mới học pickleball, cần hướng dẫn khu vực sân.',
    status: 'pending',
  },
  {
    bookingId: 'pending_v3_2026-03-26_16',
    venueId: 'v3',
    venueName: 'Pickleball Zone',
    userName: 'Nguyen Thi Thu',
    userAvatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=80&h=80&fit=crop&seed=7',
    date: '2026-03-26',
    startHour: 16,
    endHour: 17,
    amount: 120000,
    deposit: 36000,
    phone: '0967890123',
    note: '',
    status: 'pending',
  },
  {
    bookingId: 'pending_v1_2026-03-27_8',
    venueId: 'v1',
    venueName: 'Sky Court Badminton',
    userName: 'Pham Duc Anh',
    userAvatar: 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=80&h=80&fit=crop',
    date: '2026-03-27',
    startHour: 8,
    endHour: 10,
    amount: 200000,
    deposit: 60000,
    phone: '0934567890',
    status: 'pending',
  },
  {
    bookingId: 'pending_v1_2026-03-27_17',
    venueId: 'v1',
    venueName: 'Sky Court Badminton',
    userName: 'Dang Minh Khoa',
    userAvatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=80&h=80&fit=crop&seed=8',
    date: '2026-03-27',
    startHour: 17,
    endHour: 19,
    amount: 200000,
    deposit: 60000,
    phone: '0978901234',
    note: 'Thi đấu giao hữu giữa 2 đội.',
    status: 'pending',
  },
];

// Revenue transactions (last 30 days)
const INITIAL_TRANSACTIONS: RevenueTransaction[] = [
  { id: 'tx_001', venueId: 'v1', venueName: 'Sky Court Badminton', date: '2026-03-26', userName: 'Nguyen Van Anh', type: 'booking', amount: 200000, hours: 2 },
  { id: 'tx_002', venueId: 'v3', venueName: 'Pickleball Zone', date: '2026-03-26', userName: 'Le Minh Quan', type: 'booking', amount: 240000, hours: 2 },
  { id: 'tx_003', venueId: 'v1', venueName: 'Sky Court Badminton', date: '2026-03-25', userName: 'Tran Thi Mai', type: 'booking', amount: 400000, hours: 4 },
  { id: 'tx_004', venueId: 'v3', venueName: 'Pickleball Zone', date: '2026-03-25', userName: 'Hoang Thi Lan', type: 'booking', amount: 120000, hours: 1 },
  { id: 'tx_005', venueId: 'v1', venueName: 'Sky Court Badminton', date: '2026-03-24', userName: 'Pham Duc Anh', type: 'booking', amount: 200000, hours: 2 },
  { id: 'tx_006', venueId: 'v1', venueName: 'Sky Court Badminton', date: '2026-03-24', userName: 'Vo Thanh Tung', type: 'booking', amount: 200000, hours: 2 },
  { id: 'tx_007', venueId: 'v3', venueName: 'Pickleball Zone', date: '2026-03-23', userName: 'Le Minh Quan', type: 'booking', amount: 360000, hours: 3 },
  { id: 'tx_008', venueId: 'v1', venueName: 'Sky Court Badminton', date: '2026-03-23', userName: 'Nguyen Thi Thu', type: 'booking', amount: 100000, hours: 1 },
  { id: 'tx_009', venueId: 'v1', venueName: 'Sky Court Badminton', date: '2026-03-22', userName: 'Dang Minh Khoa', type: 'booking', amount: 300000, hours: 3 },
  { id: 'tx_010', venueId: 'v1', venueName: 'Sky Court Badminton', date: '2026-03-20', userName: 'Matchill', type: 'withdraw', amount: -2000000 },
  { id: 'tx_011', venueId: 'v3', venueName: 'Pickleball Zone', date: '2026-03-20', userName: 'Tran Thi Mai', type: 'booking', amount: 480000, hours: 4 },
  { id: 'tx_012', venueId: 'v1', venueName: 'Sky Court Badminton', date: '2026-03-19', userName: 'Nguyen Van Anh', type: 'booking', amount: 200000, hours: 2 },
];

export const WEEKLY_REVENUE_V1 = [
  { day: 'T2', revenue: 500000, bookings: 5 },
  { day: 'T3', revenue: 800000, bookings: 8 },
  { day: 'T4', revenue: 600000, bookings: 6 },
  { day: 'T5', revenue: 900000, bookings: 9 },
  { day: 'T6', revenue: 1200000, bookings: 12 },
  { day: 'T7', revenue: 1600000, bookings: 16 },
  { day: 'CN', revenue: 1400000, bookings: 14 },
];

export const WEEKLY_REVENUE_V3 = [
  { day: 'T2', revenue: 240000, bookings: 2 },
  { day: 'T3', revenue: 480000, bookings: 4 },
  { day: 'T4', revenue: 360000, bookings: 3 },
  { day: 'T5', revenue: 600000, bookings: 5 },
  { day: 'T6', revenue: 840000, bookings: 7 },
  { day: 'T7', revenue: 1080000, bookings: 9 },
  { day: 'CN', revenue: 960000, bookings: 8 },
];

// ─── STORE ─────────────────────────────────────────────────────────────────────

interface VenueManagementState {
  managedVenues: ManagedVenue[];
  calendarSlots: CalendarSlot[];
  bookingRequests: VenueBookingRequest[];
  revenueTransactions: RevenueTransaction[];
  isLoading: boolean;

  // Venues CRUD
  addManagedVenue: (venue: ManagedVenue) => void;
  updateManagedVenue: (id: string, updates: Partial<ManagedVenue>) => void;
  deleteManagedVenue: (id: string) => void;
  toggleVenueStatus: (id: string) => void;

  // Calendar
  updateSlotStatus: (slotId: string, status: CalendarSlot['status']) => void;
  addAvailableSlots: (venueId: string, date: string, hours: number[]) => void;

  // Booking requests
  acceptBookingRequest: (bookingId: string) => void;
  rejectBookingRequest: (bookingId: string) => void;

  // Revenue
  addWithdrawTransaction: (venueId: string, venueName: string, amount: number) => void;

  setLoading: (loading: boolean) => void;
}

export const useVenueManagementStore = create<VenueManagementState>()(
  persist(
    (set, get) => ({
      managedVenues: INITIAL_VENUES,
      calendarSlots: [...v1Slots, ...v3Slots],
      bookingRequests: INITIAL_REQUESTS,
      revenueTransactions: INITIAL_TRANSACTIONS,
      isLoading: false,

      addManagedVenue: (venue) =>
        set((state) => ({ managedVenues: [venue, ...state.managedVenues] })),

      updateManagedVenue: (id, updates) =>
        set((state) => ({
          managedVenues: state.managedVenues.map((v) =>
            v.id === id ? { ...v, ...updates } : v
          ),
        })),

      deleteManagedVenue: (id) =>
        set((state) => ({
          managedVenues: state.managedVenues.filter((v) => v.id !== id),
          calendarSlots: state.calendarSlots.filter((s) => s.venueId !== id),
          bookingRequests: state.bookingRequests.filter((r) => r.venueId !== id),
        })),

      toggleVenueStatus: (id) =>
        set((state) => ({
          managedVenues: state.managedVenues.map((v) =>
            v.id === id
              ? { ...v, status: v.status === 'active' ? 'paused' : 'active' }
              : v
          ),
        })),

      updateSlotStatus: (slotId, status) =>
        set((state) => ({
          calendarSlots: state.calendarSlots.map((s) =>
            s.id === slotId ? { ...s, status } : s
          ),
        })),

      addAvailableSlots: (venueId, date, hours) =>
        set((state) => {
          const existingIds = new Set(state.calendarSlots.map((s) => s.id));
          const newSlots: CalendarSlot[] = hours
            .filter((h) => !existingIds.has(`slot_${venueId}_${date}_${h}`))
            .map((h) => ({
              id: `slot_${venueId}_${date}_${h}`,
              venueId,
              date,
              startHour: h,
              status: 'available',
            }));
          return { calendarSlots: [...state.calendarSlots, ...newSlots] };
        }),

      acceptBookingRequest: (bookingId) =>
        set((state) => {
          const req = state.bookingRequests.find((r) => r.bookingId === bookingId);
          // Update matching slot(s) to booked
          let updatedSlots = state.calendarSlots;
          if (req) {
            const slotId = `slot_${req.venueId}_${req.date}_${req.startHour}`;
            updatedSlots = state.calendarSlots.map((s) =>
              s.id === slotId
                ? { ...s, status: 'booked', userName: req.userName, userAvatar: req.userAvatar }
                : s
            );
          }
          return {
            bookingRequests: state.bookingRequests.map((r) =>
              r.bookingId === bookingId ? { ...r, status: 'accepted' } : r
            ).filter((r) => r.bookingId !== bookingId),
            calendarSlots: updatedSlots,
            revenueTransactions: req
              ? [
                  {
                    id: `tx_${Date.now()}`,
                    venueId: req.venueId,
                    venueName: req.venueName,
                    date: req.date,
                    userName: req.userName,
                    type: 'booking',
                    amount: req.amount,
                    hours: req.endHour - req.startHour,
                  },
                  ...state.revenueTransactions,
                ]
              : state.revenueTransactions,
          };
        }),

      rejectBookingRequest: (bookingId) =>
        set((state) => {
          const req = state.bookingRequests.find((r) => r.bookingId === bookingId);
          let updatedSlots = state.calendarSlots;
          if (req) {
            const slotId = `slot_${req.venueId}_${req.date}_${req.startHour}`;
            updatedSlots = state.calendarSlots.map((s) =>
              s.id === slotId ? { ...s, status: 'available', userName: undefined, userAvatar: undefined } : s
            );
          }
          return {
            bookingRequests: state.bookingRequests.filter((r) => r.bookingId !== bookingId),
            calendarSlots: updatedSlots,
          };
        }),

      addWithdrawTransaction: (venueId, venueName, amount) =>
        set((state) => ({
          revenueTransactions: [
            {
              id: `tx_${Date.now()}`,
              venueId,
              venueName,
              date: new Date().toISOString().slice(0, 10),
              userName: 'Matchill',
              type: 'withdraw',
              amount: -amount,
            },
            ...state.revenueTransactions,
          ],
        })),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'matchill-venue-management',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
