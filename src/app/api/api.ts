import { User } from '../stores/authStore';
import { IS_INTEGRATE_API } from '../config';
import { supabaseAuth, supabaseProfile } from './supabaseApi';

// Mock delay to simulate network request
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── MOCK USER DATABASE ───────────────────────────────────────────────────────

const mockUsers: Record<string, User & { password: string }> = {

  // ── PLAYER (demo) ──────────────────────────────────────────────────────────
  'demo@matchill.com': {
    uid: 'user_demo',
    email: 'demo@matchill.com',
    fullName: 'Nguyen Van Demo',
    password: '123456',
    role: 'player',
    avatarUrl: 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=200&h=200&fit=crop',
    age: 26,
    gender: 'male',
    skillLevel: 3,
    sports: ['Badminton', 'Tennis'],
    location: { city: 'TP. Hồ Chí Minh', lat: 10.776, lng: 106.7009 },
    radiusKm: 10,
    bio: 'Đam mê cầu lông và tennis. Đang tìm đồng đội chơi cuối tuần!',
    reputation: { score: 820, attendanceRate: 92, avgRating: 4.5 },
    badges: ['Active Newcomer', 'On-time Player'],
  },

  // ── VENUE OWNER ────────────────────────────────────────────────────────────
  'venue@matchill.com': {
    uid: 'user_venue_owner',
    email: 'venue@matchill.com',
    fullName: 'Tran Van Chủ Sân',
    password: '123456',
    role: 'venueOwner',
    avatarUrl: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=200&h=200&fit=crop',
    age: 38,
    gender: 'male',
    skillLevel: 2,
    sports: ['Badminton', 'Tennis', 'Pickleball'],
    location: { city: 'TP. Hồ Chí Minh', lat: 10.776, lng: 106.7009 },
    radiusKm: 20,
    bio: 'Chủ hệ thống Sky Court Badminton & VTF Tennis Academy. Đặt sân liên hệ qua app!',
    reputation: { score: 960, attendanceRate: 98, avgRating: 4.9 },
    badges: ['Verified Owner', 'Top Venue', 'Trusted Partner'],
  },

  // ── ADMIN ──────────────────────────────────────────────────────────────────
  'admin@matchill.com': {
    uid: 'user_admin',
    email: 'admin@matchill.com',
    fullName: 'Admin Matchill',
    password: '123456',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop',
    age: 30,
    gender: 'male',
    skillLevel: 1,
    sports: [],
    location: { city: 'TP. Hồ Chí Minh' },
    radiusKm: 50,
    bio: 'Quản trị viên hệ thống Matchill. Quản lý người dùng, sân và nội dung.',
    reputation: { score: 1000, attendanceRate: 100, avgRating: 5.0 },
    badges: ['Super Admin', 'System Manager'],
  },
};

// ─── TYPES ────────────────────────────────────────────────────────────────────

let currentUserProfile: User | null = null;

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const api = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    if (IS_INTEGRATE_API) return supabaseAuth.register(data);
    await delay(500);
    if (mockUsers[data.email]) {
      throw new Error('Email đã tồn tại. Vui lòng dùng email khác.');
    }
    const newUser: User = {
      uid: `user_${Date.now()}`,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      role: 'player',
      skillLevel: 3,
      sports: [],
      location: { city: '' },
      radiusKm: 10,
      reputation: { score: 100, attendanceRate: 0, avgRating: 0 },
      badges: ['Active Newcomer'],
    };
    mockUsers[data.email] = { ...newUser, password: data.password };
    currentUserProfile = newUser;
    return { user: newUser, token: `mock_token_${newUser.uid}` };
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    if (IS_INTEGRATE_API) return supabaseAuth.login(data);
    await delay(500);
    const user = mockUsers[data.email];
    if (!user || user.password !== data.password) {
      throw new Error('Email hoặc mật khẩu không đúng.');
    }
    const { password, ...userWithoutPassword } = user;
    currentUserProfile = userWithoutPassword;
    return { user: userWithoutPassword, token: `mock_token_${user.uid}` };
  },

  googleLogin: async (_idToken: string): Promise<AuthResponse> => {
    await delay(500);
    throw new Error('Google login chưa được hỗ trợ.');
  },

  getProfile: async (): Promise<User> => {
    if (IS_INTEGRATE_API && currentUserProfile) return supabaseProfile.getProfile(currentUserProfile.uid);
    await delay(300);
    if (!currentUserProfile) throw new Error('Chưa đăng nhập.');
    return currentUserProfile;
  },

  updateProfile: async (updates: Partial<User>): Promise<User> => {
    if (IS_INTEGRATE_API && currentUserProfile) {
      const updated = await supabaseProfile.updateProfile(currentUserProfile.uid, updates);
      currentUserProfile = updated;
      return updated;
    }
    await delay(500);
    if (!currentUserProfile) throw new Error('Chưa đăng nhập.');
    currentUserProfile = { ...currentUserProfile, ...updates };
    if (mockUsers[currentUserProfile.email]) {
      mockUsers[currentUserProfile.email] = {
        ...mockUsers[currentUserProfile.email],
        ...currentUserProfile,
      };
    }
    return currentUserProfile;
  },

  getPublicProfile: async (uid: string): Promise<User> => {
    if (IS_INTEGRATE_API) return supabaseProfile.getPublicProfile(uid);
    await delay(300);
    const user = Object.values(mockUsers).find((u) => u.uid === uid);
    if (!user) {
      return {
        uid,
        email: 'demo@matchill.com',
        fullName: 'Người chơi Matchill',
        age: 25,
        gender: 'male',
        skillLevel: 4,
        sports: ['Badminton', 'Tennis'],
        location: { city: 'TP. Hồ Chí Minh' },
        radiusKm: 15,
        bio: 'Đam mê thể thao, tìm đối tác chơi thường xuyên!',
        reputation: { score: 850, attendanceRate: 95, avgRating: 4.8 },
        badges: ['5-star Player', 'On-time Player', 'Active Newcomer'],
      };
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};

// ─── DEMO ACCOUNT INFO (used by LoginPage) ────────────────────────────────────
export const DEMO_ACCOUNTS = [
  {
    email: 'demo@matchill.com',
    password: '123456',
    label: 'Người chơi',
    name: 'Nguyen Van Demo',
    role: 'player' as const,
    emoji: '🏸',
    color: 'teal',
    description: 'Tìm đội, đặt sân, xem Feed',
  },
  {
    email: 'venue@matchill.com',
    password: '123456',
    label: 'Chủ sân',
    name: 'Tran Van Chủ Sân',
    role: 'venueOwner' as const,
    emoji: '🏟️',
    color: 'blue',
    description: 'Quản lý sân, Dashboard doanh thu',
  },
  {
    email: 'admin@matchill.com',
    password: '123456',
    label: 'Admin',
    name: 'Admin Matchill',
    role: 'admin' as const,
    emoji: '🛡️',
    color: 'red',
    description: 'Quản lý users, báo cáo, hệ thống',
  },
];