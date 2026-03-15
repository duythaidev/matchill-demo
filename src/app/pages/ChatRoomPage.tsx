import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Send, Smile, Phone, Video, Info } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { chatApi, Message, ChatRoom, MOCK_CHATS } from '../api/feedChatApi';
import toast from 'react-hot-toast';

const EMOJIS = [
  '😀','😂','🥰','😎','🤩','🙌','👍','💪','🔥','✨','🎉','🏆',
  '⚽','🏀','🎾','🏸','🏓','🥊','🏃','🤸','👋','🙏','💯','😤',
  '🥳','😅','🤣','❤️','💚','🫡','👌','🎯','⏰','📍','🗓️','🔑',
];

function formatMsgTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatDayHeader(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hôm nay';
  if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua';
  return d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' });
}

function shouldShowDayHeader(messages: Message[], index: number) {
  if (index === 0) return true;
  const curr = new Date(messages[index].createdAt).toDateString();
  const prev = new Date(messages[index - 1].createdAt).toDateString();
  return curr !== prev;
}

function getDisplayInfo(chat: ChatRoom) {
  if (chat.type === 'group') {
    return {
      name: chat.name || 'Group Chat',
      avatar: null,
      emoji: chat.groupAvatar || '👥',
      sub: `${chat.participants.length} thành viên`,
      isGroup: true,
    };
  }
  const other = chat.participants.find((p) => p.userId !== 'me');
  return {
    name: other?.name || 'Unknown',
    avatar: other?.avatar,
    emoji: null,
    sub: 'Online',
    isGroup: false,
  };
}

function MessageBubble({ msg, showAvatar, isLastInGroup }: {
  msg: Message;
  showAvatar: boolean;
  isLastInGroup: boolean;
}) {
  const isMe = msg.senderId === 'me';
  const isSystem = msg.type === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
          {msg.text}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isMe && (
        <div className="w-7 shrink-0">
          {showAvatar && (
            <img src={msg.senderAvatar} alt={msg.senderName} className="w-7 h-7 rounded-full object-cover" />
          )}
        </div>
      )}

      <div className={`flex flex-col gap-0.5 max-w-[72%] ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && showAvatar && (
          <span className="text-xs text-muted-foreground px-1">{msg.senderName.split(' ').pop()}</span>
        )}

        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isMe
              ? 'bg-teal-600 text-white rounded-br-md'
              : 'bg-secondary text-foreground rounded-bl-md'
          }`}
        >
          {msg.text}
        </div>

        {isLastInGroup && (
          <div className={`flex items-center gap-1 text-xs text-muted-foreground px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
            <span>{formatMsgTime(msg.createdAt)}</span>
            {isMe && msg.seenBy.length > 1 && (
              <span className="text-teal-600 dark:text-teal-400">✓✓</span>
            )}
            {isMe && msg.seenBy.length <= 1 && (
              <span className="text-muted-foreground/50">✓</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ChatRoomPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messagesByRoom, setMessages, addMessage, updateLastMessage, setLoading } = useChatStore();

  const chat = MOCK_CHATS.find((c) => c.id === chatId);
  const messages = messagesByRoom[chatId || ''] || [];

  useEffect(() => {
    if (!chatId) return;
    const load = async () => {
      setLoading(true);
      try {
        const msgs = await chatApi.getMessages(chatId);
        setMessages(chatId, msgs);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!chat) return;
    const timer = setTimeout(() => setIsTyping(true), 3000);
    const timer2 = setTimeout(() => setIsTyping(false), 6000);
    return () => { clearTimeout(timer); clearTimeout(timer2); };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !chatId || sendingMsg) return;
    const text = input.trim();
    setInput('');
    setShowEmoji(false);
    setSendingMsg(true);
    try {
      const msg = await chatApi.sendMessage(chatId, text);
      addMessage(chatId, msg);
      updateLastMessage(chatId, msg);
    } finally {
      setSendingMsg(false);
    }
    inputRef.current?.focus();
  };

  const handleEmojiClick = (emoji: string) => {
    setInput((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  if (!chat) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-muted-foreground">
          <p className="text-3xl mb-2">💬</p>
          <p>Không tìm thấy cuộc trò chuyện.</p>
          <button onClick={() => navigate('/chat')} className="mt-3 text-teal-600 hover:underline text-sm">
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  const info = getDisplayInfo(chat);

  const isSameSenderAsPrev = (i: number) =>
    i > 0 && messages[i].senderId === messages[i - 1].senderId &&
    messages[i].type !== 'system' && messages[i - 1].type !== 'system';
  const isSameSenderAsNext = (i: number) =>
    i < messages.length - 1 && messages[i].senderId === messages[i + 1].senderId &&
    messages[i + 1].type !== 'system';

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/95 backdrop-blur-sm shrink-0"
      >
        <button
          onClick={() => navigate('/chat')}
          className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          {info.avatar ? (
            <div className="relative shrink-0">
              <img src={info.avatar} alt={info.name} className="w-10 h-10 rounded-full object-cover" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-lg shrink-0">
              {info.emoji}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{info.name}</p>
            <p className="text-xs text-muted-foreground">
              {isTyping ? (
                <span className="text-teal-600 dark:text-teal-400 animate-pulse">đang nhập...</span>
              ) : (
                info.sub
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!info.isGroup && (
            <>
              <button
                onClick={() => toast('📞 Tính năng gọi điện sắp ra mắt!', { icon: '🔔' })}
                className="p-2 rounded-full text-muted-foreground hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                onClick={() => toast('📹 Tính năng gọi video sắp ra mắt!', { icon: '🔔' })}
                className="p-2 rounded-full text-muted-foreground hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
              >
                <Video className="w-5 h-5" />
              </button>
            </>
          )}
          {info.isGroup && (
            <button
              onClick={() => toast(
                `👥 ${chat.participants.length} thành viên: ${chat.participants.map((p) => p.name.split(' ').pop()).join(', ')}`,
                { duration: 5000 }
              )}
              className="p-2 rounded-full text-muted-foreground hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
            >
              <Info className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Group member chips */}
      {info.isGroup && (
        <div className="flex gap-1.5 px-4 py-2 bg-secondary/30 border-b border-border overflow-x-auto scrollbar-hide shrink-0">
          {chat.participants.map((p) => (
            <div key={p.userId} className="flex items-center gap-1.5 shrink-0 bg-card rounded-full px-2.5 py-1 border border-border">
              {p.avatar ? (
                <img src={p.avatar} alt={p.name} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs">
                  {p.name.charAt(0)}
                </div>
              )}
              <span className="text-xs truncate max-w-20">
                {p.userId === 'me' ? 'Bạn' : p.name.split(' ').pop()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 overscroll-contain">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-3xl mb-2">👋</p>
              <p className="text-sm">Hãy gửi lời chào đầu tiên!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={msg.id}>
                {shouldShowDayHeader(messages, i) && (
                  <div className="flex justify-center my-3">
                    <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                      {formatDayHeader(msg.createdAt)}
                    </span>
                  </div>
                )}
                <div className={`${isSameSenderAsPrev(i) ? 'mt-0.5' : 'mt-3'}`}>
                  <MessageBubble
                    msg={msg}
                    showAvatar={!isSameSenderAsPrev(i)}
                    isLastInGroup={!isSameSenderAsNext(i)}
                  />
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="flex items-end gap-2 mt-3"
                >
                  <div className="w-7 h-7 bg-secondary rounded-full" />
                  <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-card shrink-0"
          >
            <div className="grid grid-cols-9 gap-1 p-3">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-xl p-1.5 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Bar */}
      <div className="px-4 py-3 border-t border-border bg-card/95 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmoji((s) => !s)}
            className={`p-2 rounded-full transition-colors shrink-0 ${
              showEmoji
                ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <Smile className="w-5 h-5" />
          </button>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-secondary/60 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!input.trim() || sendingMsg}
            className="w-10 h-10 rounded-full bg-teal-600 hover:bg-teal-700 disabled:bg-muted text-white flex items-center justify-center shrink-0 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
