import { create } from "zustand";
import { bookingAPI } from "@/lib/api";
import { Booking } from "@/types";
import { AxiosError } from "axios";
import {
  AddBookingFormData,
  CancelBookingFormData,
  UpdateBookingFormData,
} from "@/schemas/bookings.schema";

interface SalesOverviewData {
  name: string;
  weekly?: number;
  monthly?: number;
  yearly?: number;
  sales?: number;
}

interface MotorcycleCategoryData {
  name: string;
  value: number;
}

interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  totalCustomers: number;
  totalUsers: number; // Add total users field
  totalMotorcycles: number;
  motorcycleCategories: MotorcycleCategoryData[];
}

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

interface DetailedAnalytics {
  statusDistribution: StatusDistribution[];
  revenueTrend: RevenueTrend[];
  topMotorcycles: TopMotorcycle[];
  summary: {
    totalBookings: number;
    currentMonth: number;
    currentYear: number;
  };
}

interface AnalyticsState {
  stats: DashboardStats;
  salesOverview: SalesOverviewData[];
  detailedAnalytics: DetailedAnalytics | null;
}

interface BookingState {
  analytics: AnalyticsState;
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  metadata: {
    total: number;
    page: number;
    totalPages: number;
  };
  setBookings: (bookings: Booking[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setMetadata: (metadata: any) => void;
  // API functions
  getAllBookings: (params?: any) => Promise<void>;
  modifyBooking: (bookingId: string, data: any) => Promise<void>;
  cancelBooking: (
    bookingId: string,
    cancellationReason: string
  ) => Promise<void>;

  addBookingByAdmin: (data: AddBookingFormData) => Promise<void>;
  updateBookingByAdmin: (
    bookingId: string,
    data: UpdateBookingFormData
  ) => Promise<void>;
  cancelBookingByAdmin: (
    bookingId: string,
    data?: CancelBookingFormData
  ) => Promise<void>;
  deleteBookingByAdmin: (bookingId: string) => Promise<void>;

  // Payment Functions :
  generateRazorpayOrder: (mode: string, bookingId?: string, addons?: any[], homeDelivery?: boolean) => Promise<{ order: any; razorpayKeyId: string; }>;
  verifyRazorpayPayment: (data: {
    razorpay_payment_id: string;
    razorpay_signature: string;
    razorpay_order_id: string;
    amount: number;
    bookingId?: string;
  }) => Promise<Booking>;
  getDashboardStats: () => Promise<void>;
  getSalesOverview: (params?: any) => Promise<void>;
  fetchAnalytics: () => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  analytics: {
    stats: {
      totalRevenue: 0,
      totalBookings: 0,
      totalCustomers: 0,
      totalUsers: 0, // Add total users initial value
      totalMotorcycles: 0,
      motorcycleCategories: [],
    },
    salesOverview: [],
    detailedAnalytics: null,
  },
  bookings: [],
  loading: false,
  error: null,
  metadata: {
    total: 0,
    page: 1,
    totalPages: 1,
  },
  setBookings: (bookings) => set({ bookings }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setMetadata: (metadata) => set({ metadata }),

  // API functions
  getAllBookings: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await bookingAPI.getAllBookings(params);
      const { data, metadata } = response.data.data;
      set({ bookings: data, metadata: metadata[0], loading: false });
    } catch (error: AxiosError | any) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to get bookings",
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  modifyBooking: async (bookingId, data) => {
    set({ loading: true, error: null });
    try {
      const response = await bookingAPI.modifyBooking(bookingId, data);
      const { modifiedBooking, customer } = response.data.data;
      const updatedBooking = {
        ...modifiedBooking,
        customer,
      };
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b._id === bookingId ? updatedBooking : b
        ),
        loading: false,
      }));
    } catch (error: AxiosError | any) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to modify booking",
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  cancelBooking: async (bookingId, cancellationReason) => {
    set({ loading: true, error: null });
    try {
      const response = await bookingAPI.cancelBooking(
        bookingId,
        cancellationReason
      );
      const updatedBooking = response.data.data;

      set((state) => ({
        bookings: state.bookings.map((b) =>
          b._id === bookingId ? updatedBooking : b
        ),
        loading: false,
      }));
    } catch (error: AxiosError | any) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to cancel booking",
      });
      throw error;
    }
  },

  addBookingByAdmin: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await bookingAPI.addBookingByAdmin(data);
      const newBooking = response.data.data;
      set((state) => ({
        bookings: [newBooking, ...state.bookings],
        loading: false,
        metadata: { ...state.metadata, total: state.metadata.total + 1 },
      }));
      
      // Refresh analytics after adding a booking
      const { getDashboardStats, getSalesOverview } = get();
      getDashboardStats();
      getSalesOverview({ view: "monthly" });
    } catch (error: AxiosError | any) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to add booking",
      });
      throw error;
    }
  },

  updateBookingByAdmin: async (bookingId, data) => {
    set({ loading: true, error: null });
    try {
      const response = await bookingAPI.updateBookingByAdmin(bookingId, data);
      const updatedBooking = response.data.data;
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b._id === bookingId ? { ...b, ...updatedBooking } : b
        ),
        loading: false,
      }));
    } catch (error: AxiosError | any) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to update booking",
      });
      throw error;
    }
  },

  cancelBookingByAdmin: async (bookingId, data) => {
    set({ loading: true, error: null });
    try {
      const response = await bookingAPI.cancelBookingByAdmin(bookingId, data);
      const updatedBooking = response.data.data;

      set((state) => ({
        bookings: state.bookings.map((b) =>
          b._id === bookingId ? updatedBooking : b
        ),
        loading: false,
      }));
    } catch (error: AxiosError | any) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to cancel booking",
      });
      throw error;
    }
  },

  deleteBookingByAdmin: async (bookingId) => {
    set({ loading: true, error: null });
    try {
      await bookingAPI.deleteBookingByAdmin(bookingId);
      set((state) => ({
        bookings: state.bookings.filter((b) => b._id !== bookingId),
        loading: false,
      }));
    } catch (error: AxiosError | any) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to delete booking",
      });
      throw error;
    }
  },

  generateRazorpayOrder: async (mode, bookingId, addons, homeDelivery) => {
    set({ loading: true, error: null });
    try {
      const response = await bookingAPI.generateRazorpayOrder(mode, bookingId, addons, homeDelivery);
      const { order, booking, razorpayKeyId } = response.data.data;
      set((state) => {
        if (bookingId) {
          return {
            bookings: state.bookings.map((b) =>
              b._id === bookingId ? booking : b
            ),
            loading: false,
          };
        } else {
          return {
            bookings: [booking, ...state.bookings],
            loading: false,
          };
        }
      });
      // Return both order and razorpayKeyId
      return { order, razorpayKeyId };
    } catch (error: AxiosError | any) {
      set({
        loading: false,
        error:
          error.response?.data?.message || "Failed to generate razorpay order",
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  verifyRazorpayPayment: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await bookingAPI.verifyRazorpayOrder(data);
      const order = response.data.data;
      set((state) => ({
        bookings: state.bookings.map((b) => (b._id === order._id ? order : b)),
        loading: false,
      }));
      return order;
    } catch (error: AxiosError | any) {
      set({
        loading: false,
        error:
          error.response?.data?.message || "Failed to verify razorpay order",
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getDashboardStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await bookingAPI.getDashboardStats();
      const statsData = response.data.data;
      console.log("Dashboard stats received:", statsData);
      set((state) => ({
        analytics: { ...state.analytics, stats: statsData },
        loading: false,
      }));
    } catch (error: AxiosError | any) {
      const errorMsg = error.response?.data?.message || "Failed to fetch analytics";
      console.error("Dashboard stats error:", error);
      set({
        loading: false,
        error: errorMsg,
      });
      throw error;
    }
  },

  getSalesOverview: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await bookingAPI.getSalesOverview(params);
      const salesData = response.data.data;
      console.log("Sales overview received:", salesData);
      set((state) => ({
        analytics: { ...state.analytics, salesOverview: salesData },
        loading: false,
      }));
    } catch (error: AxiosError | any) {
      const errorMsg = error.response?.data?.message || "Failed to fetch analytics";
      console.error("Sales overview error:", error);
      set({
        loading: false,
        error: errorMsg,
      });
      throw error;
    }
  },

  fetchAnalytics: async () => {
    set({ loading: true, error: null });
    try {
      const response = await bookingAPI.getAnalytics();
      const analyticsData = response.data.data;
      console.log("Detailed analytics received:", analyticsData);
      set((state) => ({
        analytics: { ...state.analytics, detailedAnalytics: analyticsData },
        loading: false,
      }));
    } catch (error: AxiosError | any) {
      const errorMsg = error.response?.data?.message || "Failed to fetch detailed analytics";
      console.error("Detailed analytics error:", error);
      set({
        loading: false,
        error: errorMsg,
      });
      throw error;
    }
  },
}));
