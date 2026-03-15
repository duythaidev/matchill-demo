import { FindPartnerRequest, MatchedGroup } from '../stores/findPartnerStore';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Mock matched members pool
const MATCHED_MEMBERS_POOL = [
  {
    userId: 'p1',
    name: 'Nguyen Van Anh',
    avatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop',
    skillLevel: 4,
    distanceKm: 1.2,
  },
  {
    userId: 'p2',
    name: 'Tran Thi Mai',
    avatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop',
    skillLevel: 3,
    distanceKm: 2.5,
  },
  {
    userId: 'p3',
    name: 'Le Minh Quan',
    avatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=200&h=200&fit=crop',
    skillLevel: 5,
    distanceKm: 3.8,
  },
  {
    userId: 'p5',
    name: 'Hoang Thi Lan',
    avatar: 'https://images.unsplash.com/photo-1761286753856-2f39b4413c1c?w=200&h=200&fit=crop',
    skillLevel: 4,
    distanceKm: 4.2,
  },
  {
    userId: 'p6',
    name: 'Vo Thanh Tung',
    avatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop&seed=6',
    skillLevel: 3,
    distanceKm: 1.8,
  },
  {
    userId: 'p9',
    name: 'Bui Thi Hoa',
    avatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop&seed=9',
    skillLevel: 3,
    distanceKm: 2.2,
  },
];

// 80% chance of success for demo purposes
let callCount = 0;

export const findPartnerApi = {
  findPartner: async (
    req: FindPartnerRequest
  ): Promise<
    | { status: 'matched'; groupId: string; chatId: string; members: typeof MATCHED_MEMBERS_POOL; sport: string; timeStart: string }
    | { status: 'not_found'; message: string }
  > => {
    callCount++;
    // Simulate realistic delay (5-10 seconds)
    const searchDuration = 5000 + Math.random() * 5000;
    await delay(searchDuration);

    // Always succeed after 2nd try, first try has 80% success rate
    const willSucceed = callCount > 1 || Math.random() < 0.8;

    if (!willSucceed) {
      callCount = 0; // Reset so next try might succeed
      return {
        status: 'not_found',
        message: 'Chưa tìm thấy teammate phù hợp trong bán kính của bạn.',
      };
    }

    callCount = 0;

    // Pick 2-3 members based on playersNeeded
    const count = Math.min(req.playersNeeded, 3);
    const shuffled = [...MATCHED_MEMBERS_POOL].sort(() => Math.random() - 0.5);
    const members = shuffled.slice(0, count);

    const groupId = `group_${Date.now()}`;
    const chatId = `chat_fp_${Date.now()}`;

    return {
      status: 'matched',
      groupId,
      chatId,
      members,
      sport: req.sport,
      timeStart: req.timeStart,
    };
  },

  joinTeam: async (teamId: string): Promise<{ success: boolean; groupId: string; chatId: string }> => {
    await delay(700);
    return {
      success: true,
      groupId: `group_${teamId}`,
      chatId: `chat_${teamId}`,
    };
  },

  inviteToTeam: async (teamId: string, userId: string): Promise<{ success: boolean }> => {
    await delay(500);
    return { success: true };
  },
};
