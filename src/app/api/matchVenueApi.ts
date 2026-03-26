import { MatchRequest, MatchSuggestion, OpenTeam } from '../stores/matchStore';
import { Venue, TimeSlot, Booking } from '../stores/bookingStore';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

export const MOCK_PLAYERS: MatchSuggestion[] = [
  {
    userId: 'p1',
    fullName: 'Nguyen Van Anh',
    avatar:
      'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop',
    skillLevel: 4,
    distanceKm: 1.2,
    sports: ['Badminton'],
    sportMatchScore: 95,
    timeMatchScore: 88,
    matchScore: 92,
    isAvailable: true,
    bio: 'Tay vợt cầu lông 5 năm kinh nghiệm, thích đánh doubles vào buổi sáng.',
  },
  {
    userId: 'p2',
    fullName: 'Tran Thi Mai',
    avatar:
      'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop',
    skillLevel: 3,
    distanceKm: 2.5,
    sports: ['Tennis', 'Pickleball'],
    sportMatchScore: 87,
    timeMatchScore: 92,
    matchScore: 89,
    isAvailable: true,
    bio: 'Mình chơi tennis 3 năm và mới bắt đầu tập pickleball. Tìm bạn luyện thường xuyên!',
  },
  {
    userId: 'p3',
    fullName: 'Le Minh Quan',
    avatar:
      'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=200&h=200&fit=crop',
    skillLevel: 5,
    distanceKm: 3.8,
    sports: ['Badminton', 'Tennis'],
    sportMatchScore: 98,
    timeMatchScore: 75,
    matchScore: 87,
    isAvailable: false,
    bio: 'VĐV chuyên nghiệp đã nghỉ hưu, hiện dạy kèm và tìm đối thủ thử thách.',
  },
  {
    userId: 'p4',
    fullName: 'Pham Duc Anh',
    avatar:
      'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=200&h=200&fit=crop',
    skillLevel: 2,
    distanceKm: 0.8,
    sports: ['Table Tennis', 'Badminton'],
    sportMatchScore: 72,
    timeMatchScore: 95,
    matchScore: 83,
    isAvailable: true,
    bio: 'Mới học bóng bàn được 1 năm, thích chơi buổi tối. Tìm bạn cùng trình độ.',
  },
  {
    userId: 'p5',
    fullName: 'Hoang Thi Lan',
    avatar:
      'https://images.unsplash.com/photo-1761286753856-2f39b4413c1c?w=200&h=200&fit=crop',
    skillLevel: 4,
    distanceKm: 4.2,
    sports: ['Tennis'],
    sportMatchScore: 91,
    timeMatchScore: 83,
    matchScore: 87,
    isAvailable: true,
    bio: 'Chơi tennis từ năm 18 tuổi. Chuyên singles và doubles hỗn hợp. Tìm đối tác ổn định!',
  },
  {
    userId: 'p6',
    fullName: 'Vo Thanh Tung',
    avatar:
      'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop&seed=6',
    skillLevel: 3,
    distanceKm: 6.1,
    sports: ['Football', 'Badminton'],
    sportMatchScore: 80,
    timeMatchScore: 88,
    matchScore: 84,
    isAvailable: true,
    bio: 'Đam mê bóng đá và cầu lông. Cuối tuần free, tìm đội 5 người.',
  },
  {
    userId: 'p7',
    fullName: 'Nguyen Thi Thu',
    avatar:
      'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop&seed=7',
    skillLevel: 2,
    distanceKm: 1.5,
    sports: ['Pickleball'],
    sportMatchScore: 85,
    timeMatchScore: 90,
    matchScore: 88,
    isAvailable: true,
    bio: 'Mới chơi Pickleball được 6 tháng, tìm bạn chơi gần nhà buổi chiều.',
  },
  {
    userId: 'p8',
    fullName: 'Dang Minh Khoa',
    avatar:
      'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=200&h=200&fit=crop&seed=8',
    skillLevel: 5,
    distanceKm: 7.3,
    sports: ['Tennis', 'Pickleball', 'Badminton'],
    sportMatchScore: 99,
    timeMatchScore: 70,
    matchScore: 85,
    isAvailable: false,
    bio: 'Cựu VĐV tennis quốc gia. Sẵn sàng lên sân bất cứ lúc nào.',
  },
  {
    userId: 'p9',
    fullName: 'Bui Thi Hoa',
    avatar:
      'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop&seed=9',
    skillLevel: 3,
    distanceKm: 2.2,
    sports: ['Badminton'],
    sportMatchScore: 88,
    timeMatchScore: 85,
    matchScore: 87,
    isAvailable: true,
    bio: 'Chơi cầu lông cuối tuần, tìm bạn nữ cùng chơi.',
  },
  {
    userId: 'p10',
    fullName: 'Tran Van Binh',
    avatar:
      'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=200&h=200&fit=crop&seed=10',
    skillLevel: 4,
    distanceKm: 5.5,
    sports: ['Football', 'Table Tennis'],
    sportMatchScore: 77,
    timeMatchScore: 92,
    matchScore: 84,
    isAvailable: true,
    bio: 'Chơi bóng đá 10+ năm, tìm đội 7 người cho giải phong trào.',
  },
  {
    userId: 'p11',
    fullName: 'Ly Thi Ngoc',
    avatar:
      'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop&seed=11',
    skillLevel: 1,
    distanceKm: 0.5,
    sports: ['Badminton', 'Pickleball'],
    sportMatchScore: 65,
    timeMatchScore: 98,
    matchScore: 81,
    isAvailable: true,
    bio: 'Mới bắt đầu chơi thể thao. Tìm bạn kiên nhẫn hướng dẫn!',
  },
  {
    userId: 'p12',
    fullName: 'Nguyen Hoang Nam',
    avatar:
      'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop&seed=12',
    skillLevel: 4,
    distanceKm: 8.9,
    sports: ['Tennis', 'Football'],
    sportMatchScore: 82,
    timeMatchScore: 79,
    matchScore: 81,
    isAvailable: false,
    bio: 'Tập tennis và bóng đá song song. Tìm bạn chơi đều đặn 3 buổi/tuần.',
  },
];

export const MOCK_OPEN_TEAMS: OpenTeam[] = [
  {
    requestId: 'team_1',
    leaderId: 'p6',
    leaderName: 'Vo Thanh Tung',
    leaderAvatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop&seed=6',
    sport: 'Football',
    timeStart: '2026-03-15T17:00:00',
    timeEnd: '2026-03-15T19:00:00',
    skillAvg: 3,
    slotsLeft: 3,
    totalSlots: 5,
    distanceKm: 1.4,
    description: 'Tìm 3 người chơi bóng 5 người cuối tuần. Khu vực Thạch Hòa, sân cỏ nhân tạo. Trình độ phong trào vui vẻ là được!',
    members: [
      { userId: 'p6', name: 'Vo Thanh Tung', avatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop&seed=6', skill: 3 },
      { userId: 'p10', name: 'Tran Van Binh', avatar: 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=200&h=200&fit=crop&seed=10', skill: 4 },
    ],
  },
  {
    requestId: 'team_2',
    leaderId: 'p1',
    leaderName: 'Nguyen Van Anh',
    leaderAvatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop',
    sport: 'Badminton',
    timeStart: '2026-03-16T07:00:00',
    timeEnd: '2026-03-16T09:00:00',
    skillAvg: 4,
    slotsLeft: 2,
    totalSlots: 4,
    distanceKm: 2.1,
    description: 'Đội cầu lông doubles đang cần thêm 2 người. Trình độ từ 3★ trở lên. Sân Sky Court Hòa Lạc.',
    members: [
      { userId: 'p1', name: 'Nguyen Van Anh', avatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop', skill: 4 },
      { userId: 'p9', name: 'Bui Thi Hoa', avatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop&seed=9', skill: 3 },
    ],
  },
  {
    requestId: 'team_3',
    leaderId: 'p2',
    leaderName: 'Tran Thi Mai',
    leaderAvatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop',
    sport: 'Pickleball',
    timeStart: '2026-03-15T15:00:00',
    timeEnd: '2026-03-15T17:00:00',
    skillAvg: 2,
    slotsLeft: 1,
    totalSlots: 4,
    distanceKm: 3.7,
    description: 'Nhóm pickleball vui vẻ, beginner-friendly! Cần thêm 1 người nữa là đủ 2 đội đánh với nhau.',
    members: [
      { userId: 'p2', name: 'Tran Thi Mai', avatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop', skill: 3 },
      { userId: 'p7', name: 'Nguyen Thi Thu', avatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop&seed=7', skill: 2 },
      { userId: 'p11', name: 'Ly Thi Ngoc', avatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop&seed=11', skill: 1 },
    ],
  },
  {
    requestId: 'team_4',
    leaderId: 'p3',
    leaderName: 'Le Minh Quan',
    leaderAvatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=200&h=200&fit=crop',
    sport: 'Tennis',
    timeStart: '2026-03-16T06:00:00',
    timeEnd: '2026-03-16T08:00:00',
    skillAvg: 4,
    slotsLeft: 2,
    totalSlots: 4,
    distanceKm: 5.2,
    description: 'Nhóm tennis doubles buổi sáng sớm. Yêu cầu trình độ 4★+ vì chơi tốc độ cao.',
    members: [
      { userId: 'p3', name: 'Le Minh Quan', avatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=200&h=200&fit=crop', skill: 5 },
      { userId: 'p5', name: 'Hoang Thi Lan', avatar: 'https://images.unsplash.com/photo-1761286753856-2f39b4413c1c?w=200&h=200&fit=crop', skill: 4 },
    ],
  },
  {
    requestId: 'team_5',
    leaderId: 'p10',
    leaderName: 'Tran Van Binh',
    leaderAvatar: 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=200&h=200&fit=crop&seed=10',
    sport: 'Football',
    timeStart: '2026-03-22T08:00:00',
    timeEnd: '2026-03-22T10:00:00',
    skillAvg: 3,
    slotsLeft: 4,
    totalSlots: 7,
    distanceKm: 6.8,
    description: 'Tìm 4 người chơi bóng 7 người cho giải phong trào tháng 3. Giải thưởng hấp dẫn!',
    members: [
      { userId: 'p10', name: 'Tran Van Binh', avatar: 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=200&h=200&fit=crop&seed=10', skill: 4 },
      { userId: 'p6', name: 'Vo Thanh Tung', avatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop&seed=6', skill: 3 },
      { userId: 'p12', name: 'Nguyen Hoang Nam', avatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop&seed=12', skill: 4 },
    ],
  },
  {
    requestId: 'team_6',
    leaderId: 'p8',
    leaderName: 'Dang Minh Khoa',
    leaderAvatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=200&h=200&fit=crop&seed=8',
    sport: 'Badminton',
    timeStart: '2026-03-15T19:00:00',
    timeEnd: '2026-03-15T21:00:00',
    skillAvg: 4,
    slotsLeft: 2,
    totalSlots: 4,
    distanceKm: 4.0,
    description: 'Đội cầu lông trình độ cao, thi đấu nghiêm túc. Cần người biết chiến thuật đôi.',
    members: [
      { userId: 'p8', name: 'Dang Minh Khoa', avatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=200&h=200&fit=crop&seed=8', skill: 5 },
      { userId: 'p1', name: 'Nguyen Van Anh', avatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop', skill: 4 },
    ],
  },
];

export const MOCK_VENUES: Venue[] = [
  {
    id: 'v1',
    name: 'Sky Court Badminton',
    address: 'Khu công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội',
    images: [
      'https://images.unsplash.com/photo-1771854400123-2a23cb720c04?w=800&fit=crop',
      'https://images.unsplash.com/photo-1760599348992-ce335f8036c3?w=800&fit=crop',
      'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=800&fit=crop',
    ],
    amenities: ['Parking', 'Shower', 'AC', 'Water', 'Locker'],
    pricePerHour: 100000,
    rating: 4.7,
    isAvailableNow: true,
    type: 'indoor',
    sport: 'Badminton',
    reviewCount: 132,
    description:
      'Sân cầu lông tiêu chuẩn Olympic, hệ thống ánh sáng LED cao cấp, sàn gỗ chuyên dụng. Phù hợp cho cả luyện tập và thi đấu.',
    ownerId: 'owner_1',
  },
  {
    id: 'v2',
    name: 'Hòa Lạc Tennis Center',
    address: 'Đại lộ Thăng Long, Thạch Hòa, Thạch Thất, Hà Nội',
    images: [
      'https://images.unsplash.com/photo-1762423570069-6926efe1232a?w=800&fit=crop',
      'https://images.unsplash.com/photo-1761286753856-2f39b4413c1c?w=800&fit=crop',
      'https://images.unsplash.com/photo-1760599348992-ce335f8036c3?w=800&fit=crop',
    ],
    amenities: ['Parking', 'WC', 'Coach', 'Water', 'Racket Rental'],
    pricePerHour: 180000,
    rating: 4.5,
    isAvailableNow: false,
    type: 'outdoor',
    sport: 'Tennis',
    reviewCount: 87,
    description:
      'Học viện tennis chuyên nghiệp với đội ngũ HLV có chứng chỉ quốc tế. Sân đất nện tiêu chuẩn Roland Garros.',
    ownerId: 'owner_2',
  },
  {
    id: 'v3',
    name: 'Pickleball Zone Hòa Lạc',
    address: 'Thạch Hòa, Thạch Thất, Hà Nội',
    images: [
      'https://images.unsplash.com/photo-1762423570069-6926efe1232a?w=800&fit=crop',
      'https://images.unsplash.com/photo-1771854400123-2a23cb720c04?w=800&fit=crop',
    ],
    amenities: ['Parking', 'WC', 'Paddle Rental', 'Café'],
    pricePerHour: 120000,
    rating: 4.3,
    isAvailableNow: true,
    type: 'outdoor',
    sport: 'Pickleball',
    reviewCount: 54,
    description:
      'Khu vui chơi pickleball đầu tiên tại Thạch Thất. Có 6 sân tiêu chuẩn, mái che chống nắng, thuê vợt và bóng.',
    ownerId: 'owner_1',
  },
  {
    id: 'v4',
    name: 'Sân bóng Hòa Lạc',
    address: 'Khu CNC Hòa Lạc, Thạch Thất, Hà Nội',
    images: [
      'https://images.unsplash.com/photo-1652085155924-ae8b2c414c80?w=800&fit=crop',
      'https://images.unsplash.com/photo-1760599348992-ce335f8036c3?w=800&fit=crop',
    ],
    amenities: ['Parking', 'Shower', 'WC', 'Floodlight', 'Scoreboard'],
    pricePerHour: 250000,
    rating: 4.6,
    isAvailableNow: true,
    type: 'outdoor',
    sport: 'Football',
    reviewCount: 209,
    description:
      'Sân bóng cỏ nhân tạo 5 người và 7 người, hệ thống đèn cao áp sáng rõ ban đêm. Phù hợp giải phong trào và thuê theo buổi.',
    ownerId: 'owner_3',
  },
  {
    id: 'v5',
    name: 'Aqua Sports Stadium',
    address: 'Đại học FPT, Thạch Hòa, Thạch Thất, Hà Nội',
    images: [
      'https://images.unsplash.com/photo-1730244548329-4ae2f4fcaa7c?w=800&fit=crop',
      'https://images.unsplash.com/photo-1760599348992-ce335f8036c3?w=800&fit=crop',
    ],
    amenities: ['Parking', 'Locker', 'Shower', 'AC', 'Towel', 'Café'],
    pricePerHour: 150000,
    rating: 4.8,
    isAvailableNow: false,
    type: 'indoor',
    sport: 'Swimming',
    reviewCount: 315,
    description:
      'Bể bơi Olympic 50m, làn bơi riêng biệt cho từng trình độ. Nước được xử lý và kiểm soát chất lượng hàng ngày.',
    ownerId: 'owner_4',
  },
  {
    id: 'v6',
    name: 'Pro Badminton Club Thạch Thất',
    address: 'Thạch Hòa, Thạch Thất, Hà Nội',
    images: [
      'https://images.unsplash.com/photo-1771854400123-2a23cb720c04?w=800&fit=crop',
      'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=800&fit=crop',
    ],
    amenities: ['AC', 'Water', 'Shuttle Sale', 'Locker', 'WC'],
    pricePerHour: 90000,
    rating: 4.4,
    isAvailableNow: true,
    type: 'indoor',
    sport: 'Badminton',
    reviewCount: 98,
    description:
      'Câu lạc bộ cầu lông thành lập 2010, có cộng đồng thành viên đông đảo. Giá thuê sân ưu đãi dành cho thành viên.',
    ownerId: 'owner_1',
  },
];

// ─── GENERATE AVAILABILITY SLOTS ─────────────────────────────────────────────

const generateSlots = (date: string, venueId: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const bookedHours: Record<string, number[]> = {
    v1: [8, 9, 14, 15, 19],
    v2: [10, 11, 12, 16, 17],
    v3: [9, 10, 15, 20],
    v4: [18, 19, 20],
    v5: [7, 8, 17, 18],
    v6: [8, 9, 13, 14, 19, 20],
  };
  const pendingHours: Record<string, number[]> = {
    v1: [10, 18],
    v2: [9, 15],
    v3: [11, 16],
    v4: [8, 14],
    v5: [9, 16],
    v6: [10, 18],
  };

  const booked = bookedHours[venueId] || [];
  const pending = pendingHours[venueId] || [];

  for (let hour = 6; hour < 22; hour++) {
    const start = `${date}T${String(hour).padStart(2, '0')}:00:00`;
    const end = `${date}T${String(hour + 1).padStart(2, '0')}:00:00`;
    let status: TimeSlot['status'] = 'available';
    if (booked.includes(hour)) status = 'booked';
    else if (pending.includes(hour)) status = 'pending';
    slots.push({ start, end, status });
  }
  return slots;
};

// ─── MOCK API FUNCTIONS ───────────────────────────────────────────────────────

export const matchApi = {
  createMatchRequest: async (
    data: MatchRequest
  ): Promise<{ requestId: string; status: 'open'; leaderId: string; currentMembers: number }> => {
    await delay(800);
    return {
      requestId: `req_${Date.now()}`,
      status: 'open',
      leaderId: 'current_user',
      currentMembers: 1,
    };
  },

  getMatchSuggestions: async (
    requestId: string,
    filters?: Partial<{ sport: string; maxDistance: number }>
  ): Promise<MatchSuggestion[]> => {
    await delay(2500);
    let players = [...MOCK_PLAYERS];
    if (filters?.sport && filters.sport !== 'all') {
      players = players.filter((p) =>
        p.sports.some((s) => s.toLowerCase() === filters.sport!.toLowerCase())
      );
    }
    if (filters?.maxDistance) {
      players = players.filter((p) => p.distanceKm <= filters.maxDistance!);
    }
    return players.sort((a, b) => b.matchScore - a.matchScore);
  },

  getAllPlayers: async (filters?: Partial<{ sport: string; maxDistance: number }>): Promise<MatchSuggestion[]> => {
    await delay(600);
    let players = [...MOCK_PLAYERS];
    if (filters?.sport && filters.sport !== 'all') {
      players = players.filter((p) =>
        p.sports.some((s) => s.toLowerCase() === filters.sport!.toLowerCase())
      );
    }
    if (filters?.maxDistance) {
      players = players.filter((p) => p.distanceKm <= filters.maxDistance!);
    }
    return players;
  },

  getOpenTeams: async (filters?: Partial<{ sport: string; maxDistance: number }>): Promise<OpenTeam[]> => {
    await delay(700);
    let teams = [...MOCK_OPEN_TEAMS];
    if (filters?.sport && filters.sport !== 'all') {
      teams = teams.filter((t) => t.sport.toLowerCase() === filters.sport!.toLowerCase());
    }
    if (filters?.maxDistance) {
      teams = teams.filter((t) => t.distanceKm <= filters.maxDistance!);
    }
    return teams;
  },

  joinTeam: async (requestId: string): Promise<{ success: boolean; newGroupChatId: string }> => {
    await delay(800);
    return { success: true, newGroupChatId: `chat_${requestId}_${Date.now()}` };
  },

  inviteTeammate: async (requestId: string, userId: string): Promise<{ success: boolean }> => {
    await delay(600);
    return { success: true };
  },
};

export const venueApi = {
  getVenues: async (filters?: {
    search?: string;
    type?: string;
    sport?: string;
  }): Promise<Venue[]> => {
    await delay(600);
    let venues = [...MOCK_VENUES];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      venues = venues.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.address.toLowerCase().includes(q) ||
          v.sport.toLowerCase().includes(q)
      );
    }
    if (filters?.type && filters.type !== 'all') {
      venues = venues.filter((v) => v.type === filters.type);
    }
    if (filters?.sport && filters.sport !== 'all') {
      venues = venues.filter(
        (v) => v.sport.toLowerCase() === filters.sport!.toLowerCase()
      );
    }
    return venues;
  },

  getVenueById: async (id: string): Promise<Venue | null> => {
    await delay(400);
    return MOCK_VENUES.find((v) => v.id === id) || null;
  },

  getAvailability: async (venueId: string, date: string): Promise<TimeSlot[]> => {
    await delay(500);
    return generateSlots(date, venueId);
  },

  getMyVenues: async (): Promise<Venue[]> => {
    await delay(400);
    // Return venues owned by the current user (mock: owner_1)
    return MOCK_VENUES.filter((v) => v.ownerId === 'owner_1');
  },

  createVenue: async (data: Partial<Venue>): Promise<Venue> => {
    await delay(800);
    const newVenue: Venue = {
      id: `v_${Date.now()}`,
      name: data.name || '',
      address: data.address || '',
      images: data.images || [],
      amenities: data.amenities || [],
      pricePerHour: data.pricePerHour || 0,
      rating: 0,
      isAvailableNow: true,
      type: data.type || 'indoor',
      sport: data.sport || 'Badminton',
      description: data.description,
      ownerId: 'owner_1',
      reviewCount: 0,
    };
    return newVenue;
  },
};

export const bookingApi = {
  createBooking: async (data: {
    venueId: string;
    slots: { start: string; end: string }[];
    depositAmount: number;
    totalAmount: number;
  }): Promise<Booking> => {
    await delay(1000);
    const venue = MOCK_VENUES.find((v) => v.id === data.venueId);
    if (!venue) throw new Error('Venue not found');

    const booking: Booking = {
      bookingId: `bk_${Date.now()}`,
      venueId: data.venueId,
      venueName: venue.name,
      venueAddress: venue.address,
      venueImage: venue.images[0],
      start: data.slots[0].start,
      end: data.slots[data.slots.length - 1].end,
      status: 'upcoming',
      qrCode: `MATCHILL-${Date.now()}`,
      depositAmount: data.depositAmount,
      totalAmount: data.totalAmount,
    };
    return booking;
  },

  getMyBookings: async (): Promise<Booking[]> => {
    await delay(500);
    return [];
  },

  confirmBooking: async (bookingId: string): Promise<void> => {
    await delay(400);
  },
};