import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import {getDashboard} from "@/store/admin/dashboard-slice/index.js";
import StatsCard from "@/components/admin-view/stats-card.jsx";
import {Card, CardContent} from "@/components/ui/card.jsx";
import {Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis} from "recharts";
import {Loader2} from "lucide-react";

function AdminDashboard() {
  const dispatch = useDispatch()

  const {dashboard, isLoading} = useSelector(state => state.dashboard)

  useEffect(() => {
    dispatch(getDashboard())
  }, [dispatch]);

  const pieColors = ["#4F46E5", "#22C55E", "#F59E0B", "#EF4444"];
  const barColors = [
    "#4F46E5",
    "#0EA5E9",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#14B8A6",
    "#D946EF",
    "#F43F5E",
    "#22C55E",
    "#EAB308",
    "#3B82F6"
  ];

  if (isLoading) return <div className={"flex justify-center animate-spin"}><Loader2 /></div>

  return (
    <>
      <div className="p-6 space-y-6">

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Total Users" value={dashboard?.totalUsers}/>
          <StatsCard title="Total Products" value={dashboard?.totalProducts}/>
          <StatsCard title="Total Orders" value={dashboard?.totalOrders}/>
          <StatsCard title="Total Revenue" value={`$${dashboard?.totalRevenue}`}/>
        </div>

        {/* Pie Chart */}
        <Card className="p-4 rounded-2xl">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Order Status Breakdown</h2>

            <BarChart
              width={"100%"}
              height={350}
              data={dashboard?.ordersByStatus}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="_id" />
              <Tooltip />
              <Bar dataKey="count" label={{ position: "right", fill: "#000", fontSize: 12 }}>
                {dashboard?.ordersByStatus?.map((_, i) => (
                  <Cell key={i} fill={barColors[i % barColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </CardContent>
        </Card>

        <Card className="p-4 rounded-2xl">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Monthly Sales</h2>

            <LineChart
              width={"100%"}
              height={320}
              data={dashboard?.monthlySales}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthName" />
              <YAxis />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="totalSales"
                stroke="#4F46E5"
                strokeWidth={3}
                dot={{ r: 6, fill: "#4F46E5" }}
                activeDot={{ r: 8 }}
                label={{ position: "top", fill: "#000", fontSize: 12 }}
              />
            </LineChart>
          </CardContent>
        </Card>


      </div>
    </>
  )
}

export default AdminDashboard