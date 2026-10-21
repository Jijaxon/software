import {useDispatch, useSelector} from "react-redux";
import {formatPrice} from "@/lib/utils";
import {useEffect} from "react";
import {getDashboard} from "@/store/admin/dashboard-slice/index.js";
import StatsCard from "@/components/admin-view/stats-card.jsx";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {Banknote, Loader2, Package, ShoppingBag, Users} from "lucide-react";

function AdminDashboard() {
  const dispatch = useDispatch();
  const {dashboard, isLoading} = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(getDashboard());
  }, [dispatch]);

  const barColors = ["#c58891", "#c6a07c", "#6f8f72", "#9c5763", "#8a7b74", "#5b463f", "#ebc9c1", "#2e2320"];

  const tooltipStyle = {
    borderRadius: "16px",
    border: "1px solid #ece2db",
    background: "#fff",
    boxShadow: "0 10px 30px -12px rgba(46,35,32,0.25)",
    fontSize: "13px",
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-rose">
        <Loader2 className="h-6 w-6 animate-spin"/>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-espresso">Boshqaruv paneli</h1>
        <p className="mt-1 text-sm text-taupe">Do'kon statistikasining umumiy ko'rinishi</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Foydalanuvchilar" value={dashboard?.totalUsers} icon={Users} accent="rose"/>
        <StatsCard title="Mahsulotlar" value={dashboard?.totalProducts} icon={Package} accent="gold"/>
        <StatsCard title="Buyurtmalar" value={dashboard?.totalOrders} icon={ShoppingBag} accent="sage"/>
        <StatsCard title="Umumiy daromad" value={formatPrice(dashboard?.totalRevenue)} icon={Banknote} accent="espresso"/>
      </div>

      {/* Orders by status */}
      <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-display text-xl font-semibold text-espresso">Buyurtmalar holati bo'yicha</h2>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart
            data={dashboard?.ordersByStatus}
            layout="vertical"
            margin={{top: 10, right: 30, left: 40, bottom: 5}}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ece2db"/>
            <XAxis type="number" stroke="#8a7b74" fontSize={12}/>
            <YAxis type="category" dataKey="_id" stroke="#8a7b74" fontSize={12} width={90}/>
            <Tooltip contentStyle={tooltipStyle} cursor={{fill: "#f7f0ea"}}/>
            <Bar dataKey="count" radius={[0, 8, 8, 0]} label={{position: "right", fill: "#2e2320", fontSize: 12}}>
              {dashboard?.ordersByStatus?.map((_, i) => (
                <Cell key={i} fill={barColors[i % barColors.length]}/>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly sales */}
      <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-display text-xl font-semibold text-espresso">Oylik sotuvlar</h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={dashboard?.monthlySales} margin={{top: 20, right: 30, left: 10, bottom: 5}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ece2db"/>
            <XAxis dataKey="monthName" stroke="#8a7b74" fontSize={12}/>
            <YAxis stroke="#8a7b74" fontSize={12}/>
            <Tooltip contentStyle={tooltipStyle}/>
            <Line
              type="monotone"
              dataKey="totalSales"
              stroke="#c58891"
              strokeWidth={3}
              dot={{r: 5, fill: "#9c5763"}}
              activeDot={{r: 7}}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AdminDashboard;
