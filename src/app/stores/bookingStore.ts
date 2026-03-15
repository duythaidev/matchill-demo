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
  status: 'upcoming' | 'past' | 'cancelled';
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

interface BookingState {
  venues: Venue[];
  myVenues: Venue[];
  myBookings: Booking[];
  walletBalance: number;
  selectedSlots: TimeSlot[];
  isLoading: boolean;
  pendingBookingRequests: PendingRequest[];
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

const defaultMyBookings: Booking[] = [
  {
    bookingId: 'bk_001',
    venueId: 'v1',
    venueName: 'Sky Court Badminton',
    venueAddress: '123 Nguyen Trai, Quận 1, TP.HCM',
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
    venueAddress: '45 Vo Nguyen Giap, Quận 2, TP.HCM',
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
    venueAddress: '78 Le Van Viet, Thủ Đức, TP.HCM',
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
    }),
    {
      name: 'matchill-booking',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
