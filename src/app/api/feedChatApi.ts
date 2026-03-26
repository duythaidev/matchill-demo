const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: string[];
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  images?: string[];
  sport?: string;
  location?: string;
  createdAt: string;
  likes: string[];
  comments: PostComment[];
  saves: string[];
  shareCount: number;
  isReported?: boolean;
}

export interface ChatParticipant {
  userId: string;
  name: string;
  avatar: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  createdAt: string;
  seenBy: string[];
  type?: 'text' | 'system';
}

export interface ChatRoom {
  id: string;
  type: 'private' | 'group';
  name?: string;
  groupAvatar?: string;
  participants: ChatParticipant[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface RatingSubmit {
  activityId: string;
  activityType: 'match' | 'booking';
  targetId: string;
  rating: number;
  comment: string;
  tags: string[];
}

export interface Report {
  id: string;
  type: 'user' | 'post';
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetName: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'warned' | 'banned';
  reputation: number;
  joinedAt: string;
  totalMatches: number;
}

// ─── MOCK POSTS ───────────────────────────────────────────────────────────────

export let MOCK_POSTS: Post[] = [
  {
    id: 'post_1',
    authorId: 'p1',
    authorName: 'Nguyen Van Anh',
    authorAvatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop',
    content: 'Tìm 2 người chơi cầu lông doubles cuối tuần này 🏸 Sân Sky Court Hòa Lạc, thứ 7 lúc 7h sáng. Ai muốn tham gia comment bên dưới nhé!',
    images: ['https://images.unsplash.com/photo-1771854400123-2a23cb720c04?w=600&fit=crop'],
    sport: 'Badminton',
    location: 'Thạch Hòa, Thạch Thất, Hà Nội',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: ['p2', 'p3', 'p9'],
    comments: [
      {
        id: 'c1',
        authorId: 'p9',
        authorName: 'Bui Thi Hoa',
        authorAvatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop&seed=9',
        content: 'Mình tham gia được! Mình đánh được doubles rồi 🙌',
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        likes: ['p1'],
      },
      {
        id: 'c2',
        authorId: 'p4',
        authorName: 'Pham Duc Anh',
        authorAvatar: 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=200&h=200&fit=crop',
        content: 'Mình ở khu Hòa Lạc nè, nhưng tay còn yếu lắm 😅 có chấp không?',
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        likes: [],
      },
    ],
    saves: ['p5'],
    shareCount: 3,
  },
  {
    id: 'post_2',
    authorId: 'p2',
    authorName: 'Tran Thi Mai',
    authorAvatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop',
    content: 'Trận tennis hôm qua cực đỉnh! Lần đầu tiên thắng set thứ 3 sau khi bị dẫn 0-2 🎾🔥 Cảm ơn đối thủ đã cạnh tranh nhiệt tình. See you next time!',
    images: [
      'https://images.unsplash.com/photo-1762423570069-6926efe1232a?w=600&fit=crop',
      'https://images.unsplash.com/photo-1761286753856-2f39b4413c1c?w=600&fit=crop',
    ],
    sport: 'Tennis',
    location: 'Hòa Lạc Tennis Center, Thạch Thất',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likes: ['p1', 'p3', 'p5', 'p8', 'p11'],
    comments: [
      {
        id: 'c3',
        authorId: 'p5',
        authorName: 'Hoang Thi Lan',
        authorAvatar: 'https://images.unsplash.com/photo-1761286753856-2f39b4413c1c?w=200&h=200&fit=crop',
        content: 'Quá đỉnh rồi!! Comeback như Djokovic vậy 😍',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes: ['p2', 'p1'],
      },
    ],
    saves: ['p1', 'p3'],
    shareCount: 7,
  },
  {
    id: 'post_3',
    authorId: 'p6',
    authorName: 'Vo Thanh Tung',
    authorAvatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop&seed=6',
    content: 'Đội bóng 5 người đang cần thêm 2 tiền đạo cho giải phong trào tháng 4! ⚽ Tập trung tối thứ 3 & thứ 5 lúc 19h. Sân Champion Q7. Trình độ không quan trọng, quan trọng là nhiệt huyết 🔥',
    images: ['https://images.unsplash.com/photo-1652085155924-ae8b2c414c80?w=600&fit=crop'],
    sport: 'Football',
    location: 'Sân bóng Thạch Hòa, Thạch Thất',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    likes: ['p10', 'p12', 'p4'],
    comments: [
      {
        id: 'c4',
        authorId: 'p10',
        authorName: 'Tran Van Binh',
        authorAvatar: 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=200&h=200&fit=crop&seed=10',
        content: 'Mình đã join team rồi, còn cần 1 người nữa nhé!',
        createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        likes: ['p6'],
      },
    ],
    saves: [],
    shareCount: 12,
  },
  {
    id: 'post_4',
    authorId: 'p3',
    authorName: 'Le Minh Quan',
    authorAvatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=200&h=200&fit=crop',
    content: '5 bài học từ 15 năm chơi cầu lông chuyên nghiệp:\n\n1. Footwork là tất cả — kỹ thuật đánh tốt nhưng di chuyển chậm = thua\n2. Consistency quan trọng hơn power\n3. Đọc ý đồ đối thủ trước khi họ đánh\n4. Khởi động kỹ hoặc sẽ chấn thương\n5. Mental game chiếm 60% kết quả\n\nAi muốn được coach thì DM mình nhé 🏸',
    sport: 'Badminton',
    location: 'Hà Nội',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    likes: ['p1', 'p2', 'p4', 'p5', 'p7', 'p9', 'p11'],
    comments: [
      {
        id: 'c5',
        authorId: 'p1',
        authorName: 'Nguyen Van Anh',
        authorAvatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop',
        content: 'Bài #3 và #5 hit different 🙏 anh thật sự truyền cảm hứng!',
        createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
        likes: ['p3'],
      },
      {
        id: 'c6',
        authorId: 'p11',
        authorName: 'Ly Thi Ngoc',
        authorAvatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop&seed=11',
        content: 'Ơi anh ơi cho em xin số điện thoại để book buổi coach với ạ!',
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        likes: [],
      },
    ],
    saves: ['p1', 'p2', 'p4', 'p9'],
    shareCount: 24,
  },
  {
    id: 'post_5',
    authorId: 'p5',
    authorName: 'Hoang Thi Lan',
    authorAvatar: 'https://images.unsplash.com/photo-1761286753856-2f39b4413c1c?w=200&h=200&fit=crop',
    content: 'Buổi training doubles cuối tuần cùng nhóm tennis. 4 tiếng trên sân không biết mệt là gì 😂💪 Đây là lý do mình yêu môn thể thao này — không chỉ là rèn luyện thể chất mà còn kết bạn tuyệt vời!',
    images: [
      'https://images.unsplash.com/photo-1762423570069-6926efe1232a?w=600&fit=crop',
      'https://images.unsplash.com/photo-1761286753856-2f39b4413c1c?w=600&fit=crop',
      'https://images.unsplash.com/photo-1760599348992-ce335f8036c3?w=600&fit=crop',
      'https://images.unsplash.com/photo-1771854400123-2a23cb720c04?w=600&fit=crop',
    ],
    sport: 'Tennis',
    location: 'Hòa Lạc Tennis Center, Thạch Thất',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    likes: ['p2', 'p3', 'p8', 'p12'],
    comments: [],
    saves: ['p2'],
    shareCount: 5,
  },
  {
    id: 'post_6',
    authorId: 'p7',
    authorName: 'Nguyen Thi Thu',
    authorAvatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop&seed=7',
    content: 'Ai chơi Pickleball ở khu Thạch Hòa không? Mình mới tập được 6 tháng, muốn tìm nhóm chơi thường xuyên gần nhà. Tốt nhất là buổi chiều sau 17h hoặc buổi sáng cuối tuần 🏓',
    sport: 'Pickleball',
    location: 'Thạch Hòa, Thạch Thất',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    likes: ['p2', 'p11'],
    comments: [
      {
        id: 'c7',
        authorId: 'p2',
        authorName: 'Tran Thi Mai',
        authorAvatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop',
        content: 'Mình chơi pickleball khu Thạch Thất! Không quá xa, bạn có thể qua sân Pickleball Zone Hòa Lạc thử không?',
        createdAt: new Date(Date.now() - 35 * 60 * 60 * 1000).toISOString(),
        likes: ['p7'],
      },
    ],
    saves: [],
    shareCount: 2,
  },
  {
    id: 'post_7',
    authorId: 'p8',
    authorName: 'Dang Minh Khoa',
    authorAvatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=200&h=200&fit=crop&seed=8',
    content: 'Recap giải tennis phong trào tháng 3:\n🥇 Vô địch đơn nam: Dang Minh Khoa\n🥈 Á quân: Le Minh Quan\n🥉 Hạng 3: Nguyen Hoang Nam\n\nCảm ơn BTC và tất cả vận động viên đã tham gia! Hẹn gặp lại mùa giải tháng 6 🎾🏆',
    images: [
      'https://images.unsplash.com/photo-1762423570069-6926efe1232a?w=600&fit=crop',
      'https://images.unsplash.com/photo-1760599348992-ce335f8036c3?w=600&fit=crop',
    ],
    sport: 'Tennis',
    location: 'Hà Nội',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likes: ['p1', 'p2', 'p3', 'p5', 'p9', 'p11', 'p12'],
    comments: [
      {
        id: 'c8',
        authorId: 'p3',
        authorName: 'Le Minh Quan',
        authorAvatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=200&h=200&fit=crop',
        content: 'GG WP! Trận chung kết căng thật 😅 Hẹn tái đấu tháng 6 nhé!',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        likes: ['p8'],
      },
    ],
    saves: ['p1', 'p12'],
    shareCount: 19,
  },
];

// ─── MOCK CHATS ───────────────────────────────────────────────────────────────

export const MOCK_CHATS: ChatRoom[] = [
  {
    id: 'chat_group_1',
    type: 'group',
    name: 'Team Cầu Lông Sky Court 🏸',
    groupAvatar: '🏸',
    participants: [
      { userId: 'me', name: 'Bạn', avatar: 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=200&h=200&fit=crop' },
      { userId: 'p1', name: 'Nguyen Van Anh', avatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop' },
      { userId: 'p9', name: 'Bui Thi Hoa', avatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop&seed=9' },
      { userId: 'p3', name: 'Le Minh Quan', avatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=200&h=200&fit=crop' },
    ],
    lastMessage: {
      id: 'lm_1',
      senderId: 'p1',
      senderName: 'Nguyen Van Anh',
      senderAvatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop',
      text: 'Team ơi nhớ tập trung lúc 6h45 nhé! Sân đã book từ 7h 🏸',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      seenBy: ['p1', 'p9'],
    },
    unreadCount: 3,
  },
  {
    id: 'chat_private_1',
    type: 'private',
    participants: [
      { userId: 'me', name: 'Bạn', avatar: 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=200&h=200&fit=crop' },
      { userId: 'p2', name: 'Tran Thi Mai', avatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop' },
    ],
    lastMessage: {
      id: 'lm_2',
      senderId: 'p2',
      senderName: 'Tran Thi Mai',
      senderAvatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop',
      text: 'Oke bạn ơi, 8h tối nay nhé! Mình sẽ đợi ở cổng sân 😊',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      seenBy: ['p2', 'me'],
    },
    unreadCount: 0,
  },
  {
    id: 'chat_group_2',
    type: 'group',
    name: 'Weekend Warriors ⚽',
    groupAvatar: '⚽',
    participants: [
      { userId: 'me', name: 'Bạn', avatar: 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=200&h=200&fit=crop' },
      { userId: 'p6', name: 'Vo Thanh Tung', avatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop&seed=6' },
      { userId: 'p10', name: 'Tran Van Binh', avatar: 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=200&h=200&fit=crop&seed=10' },
      { userId: 'p12', name: 'Nguyen Hoang Nam', avatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop&seed=12' },
    ],
    lastMessage: {
      id: 'lm_3',
      senderId: 'me',
      senderName: 'Bạn',
      senderAvatar: '',
      text: 'Thứ 7 tuần này đá không mọi người?',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      seenBy: ['me', 'p6'],
    },
    unreadCount: 1,
  },
  {
    id: 'chat_private_2',
    type: 'private',
    participants: [
      { userId: 'me', name: 'Bạn', avatar: 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=200&h=200&fit=crop' },
      { userId: 'p3', name: 'Le Minh Quan', avatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=200&h=200&fit=crop' },
    ],
    lastMessage: {
      id: 'lm_4',
      senderId: 'p3',
      senderName: 'Le Minh Quan',
      senderAvatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=200&h=200&fit=crop',
      text: 'Bạn tiến bộ rất nhiều rồi đó! Thứ 4 mình coach tiếp nhé',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      seenBy: ['p3', 'me'],
    },
    unreadCount: 0,
  },
  {
    id: 'chat_private_3',
    type: 'private',
    participants: [
      { userId: 'me', name: 'Bạn', avatar: 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=200&h=200&fit=crop' },
      { userId: 'p5', name: 'Hoang Thi Lan', avatar: 'https://images.unsplash.com/photo-1761286753856-2f39b4413c1c?w=200&h=200&fit=crop' },
    ],
    lastMessage: {
      id: 'lm_5',
      senderId: 'me',
      senderName: 'Bạn',
      senderAvatar: '',
      text: 'Bạn đánh forehand rất ổn! Học ở đâu vậy?',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      seenBy: ['me'],
    },
    unreadCount: 2,
  },
];

// ─── MOCK MESSAGES ────────────────────────────────────────────────────────────

export const MOCK_MESSAGES: Record<string, Message[]> = {
  chat_group_1: [
    {
      id: 'msg_sys_1',
      senderId: 'system',
      senderName: 'Hệ thống',
      senderAvatar: '',
      text: '🎉 Team đủ 4 người! Group chat đã được tạo. Chúc team thi đấu tốt!',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      seenBy: [],
      type: 'system',
    },
    {
      id: 'msg_2',
      senderId: 'p1',
      senderName: 'Nguyen Van Anh',
      senderAvatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop',
      text: 'Xin chào team! Mình là Anh, leader của team này. Mọi người tự giới thiệu đi nào 😄',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
      seenBy: ['p1', 'p9', 'p3', 'me'],
    },
    {
      id: 'msg_3',
      senderId: 'p9',
      senderName: 'Bui Thi Hoa',
      senderAvatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop&seed=9',
      text: 'Hoa đây! Mình đánh doubles được 3 năm rồi, chuyên về net play 🏸',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000).toISOString(),
      seenBy: ['p1', 'p9', 'p3', 'me'],
    },
    {
      id: 'msg_4',
      senderId: 'p3',
      senderName: 'Le Minh Quan',
      senderAvatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=200&h=200&fit=crop',
      text: 'Quan — cựu VĐV. Mình sẽ chơi vị trí sau court. Team yên tâm nhé 💪',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
      seenBy: ['p1', 'p9', 'p3', 'me'],
    },
    {
      id: 'msg_5',
      senderId: 'me',
      senderName: 'Bạn',
      senderAvatar: '',
      text: 'Mình tham gia rồi! Mình đánh được cả forehand lẫn backhand, nhưng footwork cần cải thiện thêm 😅',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 12 * 60 * 1000).toISOString(),
      seenBy: ['me', 'p1', 'p9', 'p3'],
    },
    {
      id: 'msg_6',
      senderId: 'p1',
      senderName: 'Nguyen Van Anh',
      senderAvatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop',
      text: 'Không sao, mình sẽ luyện footwork chung trong buổi warm-up nhé. Đặt sân thứ 7 lúc 7h sáng, ai confirm thì cho mình biết 🙏',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      seenBy: ['p1', 'p9', 'p3', 'me'],
    },
    {
      id: 'msg_7',
      senderId: 'p9',
      senderName: 'Bui Thi Hoa',
      senderAvatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop&seed=9',
      text: '✅ Confirm!',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
      seenBy: ['p1', 'p9', 'p3', 'me'],
    },
    {
      id: 'msg_8',
      senderId: 'me',
      senderName: 'Bạn',
      senderAvatar: '',
      text: '✅ Mình có mặt!',
      createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
      seenBy: ['me', 'p1'],
    },
    {
      id: 'msg_9',
      senderId: 'p3',
      senderName: 'Le Minh Quan',
      senderAvatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=200&h=200&fit=crop',
      text: 'OK mình cũng đến sớm 15 phút để khởi động. Ai mang vợt dự phòng không?',
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      seenBy: ['p1', 'p9', 'p3', 'me'],
    },
    {
      id: 'msg_10',
      senderId: 'p1',
      senderName: 'Nguyen Van Anh',
      senderAvatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop',
      text: 'Team ơi nhớ tập trung lúc 6h45 nhé! Sân đã book từ 7h 🏸',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      seenBy: ['p1', 'p9'],
    },
  ],
  chat_private_1: [
    // {
    //   id: 'pm_1',
    //   senderId: 'me',
    //   senderName: 'Bạn',
    //   senderAvatar: '',
    //   text: 'Chào Mai! Mình thấy bạn đăng tìm người chơi tennis, mình cũng đang tìm đối tác ở Q2 🎾',
    //   createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    //   seenBy: ['me', 'p2'],
    // },
    // {
    //   id: 'pm_2',
    //   senderId: 'p2',
    //   senderName: 'Tran Thi Mai',
    //   senderAvatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop',
    //   text: 'Ồ hay quá! Bạn ở khu nào vậy? Mình thường ra sân VTF Academy cuối tuần',
    //   createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
    //   seenBy: ['p2', 'me'],
    // },
    // {
    //   id: 'pm_3',
    //   senderId: 'me',
    //   senderName: 'Bạn',
    //   senderAvatar: '',
    //   text: 'Mình ở Q1, đi VTF không xa. Trình độ mình đang khoảng intermediate, bạn chơi level nào?',
    //   createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
    //   seenBy: ['me', 'p2'],
    // },
    // {
    //   id: 'pm_4',
    //   senderId: 'p2',
    //   senderName: 'Tran Thi Mai',
    //   senderAvatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop',
    //   text: 'Mình cũng intermediate! Hay quá, thế tối nay hoặc tối mai mình ra sân thử không? Tầm 7-9h',
    //   createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    //   seenBy: ['p2', 'me'],
    // },
    // {
    //   id: 'pm_5',
    //   senderId: 'me',
    //   senderName: 'Bạn',
    //   senderAvatar: '',
    //   text: 'Tối nay được! Mình tự book sân nhé, hẹn 8h tối nay ở VTF. Mình sẽ đợi ở cổng vào 😊',
    //   createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    //   seenBy: ['me', 'p2'],
    // },
    // {
    //   id: 'pm_6',
    //   senderId: 'p2',
    //   senderName: 'Tran Thi Mai',
    //   senderAvatar: 'https://images.unsplash.com/photo-1659081443046-268bee889587?w=200&h=200&fit=crop',
    //   text: 'Oke bạn ơi, 8h tối nay nhé! Mình sẽ đợi ở cổng sân 😊',
    //   createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    //   seenBy: ['p2', 'me'],
    // },
  ],
  chat_group_2: [
    {
      id: 'gm_1',
      senderId: 'system',
      senderName: 'Hệ thống',
      senderAvatar: '',
      text: '⚽ Weekend Warriors team đã được tạo tự động sau khi team match thành công!',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      seenBy: [],
      type: 'system',
    },
    {
      id: 'gm_2',
      senderId: 'p6',
      senderName: 'Vo Thanh Tung',
      senderAvatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop&seed=6',
      text: 'Chào team! Mình Tung, leader. Mình chơi tiền vệ, đã 5 năm kinh nghiệm',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
      seenBy: ['p6', 'p10', 'p12', 'me'],
    },
    {
      id: 'gm_3',
      senderId: 'p10',
      senderName: 'Tran Van Binh',
      senderAvatar: 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=200&h=200&fit=crop&seed=10',
      text: 'Binh đây! Chơi hậu vệ là chủ yếu. Team thống nhất lịch tập chưa?',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000).toISOString(),
      seenBy: ['p6', 'p10', 'p12', 'me'],
    },
    {
      id: 'gm_4',
      senderId: 'p6',
      senderName: 'Vo Thanh Tung',
      senderAvatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop&seed=6',
      text: 'Tập thứ 3 thứ 5 lúc 19h ở Champion Field. Ai không OK thì báo mình nhé',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      seenBy: ['p6', 'p10', 'p12', 'me'],
    },
    {
      id: 'gm_5',
      senderId: 'me',
      senderName: 'Bạn',
      senderAvatar: '',
      text: 'Thứ 7 tuần này đá không mọi người?',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      seenBy: ['me', 'p6'],
    },
    {
      id: 'gm_6',
      senderId: 'p6',
      senderName: 'Vo Thanh Tung',
      senderAvatar: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop&seed=6',
      text: 'Được! Mình book sân nhé, 8h sáng',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      seenBy: ['p6', 'me'],
    },
  ],
  chat_private_2: [
    {
      id: 'prm_1',
      senderId: 'me',
      senderName: 'Bạn',
      senderAvatar: '',
      text: 'Anh Quan ơi, anh có nhận dạy cầu lông không ạ? Em muốn học kỹ thuật đánh smash',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      seenBy: ['me', 'p3'],
    },
    {
      id: 'prm_2',
      senderId: 'p3',
      senderName: 'Le Minh Quan',
      senderAvatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=200&h=200&fit=crop',
      text: 'Có chứ! Anh nhận coach cá nhân. Em muốn học smash thì cần build foundation footwork trước đã nhé',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
      seenBy: ['p3', 'me'],
    },
    {
      id: 'prm_3',
      senderId: 'me',
      senderName: 'Bạn',
      senderAvatar: '',
      text: 'Em hiểu rồi. Khi nào anh có thời gian rảnh ạ?',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      seenBy: ['me', 'p3'],
    },
    {
      id: 'prm_4',
      senderId: 'p3',
      senderName: 'Le Minh Quan',
      senderAvatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=200&h=200&fit=crop',
      text: 'Thứ 4 tuần này 6h tối, sân Pro Badminton Club ở Thạch Hòa. Em đến được không?',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
      seenBy: ['p3', 'me'],
    },
    {
      id: 'prm_5',
      senderId: 'me',
      senderName: 'Bạn',
      senderAvatar: '',
      text: 'Được ạ! Em sẽ đến đúng giờ. Cảm ơn anh nhiều 🙏',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
      seenBy: ['me', 'p3'],
    },
    {
      id: 'prm_6',
      senderId: 'p3',
      senderName: 'Le Minh Quan',
      senderAvatar: 'https://images.unsplash.com/photo-1762830445441-bf72461f4799?w=200&h=200&fit=crop',
      text: 'Bạn tiến bộ rất nhiều rồi đó! Thứ 4 mình coach tiếp nhé',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      seenBy: ['p3', 'me'],
    },
  ],
  chat_private_3: [
    {
      id: 'pr3_1',
      senderId: 'p5',
      senderName: 'Hoang Thi Lan',
      senderAvatar: 'https://images.unsplash.com/photo-1761286753856-2f39b4413c1c?w=200&h=200&fit=crop',
      text: 'Chào! Mình thấy bạn muốn tìm đối tác tennis? Mình ở Thạch Thất nhé',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      seenBy: ['p5', 'me'],
    },
    {
      id: 'pr3_2',
      senderId: 'me',
      senderName: 'Bạn',
      senderAvatar: '',
      text: 'Ồ hay quá! Mình đánh singles hay doubles bạn?',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
      seenBy: ['me', 'p5'],
    },
    {
      id: 'pr3_3',
      senderId: 'p5',
      senderName: 'Hoang Thi Lan',
      senderAvatar: 'https://images.unsplash.com/photo-1761286753856-2f39b4413c1c?w=200&h=200&fit=crop',
      text: 'Cả hai! Nhưng mình thích doubles mixed hơn. Bạn có bạn chơi nữa không?',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000).toISOString(),
      seenBy: ['p5', 'me'],
    },
    {
      id: 'pr3_4',
      senderId: 'me',
      senderName: 'Bạn',
      senderAvatar: '',
      text: 'Bạn đánh forehand rất ổn! Học ở đâu vậy?',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString(),
      seenBy: ['me'],
    },
  ],
};

// ─── MOCK ADMIN DATA ──────────────────────────────────────────────────────────

export const MOCK_REPORTS: Report[] = [
  { id: 'r1', type: 'user', reporterId: 'p1', reporterName: 'Nguyen Van Anh', targetId: 'p4', targetName: 'Pham Duc Anh', reason: 'Không đến sân đúng giờ nhiều lần, gây lãng phí của người khác', status: 'pending', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'r2', type: 'post', reporterId: 'p2', reporterName: 'Tran Thi Mai', targetId: 'post_spam', targetName: 'Bài đăng quảng cáo spam', reason: 'Quảng cáo không liên quan đến thể thao, spam group', status: 'pending', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { id: 'r3', type: 'user', reporterId: 'p5', reporterName: 'Hoang Thi Lan', targetId: 'p_fake', targetName: 'Nguyen Fake', reason: 'Profile giả, ảnh không đúng người, đã gặp ngoài đời không khớp', status: 'resolved', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'r4', type: 'user', reporterId: 'p9', reporterName: 'Bui Thi Hoa', targetId: 'p11', targetName: 'Ly Thi Ngoc', reason: 'Chửi thô tục trong group chat sau khi thua trận', status: 'dismissed', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'r5', type: 'post', reporterId: 'p6', reporterName: 'Vo Thanh Tung', targetId: 'post_fake', targetName: 'Bài đăng nội dung sai', reason: 'Đăng thông tin sai về giải đấu, gây hiểu nhầm cho cộng đồng', status: 'pending', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
];

export const MOCK_ADMIN_USERS: AdminUser[] = [
  { id: 'p1', name: 'Nguyen Van Anh', email: 'nvanh@email.com', role: 'player', status: 'active', reputation: 4.8, joinedAt: '2025-01-15', totalMatches: 42 },
  { id: 'p2', name: 'Tran Thi Mai', email: 'ttmai@email.com', role: 'player', status: 'active', reputation: 4.6, joinedAt: '2025-02-03', totalMatches: 31 },
  { id: 'p3', name: 'Le Minh Quan', email: 'lmquan@email.com', role: 'player', status: 'active', reputation: 4.9, joinedAt: '2024-11-20', totalMatches: 89 },
  { id: 'p4', name: 'Pham Duc Anh', email: 'pdanh@email.com', role: 'player', status: 'warned', reputation: 2.9, joinedAt: '2025-03-01', totalMatches: 8 },
  { id: 'p5', name: 'Hoang Thi Lan', email: 'htlan@email.com', role: 'player', status: 'active', reputation: 4.7, joinedAt: '2025-01-28', totalMatches: 55 },
  { id: 'o1', name: 'Sky Court Owner', email: 'owner@skycourt.com', role: 'venueOwner', status: 'active', reputation: 4.5, joinedAt: '2024-10-10', totalMatches: 0 },
  { id: 'p6', name: 'Vo Thanh Tung', email: 'vttung@email.com', role: 'player', status: 'active', reputation: 4.2, joinedAt: '2025-02-14', totalMatches: 27 },
  { id: 'p7', name: 'Nguyen Thi Thu', email: 'ntthu@email.com', role: 'player', status: 'active', reputation: 4.0, joinedAt: '2025-03-05', totalMatches: 6 },
  { id: 'p11', name: 'Ly Thi Ngoc', email: 'ltngoc@email.com', role: 'player', status: 'warned', reputation: 3.1, joinedAt: '2025-02-20', totalMatches: 4 },
  { id: 'p_fake', name: 'Nguyen Fake', email: 'fake@email.com', role: 'player', status: 'banned', reputation: 1.0, joinedAt: '2025-03-10', totalMatches: 0 },
];

// ─── API FUNCTIONS ────────────────────────────────────────────────────────────

export const feedApi = {
  getPosts: async (filters?: { sport?: string; page?: number }): Promise<{ posts: Post[]; nextPage: number | null }> => {
    await delay(600);
    let posts = [...MOCK_POSTS];
    if (filters?.sport && filters.sport !== 'All') {
      posts = posts.filter((p) => p.sport?.toLowerCase() === filters.sport!.toLowerCase());
    }
    const page = filters?.page || 1;
    const limit = 5;
    const sliced = posts.slice(0, page * limit);
    return { posts: sliced, nextPage: sliced.length < posts.length ? page + 1 : null };
  },

  createPost: async (data: { content: string; images?: string[]; sport?: string; location?: string }): Promise<Post> => {
    await delay(700);
    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorId: 'me',
      authorName: 'Bạn',
      authorAvatar: 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=200&h=200&fit=crop',
      content: data.content,
      images: data.images,
      sport: data.sport,
      location: data.location,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
      saves: [],
      shareCount: 0,
    };
    MOCK_POSTS = [newPost, ...MOCK_POSTS];
    return newPost;
  },

  likePost: async (postId: string, userId: string): Promise<void> => {
    await delay(200);
    const post = MOCK_POSTS.find((p) => p.id === postId);
    if (post) {
      if (post.likes.includes(userId)) {
        post.likes = post.likes.filter((id) => id !== userId);
      } else {
        post.likes = [...post.likes, userId];
      }
    }
  },

  addComment: async (postId: string, content: string): Promise<PostComment> => {
    await delay(400);
    const comment: PostComment = {
      id: `c_${Date.now()}`,
      authorId: 'me',
      authorName: 'Bạn',
      authorAvatar: 'https://images.unsplash.com/photo-1630610280030-da8fbc7ca25a?w=200&h=200&fit=crop',
      content,
      createdAt: new Date().toISOString(),
      likes: [],
    };
    const post = MOCK_POSTS.find((p) => p.id === postId);
    if (post) post.comments = [...post.comments, comment];
    return comment;
  },

  savePost: async (postId: string, userId: string): Promise<void> => {
    await delay(200);
    const post = MOCK_POSTS.find((p) => p.id === postId);
    if (post) {
      if (post.saves.includes(userId)) {
        post.saves = post.saves.filter((id) => id !== userId);
      } else {
        post.saves = [...post.saves, userId];
      }
    }
  },
};

export const chatApi = {
  getChats: async (): Promise<ChatRoom[]> => {
    await delay(500);
    return MOCK_CHATS;
  },

  getMessages: async (chatId: string): Promise<Message[]> => {
    await delay(400);
    return MOCK_MESSAGES[chatId] || [];
  },

  sendMessage: async (chatId: string, text: string): Promise<Message> => {
    await delay(300);
    const msg: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'me',
      senderName: 'Bạn',
      senderAvatar: '',
      text,
      createdAt: new Date().toISOString(),
      seenBy: ['me'],
      type: 'text',
    };
    if (!MOCK_MESSAGES[chatId]) MOCK_MESSAGES[chatId] = [];
    return msg;
  },
};

export const ratingApi = {
  submitRating: async (data: RatingSubmit): Promise<{ success: boolean; newReputation: number }> => {
    await delay(800);
    const newRep = Math.min(5, 4.0 + data.rating * 0.1);
    return { success: true, newReputation: parseFloat(newRep.toFixed(1)) };
  },

  getActivityInfo: async (activityId: string): Promise<{ type: string; targetName: string; targetAvatar: string; date: string }> => {
    await delay(300);
    const activities: Record<string, { type: string; targetName: string; targetAvatar: string; date: string }> = {
      'bk_001': { type: 'booking', targetName: 'Sky Court Badminton', targetAvatar: 'https://images.unsplash.com/photo-1771854400123-2a23cb720c04?w=200&h=200&fit=crop', date: '20/03/2026' },
      'bk_002': { type: 'booking', targetName: 'VTF Tennis Academy', targetAvatar: 'https://images.unsplash.com/photo-1762423570069-6926efe1232a?w=200&h=200&fit=crop', date: '10/03/2026' },
      'team_1': { type: 'match', targetName: 'Weekend Warriors', targetAvatar: '', date: '15/03/2026' },
    };
    return activities[activityId] || { type: 'match', targetName: 'Hoạt động thể thao', targetAvatar: '', date: '15/03/2026' };
  },
};

export const adminApi = {
  getReports: async (): Promise<Report[]> => {
    await delay(400);
    return MOCK_REPORTS;
  },

  getUsers: async (search?: string): Promise<AdminUser[]> => {
    await delay(400);
    let users = [...MOCK_ADMIN_USERS];
    if (search) {
      const q = search.toLowerCase();
      users = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return users;
  },

  resolveReport: async (reportId: string, action: 'resolve' | 'dismiss'): Promise<void> => {
    await delay(500);
    const report = MOCK_REPORTS.find((r) => r.id === reportId);
    if (report) report.status = action === 'resolve' ? 'resolved' : 'dismissed';
  },

  changeUserStatus: async (userId: string, status: AdminUser['status']): Promise<void> => {
    await delay(500);
    const user = MOCK_ADMIN_USERS.find((u) => u.id === userId);
    if (user) user.status = status;
  },
};
