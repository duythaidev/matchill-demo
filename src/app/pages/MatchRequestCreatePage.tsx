import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Users, MapPin, Calendar, Star, Swords } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider';
import { useMatchStore } from '../stores/matchStore';
import { matchApi } from '../api/matchVenueApi';
import toast from 'react-hot-toast';

const SPORTS = [
  { value: 'Badminton', label: '🏸 Cầu lông' },
  { value: 'Tennis', label: '🎾 Tennis' },
  { value: 'Pickleball', label: '🏓 Pickleball' },
  { value: 'Football', label: '⚽ Bóng đá' },
  { value: 'Table Tennis', label: '🏓 Bóng bàn' },
  { value: 'Swimming', label: '🏊 Bơi lội' },
];

const schema = z.object({
  sport: z.string().min(1, 'Chọn môn thể thao'),
  date: z.string().min(1, 'Chọn ngày'),
  timeStart: z.string().min(1, 'Chọn giờ bắt đầu'),
  timeEnd: z.string().min(1, 'Chọn giờ kết thúc'),
  playersNeeded: z.number().min(2).max(8),
});

type FormData = z.infer<typeof schema>;

export function MatchRequestCreatePage() {
  const navigate = useNavigate();
  const { setCurrentRequest, setRequestId, setSuggestions, setLoading, setHasMatchedFromRequest } =
    useMatchStore();
  const [radiusKm, setRadiusKm] = useState(10);
  const [skillRange, setSkillRange] = useState([2, 4]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sport: '',
      date: today,
      timeStart: '07:00',
      timeEnd: '09:00',
      playersNeeded: 2,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setLoading(true);
    try {
      const timeStart = `${data.date}T${data.timeStart}:00`;
      const timeEnd = `${data.date}T${data.timeEnd}:00`;

      const request = {
        sport: data.sport,
        location: { lat: 10.776, lng: 106.7009 },
        radiusKm,
        timeStart,
        timeEnd,
        skillMin: skillRange[0],
        skillMax: skillRange[1],
        playersNeeded: data.playersNeeded,
      };

      const result = await matchApi.createMatchRequest(request);
      setCurrentRequest(request);
      setRequestId(result.requestId);

      toast.loading('🔍 Đang tìm đồng đội phù hợp...', { id: 'finding' });

      const suggestions = await matchApi.getMatchSuggestions(result.requestId, {
        sport: data.sport,
        maxDistance: radiusKm,
      });

      toast.dismiss('finding');
      setSuggestions(suggestions);
      setHasMatchedFromRequest(true);
      toast.success(`🎉 Tìm thấy ${suggestions.length} đồng đội phù hợp!`);
      navigate('/discover');
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm shadow-teal-600/30">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1>Tạo Team Request</h1>
            <p className="text-sm text-muted-foreground">
              Hệ thống tự ghép đồng đội phù hợp cho bạn
            </p>
          </div>
        </div>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Sport Select */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Star className="w-4 h-4 text-teal-600" />
            Môn thể thao
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Controller
              name="sport"
              control={control}
              render={({ field }) => (
                <>
                  {SPORTS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => field.onChange(s.value)}
                      className={`p-3 rounded-xl border text-sm text-left transition-all ${
                        field.value === s.value
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                          : 'border-border hover:border-teal-400 text-muted-foreground'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </>
              )}
            />
          </div>
          {errors.sport && (
            <p className="text-destructive text-xs">{errors.sport.message}</p>
          )}
        </div>

        {/* Location Radius */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <Label className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600" />
            Bán kính tìm đồng đội:{' '}
            <span className="text-teal-600 dark:text-teal-400 font-semibold">
              {radiusKm} km
            </span>
          </Label>
          <Slider
            min={1}
            max={50}
            step={1}
            value={[radiusKm]}
            onValueChange={([v]) => setRadiusKm(v)}
            className="[&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-teal-600"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 km</span>
            <span>50 km</span>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            Thời gian chơi
          </Label>
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Ngày</Label>
              <Input
                type="date"
                min={today}
                {...register('date')}
                className="cursor-pointer"
              />
              {errors.date && (
                <p className="text-destructive text-xs mt-1">{errors.date.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-muted-foreground mb-1.5 block">Giờ bắt đầu</Label>
                <Input type="time" {...register('timeStart')} />
                {errors.timeStart && (
                  <p className="text-destructive text-xs mt-1">{errors.timeStart.message}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1.5 block">Giờ kết thúc</Label>
                <Input type="time" {...register('timeEnd')} />
                {errors.timeEnd && (
                  <p className="text-destructive text-xs mt-1">{errors.timeEnd.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Skill Range */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <Label className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Trình độ đồng đội mong muốn:{' '}
            <span className="text-teal-600 dark:text-teal-400 font-semibold">
              {skillRange[0]}★ – {skillRange[1]}★
            </span>
          </Label>
          <Slider
            min={1}
            max={5}
            step={1}
            value={skillRange}
            onValueChange={(v) => setSkillRange(v)}
            className="[&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-teal-600"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n}>{n}★</span>
            ))}
          </div>
        </div>

        {/* Players Needed */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />
            Số thành viên cần tìm thêm
          </Label>
          <Controller
            name="playersNeeded"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => field.onChange(Math.max(2, field.value - 1))}
                  disabled={field.value <= 2}
                >
                  –
                </Button>
                <span className="text-2xl font-bold text-teal-600 dark:text-teal-400 w-8 text-center">
                  {field.value}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => field.onChange(Math.min(8, field.value + 1))}
                  disabled={field.value >= 8}
                >
                  +
                </Button>
                <span className="text-sm text-muted-foreground">người (tối đa 8)</span>
              </div>
            )}
          />
          <p className="text-xs text-muted-foreground">
            💡 Khi team đủ người, group chat tự động được tạo cho cả đội!
          </p>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang tìm đồng đội...
            </>
          ) : (
            <>
              <Swords className="w-5 h-5" />
              Tạo Team Request
            </>
          )}
        </Button>
      </motion.form>
    </div>
  );
}