"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { useBookingStore } from "@/store/booking-store";

interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
  totalRevenue: number;
}

interface RevenueTrend {
  name: string;
  monthly: number;
  bookingCount: number;
}

interface TopMotorcycle {
  _id: string;
  name: string;
  make: string;
  totalRevenue: number;
  bookingCount: number;
}

interface AnalyticsData {
  statusDistribution: StatusDistribution[];
  revenueTrend: RevenueTrend[];
  topMotorcycles: TopMotorcycle[];
  summary: {
    totalBookings: number;
    currentMonth: number;
    currentYear: number;
  };
}

export default function AnalyticsTab() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { analytics, fetchAnalytics } = useBookingStore();

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        await fetchAnalytics();
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    if (analytics.detailedAnalytics) {
      setAnalyticsData(analytics.detailedAnalytics);
    }
  }, [analytics.detailedAnalytics]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-600';
      case 'pending':
        return 'bg-yellow-600';
      case 'completed':
        return 'bg-blue-600';
      case 'cancelled':
        return 'bg-red-600';
      case 'started':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center text-gray-500">
        No analytics data available
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Advanced Analytics</h2>
      
      {/* Debug card */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-700">
            Total Bookings: {analyticsData.summary?.totalBookings || 0} | 
            Revenue Points: {analyticsData.revenueTrend?.length || 0} | 
            Status Types: {analyticsData.statusDistribution?.length || 0}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.revenueTrend && analyticsData.revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value, name) => [
                      `₹${Number(value).toLocaleString()}`,
                      name === 'monthly' ? 'Revenue' : name
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="monthly"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.statusDistribution && analyticsData.statusDistribution.length > 0 ? (
                analyticsData.statusDistribution.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="capitalize">{item.status?.toLowerCase()}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getStatusColor(item.status)}`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{item.percentage}%</span>
                      <span className="text-xs text-gray-500">({item.count})</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">
                  No status distribution data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Motorcycles */}
      {analyticsData.topMotorcycles && analyticsData.topMotorcycles.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Top Performing Motorcycles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.topMotorcycles.map((bike, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{bike.name}</span>
                    <span className="text-gray-500 ml-2">({bike.make})</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₹{bike.totalRevenue?.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{bike.bookingCount} bookings</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
