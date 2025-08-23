// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   BikeIcon,
//   CalendarIcon,
//   DollarSignIcon,
//   UsersIcon,
// } from "lucide-react";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   Cell,
//   Pie,
//   PieChart,
//   ResponsiveContainer,
//   Tooltip as RechartsTooltip,
//   XAxis,
//   YAxis,
// } from "recharts";

// // Sample data for charts
// const salesData = [
//   { name: "Jan", weekly: 12000, monthly: 45000, yearly: 180000 },
//   { name: "Feb", weekly: 15000, monthly: 52000, yearly: 195000 },
//   { name: "Mar", weekly: 18000, monthly: 48000, yearly: 210000 },
//   { name: "Apr", weekly: 22000, monthly: 65000, yearly: 225000 },
//   { name: "May", weekly: 25000, monthly: 70000, yearly: 240000 },
//   { name: "Jun", weekly: 28000, monthly: 75000, yearly: 255000 },
// ];

// const bikesSalesData = [
//   { name: "Cruiser", value: 35, color: "#8884d8" },
//   { name: "Superbike", value: 25, color: "#82ca9d" },
//   { name: "Adventure", value: 20, color: "#ffc658" },
//   { name: "Touring", value: 15, color: "#ff7300" },
//   { name: "Scooter", value: 5, color: "#00ff00" },
// ];

// interface OverviewTabProps {
//   totalRevenue: number;
//   totalBookings: number;
//   totalCustomers: number;
//   totalMotorcycles: number;
//   selectedPeriod: string;
//   setSelectedPeriod: (value: string) => void;
// }

// export default function OverviewTab({
//   totalRevenue,
//   totalBookings,
//   totalCustomers,
//   totalMotorcycles,
//   selectedPeriod,
//   setSelectedPeriod,
// }: OverviewTabProps) {
//   return (
//     <>
//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Total Revenue
//             </CardTitle>
//             <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               ₹{totalRevenue.toLocaleString()}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               +12% from last month
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Total Bookings
//             </CardTitle>
//             <CalendarIcon className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{totalBookings}</div>
//             <p className="text-xs text-muted-foreground">
//               +8% from last month
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Total Customers
//             </CardTitle>
//             <UsersIcon className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{totalCustomers}</div>
//             <p className="text-xs text-muted-foreground">
//               +15% from last month
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Total Motorcycles
//             </CardTitle>
//             <BikeIcon className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{totalMotorcycles}</div>
//             <p className="text-xs text-muted-foreground">+2 new this month</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center justify-between">
//               Sales Overview
//               <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
//                 <SelectTrigger className="w-32">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="weekly">Weekly</SelectItem>
//                   <SelectItem value="monthly">Monthly</SelectItem>
//                   <SelectItem value="yearly">Yearly</SelectItem>
//                 </SelectContent>
//               </Select>
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={salesData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <RechartsTooltip />
//                 <Bar dataKey={selectedPeriod} fill="#8884d8" />
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Motorcycle Categories</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={bikesSalesData}
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="value"
//                   label={({ name, value }) => `${name}: ${value}%`}
//                 >
//                   {bikesSalesData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <RechartsTooltip />
//               </PieChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>
//     </>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useBookingStore } from "@/store/booking-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { DollarSign, Bike, Users, BookCopy, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

// Stat Card Component for the top section
const StatCard = ({
  title,
  value,
  icon: Icon,
  change,
  changeText,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  change?: string;
  changeText?: string;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold text-card-foreground">{value}</h3>
          {change && changeText && (
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500 font-semibold">{change}</span>{" "}
              {changeText}
            </p>
          )}
        </div>
        <div className="bg-muted rounded-full p-3">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function OverviewTab() {
  const { analytics, loading, getDashboardStats, getSalesOverview, getAllBookings, bookings } =
    useBookingStore();
  const { stats, salesOverview } = analytics;
  const [salesView, setSalesView] = useState<"monthly" | "yearly">("monthly");

  // Refresh dashboard stats when component mounts or becomes active
  useEffect(() => {
    const refreshAnalytics = () => {
      getDashboardStats();
      getSalesOverview({ view: salesView });
      // Fetch recent bookings (limit to 5 most recent)
      getAllBookings({ page: 1, offset: 5, sortBy: 'createdAt', sortOrder: 'desc' });
    };

    refreshAnalytics();
    
    // Set up interval to refresh every 30 seconds for live updates
    const interval = setInterval(refreshAnalytics, 30000);
    
    return () => clearInterval(interval);
  }, [getDashboardStats, getSalesOverview, getAllBookings, salesView]);

  useEffect(() => {
    getSalesOverview({ view: salesView });
  }, [getSalesOverview, salesView]);

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
      icon: DollarSign,
      change: "+12%",
      changeText: "from last month",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings.toString(),
      icon: BookCopy,
      change: "+8%",
      changeText: "from last month",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toString(),
      icon: Users,
      change: "+15%",
      changeText: "from last month",
    },
    {
      title: "Total Motorcycles",
      value: stats.totalMotorcycles.toString(),
      icon: Bike,
      change: "+2",
      changeText: "new this month",
    },
  ];

  // Config for Pie Chart
  const PIE_COLORS = ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"];
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent * 100 < 5) return null; // Don't render label for small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500";
      case "CONFIRMED":
        return "bg-blue-500";
      case "STARTED":
        return "bg-green-500";
      case "COMPLETED":
        return "bg-gray-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading && !salesOverview.length && !stats.totalRevenue) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Debug: Log data for troubleshooting
  console.log("Analytics Data:", { stats, salesOverview });

  return (
    <div className="space-y-6">
      {/* Debug Info Card - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-yellow-800">Debug Info:</h4>
            <p className="text-sm text-yellow-700">
              Revenue: ₹{stats.totalRevenue?.toLocaleString() || 0} | 
              Bookings: {stats.totalBookings || 0} | 
              Sales Data Points: {salesOverview?.length || 0} |
              Categories: {stats.motorcycleCategories?.length || 0}
            </p>
          </CardContent>
        </Card>
      )}
      {/* Stat Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Sales Overview</CardTitle>
              <Select
                value={salesView}
                onValueChange={(value: "monthly" | "yearly") =>
                  setSalesView(value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly (Cumulative)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesOverview}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  formatter={(value: number, name: string) => [
                    `₹${value.toLocaleString("en-IN")}`,
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                />
                <Bar
                  dataKey={salesView === "monthly" ? "monthly" : "yearly"}
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Motorcycle Categories Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Motorcycle Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.motorcycleCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                >
                  {stats.motorcycleCategories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} bikes`,
                    name,
                  ]}
                />
                <Legend
                  iconSize={10}
                  wrapperStyle={{
                    fontSize: "14px",
                    paddingTop: "20px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings Section */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Bookings</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/all-bookings">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && bookings.length === 0 ? (
            <p>Loading recent bookings...</p>
          ) : bookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.slice(0, 5).map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell className="font-medium">
                      {booking._id.slice(-6).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.customer.fullname}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.customer.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getStatusColor(booking.status)} text-white`}
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      ₹{booking.paidAmount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(booking.bookingDate), "MMM dd, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

