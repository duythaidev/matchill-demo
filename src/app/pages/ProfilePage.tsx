import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera, MapPin, Star, ChevronDown, ChevronUp,
  TrendingUp, Activity, Medal, Edit3, Save, X,
  Gamepad2, Target, Calendar,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Badge } from '../components/ui/badge';
import { useAuthStore } from '../stores/authStore';
import { api } from '../api/api';
import { getBadgeProgress } from '../lib/badgeSystem';
import { AchievementsGrid } from '../components/AchievementBadge';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  age: z.number().min(13).max(100).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  city: z.string().min(2, 'Vui lòng nhập thành phố'),
  bio: z.string().max(500).optional(),
});
type ProfileFormData = z.infer<typeof profileSchema>;

const SPORTS_OPTIONS = ['Badminton','Tennis','Pickleball','Football','Basketball','Volleyball','Table Tennis','Squash','Swimming','Golf'];
const SPORT_ICONS: Record<string, string> = {
  Badminton: '🏸', Tennis: '🎾', Pickleball: '🏓', Football: '⚽',
  Basketball: '🏀', Volleyball: '🏐', 'Table Tennis': '🏓', Squash: '🎯',
  Swimming: '🏊', Golf: '⛳',
};
const SKILL_LABELS = ['','Mới bắt đầu','Cơ bản','Trung bình','Khá','Chuyên nghiệp'];

export function ProfilePage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [isLoading, setIsLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(currentUser?.avatarUrl);
  const [selectedSports, setSelectedSports] = useState<string[]>(currentUser?.sports || []);
  const [skillLevel, setSkillLevel] = useState(currentUser?.skillLevel || 3);
  const [radiusKm, setRadiusKm] = useState(currentUser?.radiusKm || 10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const enrichedUser = currentUser
    ? { ...currentUser, totalGames: 18, teamRequestsCreated: 2 }
    : null;
  const badgeProgress = enrichedUser ? getBadgeProgress(enrichedUser) : [];

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: currentUser?.fullName || '',
      age: currentUser?.age,
      gender: currentUser?.gender,
      city: currentUser?.location.city || '',
      bio: currentUser?.bio || '',
    },
  });

  useEffect(() => {
    if (currentUser) {
      setValue('fullName', currentUser.fullName);
      setValue('age', currentUser.age);
      setValue('gender', currentUser.gender);
      setValue('city', currentUser.location.city);
      setValue('bio', currentUser.bio || '');
      setSelectedSports(currentUser.sports);
      setSkillLevel(currentUser.skillLevel);
      setRadiusKm(currentUser.radiusKm);
      setAvatarPreview(currentUser.avatarUrl);
    }
  }, [currentUser, setValue]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const toggleSport = (sport: string) =>
    setSelectedSports((prev) => prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const updates = {
        fullName: data.fullName,
        age: data.age,
        gender: data.gender,
        location: { city: data.city },
        bio: data.bio,
        sports: selectedSports,
        skillLevel,
        radiusKm,
        avatarUrl: avatarPreview,
      };
      await api.updateProfile(updates);
      updateUser(updates);
      toast.success('Hồ sơ đã được cập nhật! 🎉');
      setEditOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Cập nhật thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) return null;

  const unlockedCount = badgeProgress.filter((b) => b.unlocked).length;
  const initials = currentUser.fullName.split(' ').map((n) => n[0]).slice(-2).join('').toUpperCase();

  const ROLE_LABEL: Record<string, string> = {
    player: '🏸 Người chơi',
    venueOwner: '🏟️ Chủ sân',
    admin: '🛡️ Admin',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO HEADER ──────────────────────────────────────────────────────── */}
      <div className="relative">
        {/* Cover */}
        <div className="h-40 sm:h-52 bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
          />
          <motion.div
            animate={{ x: [0, 10, 0], y: [0, -5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full blur-2xl"
          />
        </div>

        {/* Avatar + info row */}
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 sm:-mt-16 pb-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <motion.div
                whileHover={{ scale: 1.03 }}
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-700 ring-4 ring-background shadow-xl overflow-hidden cursor-pointer"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                    {initials}
                  </div>
                )}
              </motion.div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-1.5 bg-teal-600 rounded-lg text-white hover:bg-teal-700 shadow"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0 pt-2">
              <div className="flex flex-wrap items-start gap-2">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold truncate">{currentUser.fullName}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      {ROLE_LABEL[currentUser.role ?? 'player']}
                    </span>
                    {currentUser.location.city && (
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />{currentUser.location.city}
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 font-medium">
                      🏆 {unlockedCount}/{badgeProgress.length} thành tựu
                    </span>
                  </div>
                </div>
              </div>
              {currentUser.bio && (
                <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{currentUser.bio}</p>
              )}
            </div>

            {/* Edit button */}
            <Button
              onClick={() => setEditOpen(!editOpen)}
              variant={editOpen ? 'default' : 'outline'}
              size="sm"
              className={`shrink-0 gap-2 ${editOpen ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}`}
            >
              {editOpen ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {editOpen ? 'Đóng' : 'Chỉnh sửa'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 pb-12 space-y-5">

        {/* ── STATS ROW ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: TrendingUp, label: 'Điểm danh tiếng', value: currentUser.reputation.score, color: 'text-teal-600' },
            { icon: Activity, label: 'Tỷ lệ tham gia', value: `${currentUser.reputation.attendanceRate}%`, color: 'text-blue-500' },
            { icon: Star, label: 'Đánh giá TB', value: currentUser.reputation.avgRating ? `${currentUser.reputation.avgRating}★` : 'N/A', color: 'text-yellow-500' },
            { icon: Gamepad2, label: 'Trận đã chơi', value: enrichedUser?.totalGames ?? 0, color: 'text-purple-500' },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card border border-border rounded-2xl p-3 text-center"
            >
              <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
              <div className="text-lg font-bold">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── SPORTS TAGS ───────────────────────────────────────────────────── */}
        {currentUser.sports.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {currentUser.sports.map((s) => (
              <span key={s} className="flex items-center gap-1 px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium border border-teal-200 dark:border-teal-700">
                {SPORT_ICONS[s] ?? '🏅'} {s}
              </span>
            ))}
            <span className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm text-muted-foreground border border-border">
              <Target className="w-3.5 h-3.5" /> Skill: {SKILL_LABELS[skillLevel]}
            </span>
            <span className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm text-muted-foreground border border-border">
              <MapPin className="w-3.5 h-3.5" /> Bán kính {radiusKm}km
            </span>
          </div>
        )}

        {/* ── ACHIEVEMENTS (MAIN SECTION) ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-4 sm:p-5"
        >
          <AchievementsGrid badges={badgeProgress} size="md" showHeader />
        </motion.div>

        {/* ── EDIT FORM (collapsible) ────────────────────────────────────────── */}
        <AnimatePresence>
          {editOpen && (
            <motion.div
              key="edit-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Edit3 className="w-5 h-5 text-teal-600" />
                  <h2 className="font-bold text-base">Chỉnh sửa thông tin</h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label>Họ và tên</Label>
                    <Input {...register('fullName')} />
                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                  </div>

                  {/* Age + Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Tuổi</Label>
                      <Input type="number" {...register('age', { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Giới tính</Label>
                      <Select onValueChange={(v) => setValue('gender', v as any)} defaultValue={currentUser.gender}>
                        <SelectTrigger><SelectValue placeholder="Chọn giới tính" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Nam</SelectItem>
                          <SelectItem value="female">Nữ</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Skill Level */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Trình độ</Label>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((n) => (
                            <Star key={n} className={`w-4 h-4 ${n <= skillLevel ? 'fill-teal-500 text-teal-500' : 'text-slate-300'}`} />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-teal-600">{SKILL_LABELS[skillLevel]}</span>
                      </div>
                    </div>
                    <Slider value={[skillLevel]} onValueChange={(v) => setSkillLevel(v[0])} min={1} max={5} step={1} />
                  </div>

                  {/* Sports */}
                  <div className="space-y-2">
                    <Label>Môn thể thao</Label>
                    <div className="flex flex-wrap gap-2">
                      {SPORTS_OPTIONS.map((sport) => (
                        <motion.button
                          key={sport}
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleSport(sport)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                            selectedSports.includes(sport)
                              ? 'bg-teal-600 border-teal-600 text-white'
                              : 'bg-card border-border hover:border-teal-400 text-foreground'
                          }`}
                        >
                          {SPORT_ICONS[sport] ?? '🏅'} {sport}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Thành phố</Label>
                    <Input placeholder="TP. Hồ Chí Minh" {...register('city')} />
                    {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                  </div>

                  {/* Radius */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Bán kính tìm kiếm</Label>
                      <span className="text-sm font-semibold text-teal-600">{radiusKm} km</span>
                    </div>
                    <Slider value={[radiusKm]} onValueChange={(v) => setRadiusKm(v[0])} min={1} max={50} step={1} />
                  </div>

                  {/* Bio */}
                  <div className="space-y-1.5">
                    <Label>Bio</Label>
                    <Textarea placeholder="Giới thiệu bản thân..." rows={3} {...register('bio')} />
                    {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2"
                    disabled={isLoading}
                  >
                    <Save className="w-4 h-4" />
                    {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
