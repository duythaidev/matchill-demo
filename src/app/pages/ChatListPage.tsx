import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Search, MessageSquare, Users, Lock } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { useChatStore } from '../stores/chatStore';
import { chatApi, ChatRoom } from '../api/feedChatApi';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins}p`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' });
}

function getDisplayInfo(chat: ChatRoom) {
  if (chat.type === 'group') {
    return {
      name: chat.name || 'Group Chat',
      avatar: null,
      emoji: chat.groupAvatar || '👥',
      subtitle: `${chat.participants.length} thành viên`,
    };
  }
  const other = chat.participants.find((p) => p.userId !== 'me');
  return {
    name: other?.name || 'Unknown',
    avatar: other?.avatar,
    emoji: null,
    subtitle: '',
  };
}

function ChatItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-3 w-8" />
    </div>
  );
}

export function ChatListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { chats, isLoading, setChats, setLoading, markAsRead } = useChatStore();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await chatApi.getChats();
        setChats(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = chats.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const info = getDisplayInfo(c);
    return info.name.toLowerCase().includes(q) || c.lastMessage?.text.toLowerCase().includes(q);
  });

  const handleOpen = (chat: ChatRoom) => {
    markAsRead(chat.id);
    navigate(`/chat/${chat.id}`);
  };

  const totalUnread = chats.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <div className="container mx-auto max-w-lg px-0 sm:px-4 py-0 sm:py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-5 sm:pt-0 pb-4"
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm shadow-teal-600/30">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1>Tin nhắn</h1>
          </div>
          {totalUnread > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {totalUnread} mới
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm ml-12">{chats.length} cuộc trò chuyện</p>
      </motion.div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm cuộc trò chuyện..."
            className="pl-9 bg-secondary/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="divide-y divide-border">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <ChatItemSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground px-4">
            <p className="text-3xl mb-2">💬</p>
            <p>Không tìm thấy cuộc trò chuyện nào.</p>
          </div>
        ) : (
          filtered.map((chat, i) => {
            const info = getDisplayInfo(chat);
            const lastMsgMine = chat.lastMessage?.senderId === 'me';
            return (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleOpen(chat)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/40 transition-colors text-left relative"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {info.avatar ? (
                    <img src={info.avatar} alt={info.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-xl">
                      {info.emoji}
                    </div>
                  )}
                  {chat.type === 'private' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card" />
                  )}
                  {chat.type === 'group' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-teal-600 rounded-full border-2 border-card flex items-center justify-center">
                      <Users className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'font-bold' : 'font-medium'}`}>
                      {info.name}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {chat.lastMessage ? timeAgo(chat.lastMessage.createdAt) : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {chat.type === 'group' && chat.lastMessage && !lastMsgMine
                        ? `${chat.lastMessage.senderName.split(' ').pop()}: `
                        : lastMsgMine
                        ? 'Bạn: '
                        : ''}
                      {chat.lastMessage?.text}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="shrink-0 w-5 h-5 bg-teal-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                      </span>
                    )}
                  </div>
                  {info.subtitle && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{info.subtitle}</p>
                  )}
                </div>
              </motion.button>
            );
          })
        )}
      </div>

      {/* Empty state for no chats */}
      {!isLoading && chats.length === 0 && (
        <div className="text-center py-20 text-muted-foreground px-4">
          <p className="text-4xl mb-3">💬</p>
          <p className="font-medium">Chưa có cuộc trò chuyện nào.</p>
          <p className="text-sm mt-1">Tham gia team hoặc mời đồng đội để bắt đầu chat!</p>
        </div>
      )}

      {/* Info note */}
      <div className="px-4 py-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="w-3.5 h-3.5 shrink-0" />
        <span>Tin nhắn được mã hóa end-to-end. Chỉ bạn và người tham gia có thể đọc.</span>
      </div>
    </div>
  );
}
