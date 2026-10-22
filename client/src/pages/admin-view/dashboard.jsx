import {useDispatch, useSelector} from "react-redux";
import {formatPrice} from "@/lib/utils";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {getDashboard} from "@/store/admin/dashboard-slice/index.js";
import StatsCard from "@/components/admin-view/stats-card.jsx";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Banknote,
  Gift,
  Loader2,
  Package,
  Receipt,
  Send,
  ShoppingBag,
  ShoppingCart,
  TicketPercent,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import instance from "@/utils/axios.js";

// Bitta seriyali grafiklar uchun brend rangi (oq fonda kontrast >= 3:1)
const MARK = "#9c5763";
const MARK_FILL = "#c58891";
const GRID = "#ece2db";
const AXIS = "#8a7b74";

const statusLabels = {
  pending: "Kutilmoqda",
  confirmed: "Tasdiqlandi",
  inProcess: "Tayyorlanmoqda",
  inShipping: "Yo'lda",
  delivered: "Yetkazildi",
  rejected: "Bekor qilindi",
};

const tooltipStyle = {
  borderRadius: "16px",
  border: "1px solid #ece2db",
  background: "#fff",
  boxShadow: "0 10px 30px -12px rgba(46,35,32,0.25)",
  fontSize: "13px",
};

const compact = (value) =>
  value >= 1e6 ? `${(value / 1e6).toFixed(1)}M` : value >= 1e3 ? `${Math.round(value / 1e3)}k` : String(value);

function PeriodCard({label, revenue, orders, trend}) {
  return (
    <div className="rounded-3xl border border-sand bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-taupe">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-espresso">{formatPrice(revenue)}</p>
      <div className="mt-1 flex items-center gap-2 text-xs text-taupe">
        <span>{orders} ta buyurtma</span>
        {trend !== null && trend !== undefined ? (
          <span className={`flex items-center gap-0.5 font-semibold ${trend >= 0 ? "text-sage" : "text-rose-deep"}`}>
            {trend >= 0 ? <TrendingUp className="h-3.5 w-3.5"/> : <TrendingDown className="h-3.5 w-3.5"/>}
            {trend >= 0 ? "+" : ""}{trend}% o'tgan oyga
          </span>
        ) : null}
      </div>
    </div>
  );
}

function MiniStat({icon: Icon, label, value}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-cream/60 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-rose-deep">
        <Icon className="h-4 w-4"/>
      </span>
      <div className="min-w-0">
        <p className="truncate font-display text-lg font-semibold text-espresso">{value}</p>
        <p className="truncate text-[11px] text-taupe">{label}</p>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {dashboard, isLoading} = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(getDashboard());
  }, [dispatch]);

  if (isLoading || !dashboard) {
    return (
      <div className="flex justify-center py-20 text-rose">
        <Loader2 className="h-6 w-6 animate-spin"/>
      </div>
    );
  }

  const periods = dashboard.periods || {};
  const monthTrend = periods.prevMonthRevenue > 0
    ? Math.round(((periods.monthRevenue - periods.prevMonthRevenue) / periods.prevMonthRevenue) * 100)
    : null;
  const marketing = dashboard.marketing || {};
  const statusData = (dashboard.ordersByStatus || []).map((row) => ({
    ...row,
    label: statusLabels[row._id] || row._id,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-espresso">Boshqaruv paneli</h1>
        <p className="mt-1 text-sm text-taupe">Faqat to'langan buyurtmalar hisobga olinadi</p>
      </div>

      {/* Davr bo'yicha daromad */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <PeriodCard label="Bugun" revenue={periods.todayRevenue} orders={periods.todayOrders}/>
        <PeriodCard label="Shu hafta" revenue={periods.weekRevenue} orders={periods.weekOrders}/>
        <PeriodCard label="Shu oy" revenue={periods.monthRevenue} orders={periods.monthOrders} trend={monthTrend}/>
      </div>

      {/* Umumiy ko'rsatkichlar */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Umumiy daromad" value={formatPrice(dashboard.totalRevenue)} icon={Banknote} accent="espresso"/>
        <StatsCard title="Buyurtmalar" value={dashboard.totalOrders} icon={ShoppingBag} accent="sage"/>
        <StatsCard title="O'rtacha chek" value={formatPrice(dashboard.averageOrder)} icon={Receipt} accent="gold"/>
        <StatsCard title="Mijozlar" value={dashboard.totalUsers} icon={Users} accent="rose"/>
      </div>

      {/* Kunlik daromad — 30 kun */}
      <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-espresso">Kunlik daromad</h2>
        <p className="mb-6 text-xs text-taupe">Oxirgi 30 kun</p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dashboard.dailySales} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={MARK_FILL} stopOpacity={0.35}/>
                <stop offset="100%" stopColor={MARK_FILL} stopOpacity={0.02}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false}/>
            <XAxis dataKey="date" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={16}/>
            <YAxis stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} tickFormatter={compact} width={44}/>
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{stroke: MARK, strokeDasharray: "4 4"}}
              formatter={(value, name) => (name === "revenue" ? [formatPrice(value), "Daromad"] : [value, "Buyurtmalar"])}
            />
            <Area type="monotone" dataKey="revenue" stroke={MARK} strokeWidth={2} fill="url(#revenueFill)" activeDot={{r: 5, stroke: "#fff", strokeWidth: 2}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top mahsulotlar */}
        <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-display text-xl font-semibold text-espresso">Eng ko'p sotilganlar</h2>
          {dashboard.topProducts?.length ? (
            <ol className="space-y-3">
              {dashboard.topProducts.map((product, index) => (
                <li key={product._id} className="flex items-center gap-3">
                  <span className="w-5 text-center font-display text-lg font-semibold text-taupe">{index + 1}</span>
                  {product.image ? (
                    <img src={instance.defaults.baseURL + product.image} alt="" className="h-11 w-11 rounded-xl object-cover"/>
                  ) : <span className="h-11 w-11 rounded-xl bg-cream"/>}
                  <span className="min-w-0 flex-1 truncate text-sm text-espresso">{product.title}</span>
                  <span className="text-sm font-semibold text-espresso">{product.soldCount} ta</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-2xl border border-dashed border-sand py-10 text-center text-sm text-taupe">Hali sotuv yo'q</p>
          )}
        </div>

        {/* Kam qolganlar */}
        <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
          <h2 className="mb-1 flex items-center gap-2 font-display text-xl font-semibold text-espresso">
            <AlertTriangle className="h-5 w-5 text-gold"/> Omborda kam qolgan
          </h2>
          <p className="mb-4 text-xs text-taupe">{dashboard.lowStockThreshold} donadan kam — buyurtma berish vaqti</p>
          {dashboard.lowStock?.length ? (
            <ul className="space-y-2">
              {dashboard.lowStock.map((product) => (
                <li key={product._id} className="flex items-center justify-between gap-3 rounded-2xl bg-cream/50 px-3 py-2">
                  <span className="min-w-0 truncate text-sm text-espresso">{product.title}</span>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    product.totalStock === 0 ? "bg-rose-deep text-white" : "bg-[#f7ead6] text-[#93672c]"
                  }`}>
                    {product.totalStock === 0 ? "Tugagan" : `${product.totalStock} ta`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-sand py-10 text-center text-sm text-taupe">Hammasi yetarli ✨</p>
          )}
          {dashboard.lowStock?.length ? (
            <button onClick={() => navigate("/admin/products")} className="mt-4 text-xs font-semibold text-rose-deep hover:underline">
              Mahsulotlarga o'tish →
            </button>
          ) : null}
        </div>
      </div>

      {/* Marketing samaradorligi */}
      <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-xl font-semibold text-espresso">Marketing samaradorligi</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <MiniStat icon={TicketPercent} label="Promokod ishlatildi" value={marketing.couponUses ?? 0}/>
          <MiniStat icon={Banknote} label="Promokod chegirmasi" value={formatPrice(marketing.couponDiscount)}/>
          <MiniStat icon={Users} label="Taklif bilan kelgan" value={marketing.referredUsers ?? 0}/>
          <MiniStat icon={Gift} label="Berilgan bonus" value={formatPrice(marketing.bonusIssued)}/>
          <MiniStat icon={ShoppingCart} label="Tashlab ketilgan savat" value={marketing.abandonedCarts ?? 0}/>
          <MiniStat icon={Send} label="Telegram obunachi" value={marketing.telegramAudience ?? 0}/>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Holat bo'yicha */}
        <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
          <h2 className="mb-6 font-display text-xl font-semibold text-espresso">Buyurtmalar holati</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData} layout="vertical" margin={{top: 0, right: 36, left: 10, bottom: 0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false}/>
              <XAxis type="number" stroke={AXIS} fontSize={11} allowDecimals={false} tickLine={false} axisLine={false}/>
              <YAxis type="category" dataKey="label" stroke={AXIS} fontSize={12} width={110} tickLine={false} axisLine={false}/>
              <Tooltip contentStyle={tooltipStyle} cursor={{fill: "#f7f0ea"}} formatter={(value) => [value, "Buyurtmalar"]}/>
              <Bar dataKey="count" fill={MARK} radius={[0, 4, 4, 0]} barSize={18} label={{position: "right", fill: "#2e2320", fontSize: 12}}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Oylik */}
        <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
          <h2 className="mb-6 font-display text-xl font-semibold text-espresso">Oylik sotuvlar</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dashboard.monthlySales} margin={{top: 10, right: 16, left: 0, bottom: 0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false}/>
              <XAxis dataKey="monthName" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false}/>
              <YAxis stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} tickFormatter={compact} width={44}/>
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatPrice(value), "Sotuv"]}/>
              <Line type="monotone" dataKey="totalSales" stroke={MARK} strokeWidth={2} dot={{r: 4, fill: MARK, stroke: "#fff", strokeWidth: 2}} activeDot={{r: 6}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-taupe">
        <Package className="h-3.5 w-3.5"/> Jami mahsulotlar: {dashboard.totalProducts}
      </p>
    </div>
  );
}

export default AdminDashboard;
