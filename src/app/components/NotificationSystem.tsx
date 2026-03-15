import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

// Simulated real-time notifications
const NOTIFICATIONS = [
  {
    delay: 18000,
    fn: (navigate: (path: string) => void) => {
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=200&h=200&fit=crop"
              className="w-10 h-10 rounded-full object-cover shrink-0"
              alt=""
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Nguyen Van Anh</p>
              <p className="text-xs text-gray-500">Mời bạn vào team Cầu lông 🏸</p>
            </div>
            <button
              onClick={() => { toast.dismiss(t.id); navigate('/chat/chat_group_1'); }}
              className="text-xs text-teal-600 font-semibold shrink-0 hover:underline"
            >
              Xem
            </button>
          </div>
        ),
        { duration: 6000, id: 'notif_invite_1' }
      );
    },
  },
  {
    delay: 35000,
    fn: (navigate: (path: string) => void) => {
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-lg shrink-0">
              🏸
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Team Cầu Lông Sky Court</p>
              <p className="text-xs text-gray-500">Anh: "Team ơi nhớ tập trung lúc 6h45 nhé!"</p>
            </div>
            <button
              onClick={() => { toast.dismiss(t.id); navigate('/chat/chat_group_1'); }}
              className="text-xs text-teal-600 font-semibold shrink-0 hover:underline"
            >
              Reply
            </button>
          </div>
        ),
        { duration: 6000, id: 'notif_msg_1' }
      );
    },
  },
  {
    delay: 55000,
    fn: (navigate: (path: string) => void) => {
      toast.success('🎉 Team "Weekend Warriors" vừa xác nhận lịch đá bóng thứ 7!', {
        duration: 5000,
        id: 'notif_confirm_1',
      });
    },
  },
];

export function NotificationSystem() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const fired = useRef(false);

  // useEffect(() => {
  //   if (!isAuthenticated || fired.current) return;
  //   fired.current = true;

  //   NOTIFICATIONS.forEach(({ delay, fn }) => {
  //     const t = setTimeout(() => fn(navigate), delay);
  //     timersRef.current.push(t);
  //   });

  //   return () => {
  //     timersRef.current.forEach(clearTimeout);
  //   };
  // }, [isAuthenticated]);

  return null;
}
