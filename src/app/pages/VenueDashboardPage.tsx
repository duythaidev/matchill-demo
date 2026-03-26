import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { format, startOfWeek, addDays } from 'date-fns';
import {
  ArrowLeft, Building2, Star, MapPin, Wallet, TrendingUp,
  ArrowDownToLine, Settings, Trash2, Pause, Play,
  CheckCircle, XCircle, Clock, Phone, ChevronLeft, ChevronRight,
  CalendarDays, Info, Edit2, Loader2, RefreshCw, BookOpen, ReceiptText,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  useVenueManagementStore, type CalendarSlot, type VenueBookingRequest,
  WEEKLY_REVENUE_V1, WEEKLY_REVENUE_V3,
} from '../stores/venueManagementStore';
import toast from 'react-hot-toast';

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 → 21
const TODAY_STR = '2026-03-26';

const VI_DAYS_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const VI_DAYS_FULL = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

function viDayShort(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return VI_DAYS_SHORT[d.getDay()];
}

function viDayFull(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return VI_DAYS_FULL[d.getDay()];
}

function formatVND(n: number) {
  return n.toLocaleString('vi-VN') + '₫';
}

// ─── SLOT COLORS ────────────────────────────────────────────────────────────────

const SLOT_CELL = {
  available: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
  pending:   'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 cursor-pointer',
  booked:    'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer',
};

const SLOT_ROW = {
  available: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700',
  pending:   'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700 cursor-pointer',
  booked:    'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700 cursor-pointer',
};

// ─── CHART TOOLTIP ──────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-medium mb-1">{label}</p>
        <p className="text-teal-600 dark:text-teal-400">{formatVND(payload[0].value)}</p>
        <p className="text-muted-foreground text-xs">{payload[0].payload.bookings} bookings</p>
      </div>
    );
  }
  return null;
}

// ─── CALENDAR TAB ────────────────────────────────────────────────────────────────

interface CalendarTabProps {
  venueId: string;
  venueSlots: CalendarSlot[];
  venueRequests: VenueBookingRequest[];
  onAccept: (bookingId: string, name: string) => void;
  onReject: (bookingId: string, name: string) => void;
}

function CalendarTab({ venueId, venueSlots, venueRequests, onAccept, onReject }: CalendarTabProps) {
  const { addAvailableSlots, updateSlotStatus } = useVenueManagementStore();

  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date(TODAY_STR + 'T12:00:00');
    return startOfWeek(today, { weekStartsOn: 1 });
  });
  const [selectedMobileDay, setSelectedMobileDay] = useState(TODAY_STR);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; hour: number } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addingSlots, setAddingSlots] = useState(false);

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd')),
    [weekStart]
  );

  const getSlot = (date: string, hour: number): CalendarSlot | undefined =>
    venueSlots.find((s) => s.date === date && s.startHour === hour);

  const getStatus = (date: string, hour: number): 'available' | 'pending' | 'booked' =>
    getSlot(date, hour)?.status ?? 'available';

  const getRequest = (date: string, hour: number): VenueBookingRequest | undefined =>
    venueRequests.find((r) => r.date === date && r.startHour === hour);

  const currentSlot = selectedSlot ? getSlot(selectedSlot.date, selectedSlot.hour) : undefined;
  const currentStatus = selectedSlot ? getStatus(selectedSlot.date, selectedSlot.hour) : 'available';
  const currentRequest = selectedSlot ? getRequest(selectedSlot.date, selectedSlot.hour) : undefined;

  const handleCellClick = (date: string, hour: number) => {
    setSelectedSlot({ date, hour });
    setDialogOpen(true);
  };

  const handleAcceptFromDialog = () => {
    if (currentRequest) {
      onAccept(currentRequest.bookingId, currentRequest.userName);
      setDialogOpen(false);
    }
  };

  const handleRejectFromDialog = () => {
    if (currentRequest) {
      onReject(currentRequest.bookingId, currentRequest.userName);
      setDialogOpen(false);
    }
  };

  const handleBlockSlot = () => {
    if (!selectedSlot) return;
    updateSlotStatus(`slot_${venueId}_${selectedSlot.date}_${selectedSlot.hour}`, 'booked');
    toast.success('🚫 Đã khóa slot này');
    setDialogOpen(false);
  };

  const handleAddSlotsForWeek = async () => {
    setAddingSlots(true);
    await new Promise((r) => setTimeout(r, 600));
    weekDates.forEach((date) => addAvailableSlots(venueId, date, HOURS));
    setAddingSlots(false);
    toast.success('✅ Đã cập nhật lịch trống cho tuần này!');
  };

  const weekStats = useMemo(() => {
    let avail = 0, pending = 0, booked = 0;
    weekDates.forEach((date) => {
      HOURS.forEach((h) => {
        const s = getStatus(date, h);
        if (s === 'available') avail++;
        else if (s === 'pending') pending++;
        else booked++;
      });
    });
    return { avail, pending, booked };
  }, [weekDates, venueSlots]);

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setWeekStart((w) => addDays(w, -7))}>
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Tuần trước</span>
        </Button>
        <div className="text-center">
          <p className="text-sm font-semibold">
            {format(weekStart, 'dd/MM')} – {format(addDays(weekStart, 6), 'dd/MM/yyyy')}
          </p>
          <p className="text-xs text-muted-foreground">
            {weekStats.booked} đặt · {weekStats.pending} chờ · {weekStats.avail} trống
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setWeekStart((w) => addDays(w, 7))}>
          <span className="hidden sm:inline">Tuần sau</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend + Update button */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-300 dark:bg-emerald-700" />Trống</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-300 dark:bg-amber-700" />Chờ xác nhận</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-300 dark:bg-red-700" />Đã đặt</div>
        <Button size="sm" variant="outline" className="ml-auto h-7 px-3 text-xs gap-1.5" onClick={handleAddSlotsForWeek} disabled={addingSlots}>
          {addingSlots ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Cập nhật lịch trống
        </Button>
      </div>

      {/* ── DESKTOP WEEKLY GRID ── */}
      <div className="hidden md:block">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Header row */}
          <div className="grid gap-px bg-border" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
            <div className="bg-card py-2" />
            {weekDates.map((date) => (
              <div key={date} className={`bg-card px-1 py-2 text-center ${date === TODAY_STR ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`}>
                <p className={`text-xs font-semibold ${date === TODAY_STR ? 'text-teal-600' : ''}`}>{viDayShort(date)}</p>
                <p className={`text-xs ${date === TODAY_STR ? 'text-teal-600' : 'text-muted-foreground'}`}>{format(new Date(date + 'T12:00:00'), 'dd/MM')}</p>
              </div>
            ))}
          </div>
          {/* Slot rows */}
          <div className="divide-y divide-border">
            {HOURS.map((hour) => (
              <div key={hour} className="grid gap-px bg-border" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
                <div className="bg-card flex items-center justify-center py-1">
                  <span className="text-xs text-muted-foreground">{hour}:00</span>
                </div>
                {weekDates.map((date) => {
                  const status = getStatus(date, hour);
                  const slot = getSlot(date, hour);
                  return (
                    <motion.div
                      key={date}
                      whileHover={{ scale: 1.02 }}
                      className={`bg-card px-1 py-1 cursor-pointer transition-colors ${SLOT_CELL[status]}`}
                      onClick={() => handleCellClick(date, hour)}
                    >
                      <div className="h-7 flex items-center justify-center rounded">
                        {status === 'booked' && <span className="text-xs truncate px-1 max-w-full">{slot?.userName?.split(' ').slice(-1)[0]}</span>}
                        {status === 'pending' && <span className="text-xs">⏳</span>}
                        {status === 'available' && <span className="text-xs opacity-30">·</span>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MOBILE DAY VIEW ── */}
      <div className="md:hidden space-y-3">
        {/* Day selector chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {weekDates.map((date) => {
            const hasPending = HOURS.some((h) => getStatus(date, h) === 'pending');
            const hasBooked = HOURS.some((h) => getStatus(date, h) === 'booked');
            return (
              <button
                key={date}
                onClick={() => setSelectedMobileDay(date)}
                className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border text-xs transition-all ${
                  date === selectedMobileDay
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                    : date === TODAY_STR
                    ? 'border-blue-300 text-blue-600'
                    : 'border-border text-muted-foreground hover:border-teal-400'
                }`}
              >
                <span className="font-medium">{viDayShort(date)}</span>
                <span className="font-bold">{format(new Date(date + 'T12:00:00'), 'dd')}</span>
                {(hasPending || hasBooked) && <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />}
              </button>
            );
          })}
        </div>

        {/* Day info */}
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-medium">
            {viDayFull(selectedMobileDay)}, {format(new Date(selectedMobileDay + 'T12:00:00'), 'dd/MM/yyyy')}
          </p>
          {selectedMobileDay === TODAY_STR && (
            <Badge className="text-xs bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-0">Hôm nay</Badge>
          )}
        </div>

        {/* Slot rows */}
        <div className="space-y-1.5">
          {HOURS.map((hour) => {
            const status = getStatus(selectedMobileDay, hour);
            const slot = getSlot(selectedMobileDay, hour);
            const req = getRequest(selectedMobileDay, hour);
            return (
              <motion.div
                key={hour}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${SLOT_ROW[status]}`}
                onClick={() => handleCellClick(selectedMobileDay, hour)}
              >
                <span className="text-sm font-medium w-12 shrink-0 tabular-nums">{hour}:00</span>
                <div className="flex-1 min-w-0">
                  {status === 'available' && <span className="text-sm text-emerald-600 dark:text-emerald-400">Trống</span>}
                  {status === 'booked' && (
                    <div>
                      <span className="text-sm font-medium text-red-700 dark:text-red-400 line-clamp-1">{slot?.userName}</span>
                      {slot?.amount && <span className="text-xs text-muted-foreground">{formatVND(slot.amount)}</span>}
                    </div>
                  )}
                  {status === 'pending' && (
                    <div>
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-400 line-clamp-1">{slot?.userName}</span>
                      <span className="text-xs text-muted-foreground">Chờ xác nhận</span>
                    </div>
                  )}
                </div>
                {status === 'pending' && req && (
                  <div className="flex gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" className="h-7 px-2 text-xs bg-teal-600 hover:bg-teal-700 text-white" onClick={() => onAccept(req.bookingId, req.userName)}>✓</Button>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-destructive border-destructive/30" onClick={() => onReject(req.bookingId, req.userName)}>✕</Button>
                  </div>
                )}
                {status === 'booked' && <span className="text-xs text-red-500 shrink-0">Đã đặt</span>}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── SLOT DETAIL DIALOG ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-teal-600" />
              Chi tiết slot
            </DialogTitle>
          </DialogHeader>

          {selectedSlot && (
            <div className="space-y-4">
              {/* Time info */}
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedSlot.hour}:00 – {selectedSlot.hour + 1}:00</p>
                  <p className="text-xs text-muted-foreground">
                    {viDayFull(selectedSlot.date)}, {format(new Date(selectedSlot.date + 'T12:00:00'), 'dd/MM/yyyy')}
                  </p>
                </div>
                <Badge
                  className={`text-xs border-0 shrink-0 ${
                    currentStatus === 'available' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : currentStatus === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {currentStatus === 'available' ? '🟢 Trống' : currentStatus === 'pending' ? '🟡 Chờ' : '🔴 Đặt'}
                </Badge>
              </div>

              {/* Booking user info */}
              {(currentSlot?.userName || currentRequest?.userName) && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentSlot?.userAvatar ?? currentRequest?.userAvatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border-2 border-border"
                    />
                    <div>
                      <p className="font-medium text-sm">{currentSlot?.userName ?? currentRequest?.userName}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {currentSlot?.phone ?? currentRequest?.phone}
                      </div>
                    </div>
                  </div>

                  {currentRequest && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-secondary/50 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Tổng tiền</p>
                          <p className="text-sm font-semibold text-teal-600">{formatVND(currentRequest.amount)}</p>
                        </div>
                        <div className="bg-secondary/50 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Đặt cọc</p>
                          <p className="text-sm font-semibold text-emerald-600">{formatVND(currentRequest.deposit)}</p>
                        </div>
                      </div>
                      {currentRequest.note && (
                        <p className="text-xs text-muted-foreground italic bg-secondary/50 rounded-lg px-3 py-2">
                          "{currentRequest.note}"
                        </p>
                      )}
                    </>
                  )}

                  {currentSlot && !currentRequest && currentSlot.amount && (
                    <div className="bg-secondary/50 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Giá trị</p>
                      <p className="text-sm font-semibold text-teal-600">{formatVND(currentSlot.amount)}</p>
                    </div>
                  )}
                </div>
              )}

              {currentStatus === 'available' && (
                <div className="text-center py-2">
                  <div className="w-10 h-10 mx-auto mb-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">Slot này đang trống và sẵn sàng đặt</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            {currentStatus === 'pending' && currentRequest && (
              <>
                <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={handleAcceptFromDialog}>
                  <CheckCircle className="w-4 h-4" />Xác nhận
                </Button>
                <Button variant="outline" className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10 gap-2" onClick={handleRejectFromDialog}>
                  <XCircle className="w-4 h-4" />Từ chối
                </Button>
              </>
            )}
            {currentStatus === 'available' && (
              <Button variant="outline" className="flex-1 text-muted-foreground" onClick={handleBlockSlot}>
                Khóa slot này
              </Button>
            )}
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── PENDING TAB ──────────────────────────────────────────────────────────────────

interface PendingTabProps {
  venueRequests: VenueBookingRequest[];
  onAccept: (bookingId: string, name: string) => void;
  onReject: (bookingId: string, name: string) => void;
}

function PendingTab({ venueRequests, onAccept, onReject }: PendingTabProps) {
  return (
    <div className="space-y-3">
      {venueRequests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-card border border-border rounded-2xl"
        >
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500/30" />
          <p className="font-medium text-muted-foreground">Không có yêu cầu nào đang chờ</p>
          <p className="text-sm text-muted-foreground mt-1">Tất cả đã được xử lý ✓</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          {venueRequests.map((req, i) => (
            <motion.div
              key={req.bookingId}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12, height: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-2xl p-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                <img src={req.userAvatar} alt={req.userName} className="w-11 h-11 rounded-full object-cover border-2 border-border shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-sm">{req.userName}</p>
                    <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 shrink-0">
                      <Clock className="w-3 h-3 mr-1" />Chờ duyệt
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>{req.startHour}:00–{req.endHour}:00 · {format(new Date(req.date + 'T12:00:00'), 'dd/MM/yyyy')} ({viDayFull(req.date)})</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <Phone className="w-3.5 h-3.5" /><span>{req.phone}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-2 text-xs">
                    <div className="flex items-center gap-1">
                      <ReceiptText className="w-3.5 h-3.5 text-teal-600" />
                      <span className="font-medium text-teal-600">{formatVND(req.amount)}</span>
                    </div>
                    <span className="text-muted-foreground">·</span>
                    <div>
                      <span className="text-muted-foreground">Cọc: </span>
                      <span className="font-medium text-emerald-600">{formatVND(req.deposit)}</span>
                    </div>
                  </div>

                  {req.note && (
                    <p className="text-xs text-muted-foreground italic bg-secondary/50 rounded-lg px-3 py-2 mb-3">"{req.note}"</p>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 h-8" onClick={() => onAccept(req.bookingId, req.userName)}>
                      <CheckCircle className="w-3.5 h-3.5" />Xác nhận
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5 h-8" onClick={() => onReject(req.bookingId, req.userName)}>
                      <XCircle className="w-3.5 h-3.5" />Từ chối
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

// ─── REVENUE TAB ──────────────────────────────────────────────────────────────────

interface RevenueTabProps {
  venueId: string;
  venueName: string;
  weeklyRevenue: typeof WEEKLY_REVENUE_V1;
  transactions: ReturnType<typeof useVenueManagementStore>['revenueTransactions'];
  onWithdraw: (amount: number) => void;
}

function RevenueTab({ venueId, venueName, weeklyRevenue, transactions, onWithdraw }: RevenueTabProps) {
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const venueTransactions = transactions.filter((t) => t.venueId === venueId);
  const weekTotal = weeklyRevenue.reduce((s, d) => s + d.revenue, 0);
  const weekBookings = weeklyRevenue.reduce((s, d) => s + d.bookings, 0);
  const monthTotal = Math.round(weekTotal * 4.3);
  const withdrawable = Math.round(weekTotal * 0.85);
  const platformFee = weekTotal - withdrawable;

  const handleWithdraw = async () => {
    if (withdrawable <= 0) return;
    setWithdrawLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    onWithdraw(withdrawable);
    setWithdrawLoading(false);
    toast.success(`💰 Đã rút ${formatVND(withdrawable)} về tài khoản!`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Doanh thu tuần', value: `${(weekTotal / 1000000).toFixed(1)}M₫`, icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
          { label: 'Tổng booking', value: weekBookings, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Ước tính tháng', value: `${(monthTotal / 1000000).toFixed(1)}M₫`, icon: ReceiptText, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Có thể rút', value: `${(withdrawable / 1000000).toFixed(1)}M₫`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-3">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold">Doanh thu 7 ngày qua</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Tổng: <span className="text-teal-600 font-semibold">{formatVND(weekTotal)}</span>
            </p>
          </div>
          <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-0 text-xs">
            {venueName}
          </Badge>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyRevenue} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="revenue" fill="#0d9488" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Withdraw */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-5 h-5 text-emerald-500" />
              <p className="font-semibold">Số dư có thể rút</p>
            </div>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{formatVND(withdrawable)}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5" />
              <span>Phí nền tảng 15%: {formatVND(platformFee)}</span>
            </div>
          </div>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shrink-0"
            onClick={handleWithdraw}
            disabled={withdrawLoading || withdrawable <= 0}
          >
            {withdrawLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Đang xử lý...</> : <><ArrowDownToLine className="w-4 h-4" />Rút tiền</>}
          </Button>
        </div>
        <div className="mt-4 p-3 bg-secondary/50 rounded-xl">
          <p className="text-xs text-muted-foreground">Ngân hàng: Vietcombank · ****6789 · Nguyen Thi Phuong</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <p className="font-semibold">Lịch sử giao dịch</p>
          <span className="text-xs text-muted-foreground">{venueTransactions.length} giao dịch</span>
        </div>
        {venueTransactions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">Chưa có giao dịch</div>
        ) : (
          <div className="divide-y divide-border">
            {venueTransactions.slice(0, 10).map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 px-5 py-3"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'booking' ? 'bg-teal-100 dark:bg-teal-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  {tx.type === 'booking'
                    ? <ReceiptText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    : <ArrowDownToLine className="w-4 h-4 text-red-600 dark:text-red-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">
                    {tx.type === 'booking' ? tx.userName : 'Rút tiền về tài khoản'}
                  </p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
                <p className={`text-sm font-semibold shrink-0 ${tx.amount > 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-400'}`}>
                  {tx.amount > 0 ? '+' : ''}{formatVND(tx.amount)}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── SETTINGS TAB ────────────────────────────────────────────────────────────────

interface SettingsTabProps {
  venue: ReturnType<typeof useVenueManagementStore>['managedVenues'][0];
  onPauseToggle: () => void;
  onDelete: () => void;
  onUpdate: (updates: Record<string, any>) => void;
}

function SettingsTab({ venue, onPauseToggle, onDelete, onUpdate }: SettingsTabProps) {
  const [name, setName] = useState(venue.name);
  const [address, setAddress] = useState(venue.address);
  const [description, setDescription] = useState(venue.description);
  const [pricePerHour, setPricePerHour] = useState(venue.pricePerHour);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isDirty = name !== venue.name || address !== venue.address || description !== venue.description || pricePerHour !== venue.pricePerHour;

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    onUpdate({ name, address, description, pricePerHour });
    setSaving(false);
    toast.success('✅ Đã lưu thay đổi!');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 max-w-xl">
      {/* Edit Form */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Edit2 className="w-4 h-4 text-teal-600" />
          <p className="font-semibold">Chỉnh sửa thông tin sân</p>
        </div>

        <div>
          <Label className="mb-1.5 block text-sm">Tên sân</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">Địa chỉ</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">Mô tả</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">Giá / giờ (VNĐ)</Label>
          <div className="relative">
            <Input type="number" value={pricePerHour} onChange={(e) => setPricePerHour(Number(e.target.value))} min={10000} step={10000} className="pr-10" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₫</span>
          </div>
          <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">{pricePerHour.toLocaleString('vi-VN')}₫/giờ</p>
        </div>

        <div className="flex gap-2">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={handleSave} disabled={saving || !isDirty}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
          {isDirty && (
            <Button variant="ghost" onClick={() => { setName(venue.name); setAddress(venue.address); setDescription(venue.description); setPricePerHour(venue.pricePerHour); }}>
              Hủy
            </Button>
          )}
        </div>
      </div>

      {/* Current amenities */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="font-semibold mb-3">Tiện ích hiện có</p>
        <div className="flex flex-wrap gap-2">
          {venue.amenities.length === 0
            ? <p className="text-sm text-muted-foreground">Chưa có tiện ích nào</p>
            : venue.amenities.map((a) => (
              <Badge key={a} className="text-xs bg-secondary text-secondary-foreground border-0 px-2 py-1">{a}</Badge>
            ))
          }
        </div>
      </div>

      {/* Status toggle */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {venue.status === 'active' ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4 text-amber-600" />}
              <p className="font-semibold">Trạng thái sân</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {venue.status === 'active' ? 'Sân đang hoạt động, nhận đặt chỗ bình thường' : 'Sân đang tạm dừng, không nhận đặt chỗ mới'}
            </p>
          </div>
          <Button
            variant="outline"
            className={`shrink-0 gap-2 ${venue.status === 'active' ? 'text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
            onClick={onPauseToggle}
          >
            {venue.status === 'active' ? <><Pause className="w-4 h-4" />Tạm dừng</> : <><Play className="w-4 h-4" />Kích hoạt</>}
          </Button>
        </div>
        <div className={`mt-3 px-3 py-2 rounded-lg text-xs ${venue.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'}`}>
          {venue.status === 'active' ? '🟢 Sân hiển thị công khai và nhận booking' : '⏸ Sân đang ẩn khỏi kết quả tìm kiếm'}
        </div>
      </div>

      {/* Delete danger zone */}
      <div className="bg-card border border-red-200 dark:border-red-900/30 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Trash2 className="w-4 h-4 text-destructive" />
          <p className="font-semibold text-destructive">Xóa sân</p>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Hành động này không thể hoàn tác. Toàn bộ dữ liệu, lịch đặt và doanh thu sẽ bị xóa vĩnh viễn.
        </p>
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-2">
              <Trash2 className="w-4 h-4" />Xóa sân này
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />Xác nhận xóa sân?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Bạn đang xóa <strong>"{venue.name}"</strong>. Toàn bộ dữ liệu bao gồm lịch đặt, doanh thu và lịch sử giao dịch sẽ bị xóa vĩnh viễn và không thể khôi phục.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-white" onClick={onDelete}>
                Xóa vĩnh viễn
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────────

export function VenueDashboardPage() {
  const { venueId: paramVenueId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    managedVenues, calendarSlots, bookingRequests, revenueTransactions,
    acceptBookingRequest, rejectBookingRequest, toggleVenueStatus,
    deleteManagedVenue, updateManagedVenue, addWithdrawTransaction,
  } = useVenueManagementStore();

  const venue =
    managedVenues.find((v) => v.id === paramVenueId) ??
    managedVenues.find((v) => v.status === 'active') ??
    managedVenues[0];

  const defaultTab = searchParams.get('tab') ?? 'calendar';

  const venueSlots = useMemo(
    () => calendarSlots.filter((s) => s.venueId === venue?.id),
    [calendarSlots, venue?.id]
  );
  const venueRequests = useMemo(
    () => bookingRequests.filter((r) => r.venueId === venue?.id),
    [bookingRequests, venue?.id]
  );

  const weeklyRevenue = venue?.id === 'v1' ? WEEKLY_REVENUE_V1 : venue?.id === 'v3' ? WEEKLY_REVENUE_V3 : WEEKLY_REVENUE_V1;

  const handleAccept = (bookingId: string, name: string) => {
    acceptBookingRequest(bookingId);
    toast.success(`✅ Đã xác nhận booking của ${name}!`);
  };
  const handleReject = (bookingId: string, name: string) => {
    rejectBookingRequest(bookingId);
    toast(`❌ Đã từ chối booking của ${name}`, { icon: '🚫' });
  };
  const handlePauseToggle = () => {
    if (!venue) return;
    toggleVenueStatus(venue.id);
    toast(venue.status === 'active' ? `⏸ Đã tạm dừng sân "${venue.name}"` : `▶️ Đã kích hoạt lại sân "${venue.name}"`);
  };
  const handleDelete = () => {
    if (!venue) return;
    const name = venue.name;
    deleteManagedVenue(venue.id);
    toast.success(`🗑️ Đã xóa sân "${name}"`);
    navigate('/my-venues');
  };
  const handleUpdate = (updates: Record<string, any>) => { if (venue) updateManagedVenue(venue.id, updates); };
  const handleWithdraw = (amount: number) => { if (venue) addWithdrawTransaction(venue.id, venue.name, amount); };

  if (!venue) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl text-center py-20">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
        <h2 className="text-muted-foreground mb-4">Bạn chưa có sân nào</h2>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => navigate('/venue/create')}>
          Tạo sân đầu tiên
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 mb-5">
        <Button variant="ghost" size="icon" onClick={() => navigate('/my-venues')} className="shrink-0 mt-0.5">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="line-clamp-1">{venue.name}</h1>
            <Badge className={`text-xs border-0 shrink-0 ${venue.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
              {venue.status === 'active' ? '🟢 Hoạt động' : '⏸ Tạm dừng'}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="line-clamp-1">{venue.address}, {venue.city}</span>
          </div>
        </div>
        {managedVenues.length > 1 && (
          <select
            value={venue.id}
            onChange={(e) => navigate(`/venue/dashboard/${e.target.value}`)}
            className="shrink-0 h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            {managedVenues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        )}
      </motion.div>

      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative h-36 sm:h-48 rounded-2xl overflow-hidden mb-5"
      >
        <img src={venue.images[0]} alt={venue.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-white font-semibold">{venue.rating > 0 ? venue.rating.toFixed(1) : 'Mới'}</span>
              {venue.reviewCount > 0 && <span className="text-white/70 text-sm">({venue.reviewCount})</span>}
            </div>
            <p className="text-white/80 text-sm">{venue.type === 'indoor' ? '🏠 Trong nhà' : '🌳 Ngoài trời'} · {venue.sport}</p>
          </div>
          <div className="text-right">
            <p className="text-white text-xl font-bold">{venue.pricePerHour.toLocaleString('vi-VN')}₫</p>
            <p className="text-white/70 text-xs">mỗi giờ</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5"
      >
        {[
          { label: 'Slot trống hôm nay', value: venueSlots.filter((s) => s.date === TODAY_STR && s.status === 'available').length, icon: CalendarDays, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20' },
          { label: 'Đang chờ duyệt', value: venueRequests.length, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Đặt hôm nay', value: venueSlots.filter((s) => s.date === TODAY_STR && s.status === 'booked').length, icon: CheckCircle, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Doanh thu tuần', value: `${(weeklyRevenue.reduce((s, d) => s + d.revenue, 0) / 1000000).toFixed(1)}M₫`, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-3">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Tabs defaultValue={defaultTab}>
          <TabsList className="w-full sm:w-auto mb-5 grid grid-cols-4 sm:flex">
            <TabsTrigger value="calendar" className="gap-1.5 text-xs sm:text-sm">
              <CalendarDays className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lịch sân</span>
              <span className="sm:hidden">Lịch</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-1.5 text-xs sm:text-sm relative">
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Yêu cầu</span>
              <span className="sm:hidden">YC</span>
              {venueRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                  {venueRequests.length > 9 ? '9+' : venueRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-1.5 text-xs sm:text-sm">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Doanh thu</span>
              <span className="sm:hidden">DT</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 text-xs sm:text-sm">
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cài đặt</span>
              <span className="sm:hidden">CĐ</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <CalendarTab venueId={venue.id} venueSlots={venueSlots} venueRequests={venueRequests} onAccept={handleAccept} onReject={handleReject} />
          </TabsContent>

          <TabsContent value="pending">
            <PendingTab venueRequests={venueRequests} onAccept={handleAccept} onReject={handleReject} />
          </TabsContent>

          <TabsContent value="revenue">
            <RevenueTab venueId={venue.id} venueName={venue.name} weeklyRevenue={weeklyRevenue} transactions={revenueTransactions} onWithdraw={handleWithdraw} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab venue={venue} onPauseToggle={handlePauseToggle} onDelete={handleDelete} onUpdate={handleUpdate} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
