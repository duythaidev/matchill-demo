import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { Mail, Lock, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuthStore } from '../stores/authStore';
import { api, DEMO_ACCOUNTS } from '../api/api';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const ROLE_CARD_STYLE = {
  player: {
    border: 'border-teal-200 dark:border-teal-700 hover:border-teal-400 dark:hover:border-teal-500',
    activeBorder: 'border-teal-500 ring-1 ring-teal-500/30',
    bg: 'bg-teal-50/60 dark:bg-teal-900/10',
    badgeBg: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    dot: 'bg-teal-500',
    button: 'bg-teal-600 hover:bg-teal-700',
  },
  venueOwner: {
    border: 'border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500',
    activeBorder: 'border-blue-500 ring-1 ring-blue-500/30',
    bg: 'bg-blue-50/60 dark:bg-blue-900/10',
    badgeBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    dot: 'bg-blue-500',
    button: 'bg-blue-600 hover:bg-blue-700',
  },
  admin: {
    border: 'border-red-200 dark:border-red-700 hover:border-red-400 dark:hover:border-red-500',
    activeBorder: 'border-red-500 ring-1 ring-red-500/30',
    bg: 'bg-red-50/60 dark:bg-red-900/10',
    badgeBg: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    dot: 'bg-red-500',
    button: 'bg-red-500 hover:bg-red-600',
  },
};

export function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);
  const [quickLoadingIndex, setQuickLoadingIndex] = useState<number | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<number | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await api.login(data);
      setUser(response.user, response.token);
      toast.success(`Chào mừng, ${response.user.fullName.split(' ').pop()}! 👋`);
      const role = response.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'venueOwner' ? '/my-venues' : '/discover');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (index: number) => {
    const acc = DEMO_ACCOUNTS[index];
    setQuickLoadingIndex(index);
    setSelectedDemo(index);
    try {
      const response = await api.login({ email: acc.email, password: acc.password });
      setUser(response.user, response.token);
      toast.success(`Chào mừng, ${acc.name.split(' ').pop()}! ${acc.emoji}`);
      const role = response.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'venueOwner' ? '/my-venues' : '/discover');
    } catch (error) {
      toast.error('Quick login thất bại');
    } finally {
      setQuickLoadingIndex(null);
    }
  };

  const handleSelectDemo = (index: number) => {
    setSelectedDemo(index);
    setValue('email', DEMO_ACCOUNTS[index].email);
    setValue('password', DEMO_ACCOUNTS[index].password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-teal-50 via-background to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md space-y-5"
      >

        {/* Logo */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', damping: 14 }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center shadow-xl shadow-teal-500/25"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 dark:from-teal-400 dark:to-teal-500 bg-clip-text text-transparent">
            Matchill
          </h1>
          <p className="text-muted-foreground text-sm">Kết nối người chơi thể thao</p>
        </div>

        {/* Demo Account Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-0.5">
            ⚡ Đăng nhập nhanh — Tài khoản demo
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc, i) => {
              const style = ROLE_CARD_STYLE[acc.role];
              const isSelected = selectedDemo === i;
              const isLoadingThis = quickLoadingIndex === i;
              return (
                <motion.div
                  key={acc.email}
                  whileTap={{ scale: 0.97 }}
                  className={`relative border-2 rounded-2xl p-3 cursor-pointer transition-all ${style.bg} ${
                    isSelected ? style.activeBorder : style.border
                  }`}
                  onClick={() => handleSelectDemo(i)}
                >
                  {/* Active dot */}
                  {isSelected && (
                    <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${style.dot}`} />
                  )}
                  <div className="space-y-2">
                    <div className="text-2xl">{acc.emoji}</div>
                    <div>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${style.badgeBg}`}>
                        {acc.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">{acc.description}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleQuickLogin(i); }}
                      disabled={isLoadingThis || isLoading}
                      className={`w-full flex items-center justify-center gap-1 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors disabled:opacity-60 ${style.button}`}
                    >
                      {isLoadingThis ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>Vào ngay <ChevronRight className="w-3 h-3" /></>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 text-muted-foreground">hoặc đăng nhập thủ công</span>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-9"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  {...register('password')}
                />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Đang đăng nhập...</>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>

          {/* Hint for selected demo */}
          {selectedDemo !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`text-xs rounded-xl px-3 py-2.5 border ${
                ROLE_CARD_STYLE[DEMO_ACCOUNTS[selectedDemo].role].bg
              } ${ROLE_CARD_STYLE[DEMO_ACCOUNTS[selectedDemo].role].border}`}
            >
              <span className="font-semibold">{DEMO_ACCOUNTS[selectedDemo].emoji} {DEMO_ACCOUNTS[selectedDemo].label}</span>
              {' '}· {DEMO_ACCOUNTS[selectedDemo].email} / mật khẩu: <span className="font-mono font-semibold">123456</span>
            </motion.div>
          )}

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Chưa có tài khoản? </span>
            <Link to="/register" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 font-medium">
              Đăng ký ngay
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
