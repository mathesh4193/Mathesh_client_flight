import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, BarChart3, LineChart, Plane } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext"; //  import

export default function ReportsAnalytics() {
  const { user, api } = useAuth(); //  use Auth context
  const [summary, setSummary] = useState(null);
  const [routeData, setRouteData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [classData, setClassData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // wait until user is loaded

    (async () => {
      try {
        //  Authenticated request
        const { data } = await api.get("/reports/summary");

        setSummary({
          totalBookings: data.totalBookings || 0,
          totalRevenue: data.totalSales || 0,
          avgPrice: data.avgPrice || 0,
          cancelRate: data.cancelRate || 0,
        });

        setMonthlyData(data.monthlyTrend || []);
        setRouteData(
          (data.popularRoutes || []).map((r) => ({
            route: `${r._id.origin} → ${r._id.dest}`,
            count: r.count,
          }))
        );
        setClassData(data.classDistribution || []);
      } catch (err) {
        console.error(" Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, api]);

  const COLORS = ["#2563eb", "#16a34a", "#facc15", "#ef4444", "#9333ea"];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading your personalized reports...
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />

      <div className="flex-grow py-10">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
            My Flight Reports & Analytics
          </h1>

          {/*  Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <SummaryCard
              icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
              label="My Total Bookings"
              value={summary.totalBookings}
            />
            <SummaryCard
              icon={<BarChart3 className="w-6 h-6 text-green-600" />}
              label="Total Revenue"
              value={`₹${summary.totalRevenue?.toLocaleString()}`}
            />
            <SummaryCard
              icon={<LineChart className="w-6 h-6 text-yellow-500" />}
              label="Avg. Booking Value"
              value={`₹${summary.avgPrice?.toLocaleString()}`}
            />
            <SummaryCard
              icon={<Plane className="w-6 h-6 text-red-500" />}
              label="Cancellation Rate"
              value={`${summary.cancelRate?.toFixed(1)}%`}
            />
          </div>

          {/*  Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <ChartCard title="My Monthly Booking Trends" color="blue">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="My Top Routes" color="green">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={routeData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="route" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#16a34a" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="My Travel Class Distribution"
              color="yellow"
              className="col-span-1 lg:col-span-2"
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={classData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {classData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/*  Summary Card */
const SummaryCard = ({ icon, label, value }) => (
  <div className="bg-white border rounded-2xl p-4 shadow hover:shadow-lg transition">
    <div className="flex items-center gap-3">
      <div className="p-3 rounded-full bg-blue-100">{icon}</div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

/*  Chart Card */
const ChartCard = ({ title, color, children, className }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
  };
  return (
    <div
      className={`p-6 rounded-2xl shadow-inner hover:shadow-md transition ${colorMap[color]} ${className}`}
    >
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
};
