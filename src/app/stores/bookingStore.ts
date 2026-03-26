import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Venue {
  id: string;
  name: string;
  address: string;
  images: string[];
  amenities: string[];
  pricePerHour: number;
  rating: number;
  isAvailableNow: boolean;
  type: 'indoor' | 'outdoor';
  sport: string;
  description?: string;
  ownerId?: string;
  reviewCount?: number;
}

export interface TimeSlot {
  start: string;
  end: string;
  status: 'available' | 'booked' | 'pending';
}

export interface Booking {
  bookingId: string;
  venueId: string;
  venueName: string;
  venueAddress: string;
  venueImage: string;
  start: string;
  end: string;
  status: 'upcoming' | 'past' | 'cancelled' | 'refund_pending';
  qrCode?: string;
  depositAmount: number;
  totalAmount: number;
}

export interface PendingRequest {
  bookingId: string;
  venueName: string;
  userName: string;
  start: string;
  end: string;
  amount: number;
}

export interface RefundRequest {
  bookingId: string;
  venueName: string;
  userName: string;
  start: string;
  end: string;
  amount: number;
  requestTime: string;
  isWithin5Min: boolean;
}

interface BookingState {
  venues: Venue[];
  myVenues: Venue[];
  myBookings: Booking[];
  walletBalance: number;
  selectedSlots: TimeSlot[];
  isLoading: boolean;
  pendingBookingRequests: PendingRequest[];
  refundRequests: RefundRequest[];
  setVenues: (venues: Venue[]) => void;
  setMyVenues: (venues: Venue[]) => void;
  setMyBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  toggleSlot: (slot: TimeSlot) => void;
  clearSlots: () => void;
  setLoading: (loading: boolean) => void;
  deductWallet: (amount: number) => void;
  addVenue: (venue: Venue) => void;
  acceptBookingRequest: (bookingId: string) => void;
  rejectBookingRequest: (bookingId: string) => void;
  requestRefund: (bookingId: string) => void;
  addRefundRequest: (request: RefundRequest) => void;
  approveRefund: (bookingId: string) => void;
  rejectRefund: (bookingId: string) => void;
}

const defaultPendingRequests: PendingRequest[] = [
  {
    bookingId: 'req_001',
    venueName: 'Sky Court Badminton',
    userName: 'Nguyen Van Thanh',
    start: '2026-03-20T08:00:00',
    end: '2026-03-20T10:00:00',
    amount: 200000,
  },
  {
    bookingId: 'req_002',
    venueName: 'Sky Court Badminton',
    userName: 'Tran Thi Mai',
    start: '2026-03-21T14:00:00',
    end: '2026-03-21T16:00:00',
    amount: 200000,
  },
  {
    bookingId: 'req_003',
    venueName: 'VTF Tennis Academy',
    userName: 'Le Minh Quan',
    start: '2026-03-22T09:00:00',
    end: '2026-03-22T11:00:00',
    amount: 360000,
  },
  {
    bookingId: 'req_004',
    venueName: 'Champion Football Field',
    userName: 'Pham Duc Anh',
    start: '2026-03-23T16:00:00',
    end: '2026-03-23T18:00:00',
    amount: 500000,
  },
];

const defaultRefundRequests: RefundRequest[] = [
  {
    bookingId: 'ref_001',
    venueName: 'Sky Court Badminton',
    userName: 'Nguyen Van Thanh',
    start: '2026-03-20T08:00:00',
    end: '2026-03-20T10:00:00',
    amount: 60000,
    requestTime: '2026-03-16T10:02:00', // Within 5 minutes
    isWithin5Min: true,
  },
  {
    bookingId: 'ref_002',
    venueName: 'VTF Tennis Academy',
    userName: 'Tran Thi Mai',
    start: '2026-03-21T14:00:00',
    end: '2026-03-21T16:00:00',
    amount: 108000,
    requestTime: '2026-03-16T08:15:00', // After 5 minutes
    isWithin5Min: false,
  },
  {
    bookingId: 'ref_003',
    venueName: 'Champion Football Field',
    userName: 'Le Minh Quan',
    start: '2026-03-22T09:00:00',
    end: '2026-03-22T11:00:00',
    amount: 150000,
    requestTime: '2026-03-16T09:30:00', // Within 5 minutes
    isWithin5Min: true,
  },
];

const defaultMyBookings: Booking[] = [
  {
    bookingId: 'bk_001',
    venueId: 'v1',
    venueName: 'Sky Court Badminton',
    venueAddress: 'Khu công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội',
    venueImage:
      'https://images.unsplash.com/photo-1771854400123-2a23cb720c04?w=400&fit=crop',
    start: '2026-03-20T08:00:00',
    end: '2026-03-20T10:00:00',
    status: 'upcoming',
    qrCode: 'MATCHILL-BK001-2026',
    depositAmount: 60000,
    totalAmount: 200000,
  },
  {
    bookingId: 'bk_002',
    venueId: 'v2',
    venueName: 'VTF Tennis Academy',
    venueAddress: 'Đại lộ Thăng Long, Thạch Hòa, Thạch Thất, Hà Nội',
    venueImage:
      'https://images.unsplash.com/photo-1762423570069-6926efe1232a?w=400&fit=crop',
    start: '2026-03-10T09:00:00',
    end: '2026-03-10T11:00:00',
    status: 'past',
    qrCode: 'MATCHILL-BK002-2026',
    depositAmount: 108000,
    totalAmount: 360000,
  },
  {
    bookingId: 'bk_003',
    venueId: 'v3',
    venueName: 'Pickleball Zone',
    venueAddress: 'Thạch Hòa, Thạch Thất, Hà Nội',
    venueImage:
      'https://images.unsplash.com/photo-1762423570069-6926efe1232a?w=400&fit=crop',
    start: '2026-03-05T14:00:00',
    end: '2026-03-05T16:00:00',
    status: 'cancelled',
    depositAmount: 72000,
    totalAmount: 240000,
  },
];

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      venues: [],
      myVenues: [],
      myBookings: defaultMyBookings,
      walletBalance: 2500000,
      selectedSlots: [],
      isLoading: false,
      pendingBookingRequests: defaultPendingRequests,
      refundRequests: defaultRefundRequests,
      setVenues: (venues) => set({ venues }),
      setMyVenues: (venues) => set({ myVenues: venues }),
      setMyBookings: (bookings) => set({ myBookings: bookings }),
      addBooking: (booking) =>
        set((state) => ({ myBookings: [booking, ...state.myBookings] })),
      toggleSlot: (slot) =>
        set((state) => {
          const exists = state.selectedSlots.find((s) => s.start === slot.start);
          if (exists) {
            return {
              selectedSlots: state.selectedSlots.filter((s) => s.start !== slot.start),
            };
          }
          return { selectedSlots: [...state.selectedSlots, slot] };
        }),
      clearSlots: () => set({ selectedSlots: [] }),
      setLoading: (loading) => set({ isLoading: loading }),
      deductWallet: (amount) =>
        set((state) => ({ walletBalance: state.walletBalance - amount })),
      addVenue: (venue) =>
        set((state) => ({ myVenues: [...state.myVenues, venue] })),
      acceptBookingRequest: (bookingId) =>
        set((state) => ({
          pendingBookingRequests: state.pendingBookingRequests.filter(
            (r) => r.bookingId !== bookingId
          ),
        })),
      rejectBookingRequest: (bookingId) =>
        set((state) => ({
          pendingBookingRequests: state.pendingBookingRequests.filter(
            (r) => r.bookingId !== bookingId
          ),
        })),
      requestRefund: (bookingId) =>
        set((state) => {
          const booking = state.myBookings.find(b => b.bookingId === bookingId);
          if (!booking) return state;

          const refundRequest = {
            bookingId,
            venueName: booking.venueName,
            userName: 'Current User', // In real app, this would come from auth
            start: booking.start,
            end: booking.end,
            amount: booking.depositAmount,
            requestTime: new Date().toISOString(),
            isWithin5Min: true, // For demo, assume within 5 min
          };

          return {
            myBookings: state.myBookings.map((b) =>
              b.bookingId === bookingId ? { ...b, status: 'refund_pending' as const } : b
            ),
            refundRequests: [refundRequest, ...state.refundRequests],
          };
        }),
      addRefundRequest: (request) =>
        set((state) => ({ refundRequests: [request, ...state.refundRequests] })),
      approveRefund: (bookingId) =>
        set((state) => ({
          refundRequests: state.refundRequests.filter((r) => r.bookingId !== bookingId),
          myBookings: state.myBookings.map((b) =>
            b.bookingId === bookingId ? { ...b, status: 'cancelled' as const } : b
          ),
        })),
      rejectRefund: (bookingId) =>
        set((state) => ({
          refundRequests: state.refundRequests.filter((r) => r.bookingId !== bookingId),
        })),
    }),
    {
      name: 'matchill-booking',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
