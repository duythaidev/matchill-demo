import { useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Wallet,
  CalendarCheck,
  XCircle,
  CheckCircle,
  Clock,
  ArrowDownToLine,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useBookingStore } from '../stores/bookingStore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const WEEKLY_REVENUE = [
  { day: 'T2', revenue: 850000, bookings: 4 },
  { day: 'T3', revenue: 1200000, bookings: 6 },
  { day: 'T4', revenue: 650000, bookings: 3 },
  { day: 'T5', revenue: 1800000, bookings: 9 },
  { day: 'T6', revenue: 2100000, bookings: 10 },
  { day: 'T7', revenue: 3200000, bookings: 15 },
  { day: 'CN', revenue: 2800000, bookings: 13 },
];

const CALENDAR_SLOTS = [
  { hour: '06:00', status: 'available', venue: '' },
  { hour: '07:00', status: 'booked', venue: 'Nguyen Van Anh' },
  { hour: '08:00', status: 'booked', venue: 'Tran Thi Mai' },
  { hour: '09:00', status: 'booked', venue: 'Tran Thi Mai' },
  { hour: '10:00', status: 'blocked', venue: 'Bảo trì' },
  { hour: '11:00', status: 'available', venue: '' },
  { hour: '12:00', status: 'available', venue: '' },
  { hour: '13:00', status: 'available', venue: '' },
  { hour: '14:00', status: 'booked', venue: 'Pham Duc Anh' },
  { hour: '15:00', status: 'booked', venue: 'Pham Duc Anh' },
  { hour: '16:00', status: 'blocked', venue: 'Sự kiện riêng' },
  { hour: '17:00', status: 'available', venue: '' },
  { hour: '18:00', status: 'booked', venue: 'Vo Thanh Tung' },
  { hour: '19:00', status: 'booked', venue: 'Vo Thanh Tung' },
  { hour: '20:00', status: 'available', venue: '' },
  { hour: '21:00', status: 'available', venue: '' },
];

const totalRevenue = WEEKLY_REVENUE.reduce((s, d) => s + d.revenue, 0);
const totalBookings = WEEKLY_REVENUE.reduce((s, d) => s + d.bookings, 0);
const withdrawable = Math.round(totalRevenue * 0.85);

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-medium mb-1">{label}</p>
        <p className="text-teal-600 dark:text-teal-400">
          {payload[0].value.toLocaleString('vi-VN')}₫
        </p>
        <p className="text-muted-foreground">{payload[0].payload.bookings} bookings</p>
      </div>
    );
  }
  return null;
}

export function VenueDashboardPage() {
  const { refundRequests, approveRefund, rejectRefund } = useBookingStore();
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const handleApproveRefund = (bookingId: string, userName: string, isWithin5Min: boolean) => {
    approveRefund(bookingId);
    if (isWithin5Min) {
      toast.success(`✅ Đã hoàn tiền tự động cho ${userName}. Slot đã được mở lại.`);
    } else {
      toast.success(`✅ Đã xác nhận hoàn tiền thủ công cho ${userName}. Slot đã được cập nhật.`);
    }
  };

  const handleRejectRefund = (bookingId: string, userName: string) => {
    rejectRefund(bookingId);
    toast(`❌ Đã từ chối yêu cầu hoàn tiền của ${userName}`, { icon: '🚫' });
  };

  const handleWithdraw = async () => {
    setWithdrawLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setWithdrawLoading(false);
    toast.success(`💰 Đã rút ${withdrawable.toLocaleString('vi-VN')}₫ về ngân hàng!`);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1>Dashboard chủ sân</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Thống kê tuần này · {format(new Date(), 'dd/MM/yyyy')}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        {[
          {
            label: 'Doanh thu tuần',
            value: `${(totalRevenue / 1000000).toFixed(1)}M₫`,
            icon: TrendingUp,
            cls: 'text-teal-600 dark:text-teal-400',
            bg: 'bg-teal-50 dark:bg-teal-900/20',
          },
          {
            label: 'Tổng booking',
            value: `${totalBookings}`,
            icon: CalendarCheck,
            cls: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
          },
          {
            label: 'Yêu cầu hoàn tiền',
            value: `${refundRequests.length}`,
            icon: AlertCircle,
            cls: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
          },
          {
            label: 'Có thể rút',
            value: `${(withdrawable / 1000000).toFixed(1)}M₫`,
            icon: Wallet,
            cls: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          },
        ].map(({ label, value, icon: Icon, cls, bg }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${cls}`} />
            </div>
            <p className={`text-2xl font-bold ${cls}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </motion.div>

      <Tabs defaultValue="revenue">
        <TabsList className="mb-5">
          <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
          <TabsTrigger value="refunds">
            Yêu cầu hoàn tiền ({refundRequests.length})
          </TabsTrigger>
          <TabsTrigger value="calendar">Quản lý lịch</TabsTrigger>
        </TabsList>

        {/* Revenue Chart Tab */}
        <TabsContent value="revenue">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="font-medium">Doanh thu 7 ngày qua</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Tổng: <span className="text-teal-600 dark:text-teal-400 font-semibold">{totalRevenue.toLocaleString('vi-VN')}₫</span>
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={WEEKLY_REVENUE} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#0d9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Withdraw Card */}
            <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-5 h-5 text-emerald-500" />
                  <p className="font-medium">Số dư có thể rút</p>
                </div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {withdrawable.toLocaleString('vi-VN')}₫
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sau phí nền tảng 15%
                </p>
              </div>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shrink-0"
                onClick={handleWithdraw}
                disabled={withdrawLoading}
              >
                {withdrawLoading ? (
                  <>Đang xử lý...</>
                ) : (
                  <>
                    <ArrowDownToLine className="w-4 h-4" />
                    Rút tiền
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* Refunds Tab */}
        <TabsContent value="refunds">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {refundRequests.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Không có yêu cầu hoàn tiền nào</p>
              </div>
            ) : (
              refundRequests.map((req, i) => (
                <motion.div
                  key={req.bookingId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="secondary"
                          className={`text-xs border-0 ${req.isWithin5Min
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}
                        >
                          {req.isWithin5Min ? (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Tự động hoàn tiền
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Cần xác nhận thủ công
                            </>
                          )}
                        </Badge>
                      </div>
                      <p className="font-medium">{req.userName}</p>
                      <p className="text-sm text-muted-foreground">{req.venueName}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {format(new Date(req.start), 'HH:mm')} –{' '}
                          {format(new Date(req.end), 'HH:mm')} ·{' '}
                          {format(new Date(req.start), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-1">
                        Hoàn tiền: {req.amount.toLocaleString('vi-VN')}₫
                      </p>
                      {!req.isWithin5Min && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          ⚠️ Vui lòng hoàn tiền thủ công cho khách trước khi xác nhận
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
                        onClick={() => handleApproveRefund(req.bookingId, req.userName, req.isWithin5Min)}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {req.isWithin5Min ? 'Hoàn tiền' : 'Xác nhận'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5"
                        onClick={() => handleRejectRefund(req.bookingId, req.userName)}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Từ chối
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </TabsContent>

        {/* Calendar Management Tab */}
        <TabsContent value="calendar">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-medium">Quản lý lịch sân thủ công</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(), 'dd/MM/yyyy')}
              </p>
            </div>
            <div className="flex gap-4 mb-4 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-700" />Trống
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-200 dark:bg-red-700" />Đã đặt
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-700" />Khóa đặt
              </div>
            </div>
            <div className="space-y-2">
              {CALENDAR_SLOTS.map((slot, i) => {
                const colors = {
                  available: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700',
                  booked: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700',
                  blocked: 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700',
                  pending: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700',
                };
                const textColors = {
                  available: 'text-emerald-700 dark:text-emerald-400',
                  booked: 'text-red-700 dark:text-red-400',
                  blocked: 'text-gray-700 dark:text-gray-400',
                  pending: 'text-amber-700 dark:text-amber-400',
                };
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${colors[slot.status as keyof typeof colors]}`}
                  >
                    <span className={`text-sm font-medium w-14 shrink-0 ${textColors[slot.status as keyof typeof textColors]}`}>
                      {slot.hour}
                    </span>
                    <div className="flex-1">
                      {slot.status === 'available' ? (
                        <span className="text-sm text-muted-foreground">Trống</span>
                      ) : (
                        <span className={`text-sm font-medium ${textColors[slot.status as keyof typeof textColors]}`}>
                          {slot.venue}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      {slot.status === 'available' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs text-gray-600 border-gray-300 hover:bg-gray-100 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-900/30"
                          onClick={() => toast.success(`Đã khóa slot ${slot.hour}`)}
                        >
                          Khóa
                        </Button>
                      )}
                      {slot.status === 'blocked' && (
                        <>
                          <Button
                            size="sm"
                            className="h-6 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => toast.success(`Đã mở lại slot ${slot.hour}`)}
                          >
                            Mở
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => toast.success(`Đã xóa khóa slot ${slot.hour}`)}
                          >
                            Xóa
                          </Button>
                        </>
                      )}
                      {slot.status === 'booked' && (
                        <span className="text-xs text-muted-foreground">Đã đặt</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}