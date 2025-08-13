import {
  AssignRoleFormData,
  ChangeCurrentPasswordFormData,
  LoginFormData,
  SignupFormData,
  UpdateProfileFormData,
} from "@/schemas/users.schema";
import {
  ForgotPasswordFormData,
  ResetPasswordFormData,
} from "@/schemas/users.schema";
import { ApiError } from "@/types/api";
import axios from "axios";
import {
  CreateMotorcycleLogFormData,
  UpdateMotorcycleLogFormData,
} from "@/schemas/motorcycle-logs.schema";
import { CouponFormData, UpdateCouponFormData } from "@/schemas/coupons.schema";
import { initialAuthState } from "@/store/auth-store";
import { initialCartState } from "@/store/cart-store";
import {
  AddBookingFormData,
  UpdateBookingFormData,
  CancelBookingFormData,
} from "@/schemas/bookings.schema";

// Function to determine the best API URL to use
const getApiUrl = () => {
  // Use environment variable if available
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // If we're in a browser context
  if (typeof window !== 'undefined') {
    // Check current hostname
    const hostname = window.location.hostname;
    
    // Check if we're on a mobile device (simplified check)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    console.log("Device detection - Mobile:", isMobile);
    console.log("Hostname:", hostname);
    
    // If we're on the production domain
    if (hostname === 'www.torqrides.com' || hostname === 'torqrides.com') {
      return "https://gohive.work/api/v1";
    }
    
    // If on mobile but not on production domain, use the live server URL
    if (isMobile) {
      return "https://gohive.work/api/v1";
    }
  }
  
  // Default fallback
  return "http://localhost:8000/api/v1";
};

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
  timeout: 120000,
});

// Add request interceptor for better mobile compatibility
api.interceptors.request.use(
  (config) => {
    // Try to get the token from localStorage for mobile compatibility
    // This works as a fallback when cookies aren't working on mobile
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    // If token exists in localStorage and no Authorization header is set, add it
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  getCurrentUser: () => api.get("/users"),
  register: (data: SignupFormData) => api.post("/users/register", data),
  login: async (data: LoginFormData) => {
    const response = await api.post("/users/login", data);
    
    // Store tokens in localStorage as a backup for mobile browsers
    if (response.data?.success && typeof window !== 'undefined') {
      // Extract tokens from response if available (server may include them in response)
      const accessToken = response.data?.data?.accessToken || response.data?.accessToken;
      const refreshToken = response.data?.data?.refreshToken || response.data?.refreshToken;
      
      console.log("Login successful, storing tokens for mobile compatibility");
      
      // Store tokens in localStorage if they're available
      if (accessToken) localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    }
    
    return response;
  },
  logout: async () => {
    // First try to logout via the API
    try {
      await api.post("/users/logout");
    } catch (error) {
      console.log("Logout API call failed, continuing with local cleanup");
    } finally {
      // Always clear localStorage tokens for mobile compatibility
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        console.log("Cleared localStorage tokens during logout");
      }
    }
  },
  refreshAccessToken: async () => {
    const response = await api.post("/users/refresh-tokens");
    
    // Store tokens in localStorage as a backup for mobile browsers
    if (response?.data?.success && typeof window !== 'undefined') {
      // Extract tokens from response
      const accessToken = response.data?.data?.accessToken || response.data?.accessToken;
      const refreshToken = response.data?.data?.refreshToken || response.data?.refreshToken;
      
      console.log("Token refresh successful, updating stored tokens");
      
      // Store tokens in localStorage if they're available
      if (accessToken) localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    }
    
    return response;
  },
  verifyEmail: (token: string) => api.get(`/users/verify?token=${token}`),
  forgotPasswordRequest: (data: ForgotPasswordFormData) =>
    api.post("/users/forgot-password", data),
  resetForgottenPassword: (token: string, data: ResetPasswordFormData) =>
    api.post(`/users/reset-password?token=${token}`, data),
  changeAvatar: (formData: FormData) =>
    api.post("/users/profile/change-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  resendVerificationEmail: () =>
    api.post("/users/profile/resend-verification-email"),
  changeCurrentPassword: (data: ChangeCurrentPasswordFormData) =>
    api.post("/users/profile/change-current-password", {
      oldPassword: data.currentPassword,
      ...data,
    }),
  uploadDocument: (formData: FormData) =>
    api.post("/users/profile/upload-documents", formData),
  deleteUserAccount: (userId: string) => api.delete(`/users/${userId}`),
  assignRole: (userId: string, data: AssignRoleFormData) =>
    api.post(`/users/profile/assign-role/${userId}`, data),
  getAllUsers: (params: any) => api.get("/users/all-users", { params }),
  updateUserProfile: (data: UpdateProfileFormData) =>
    api.post("/users/profile/update-profile", data),
  deleteUserDocument: (documentId: string) =>
    api.delete(`/users/profile/delete-document/${documentId}`),
};

export const motorcycleAPI = {
  getAllMotorcycles: (params?: any) => api.get("/motorcycles", { params }),

  addMotorcycle: (data: FormData) => api.post("/motorcycles", data),

  getMotorcycleById: (motorcycleId: string) =>
    api.get(`/motorcycles/${motorcycleId}`),

  updateMotorcycleDetails: (motorcycleId: string, data: any) =>
    api.put(`/motorcycles/${motorcycleId}`, data),

  updateMotorcycleAvailability: (motorcycleId: string, data: any) =>
    api.post(`/motorcycles/${motorcycleId}`, data),

  deleteMotorcycle: (motorcycleId: string) =>
    api.delete(`/motorcycles/${motorcycleId}`),

  deleteMotorcycleImage: (motorcycleId: string, imageId: string) =>
    api.patch(`/motorcycles/${motorcycleId}`, { imageId }),

  getAllFilters: () => api.get("/motorcycles/filters"),
  // Motorcycle-Logs API

  getAllMotorcycleLogs: (params?: any) =>
    api.get("/motorcycles/logs", { params }),

  createMotorcycleLog: (
    motorcycleId: string,
    data: CreateMotorcycleLogFormData
  ) => api.post(`/motorcycles/logs/${motorcycleId}`, data),

  getMotorcycleLogs: (motorcycleId: string, params?: any) =>
    api.get(`/motorcycles/logs/${motorcycleId}`, { params }),

  updateMotorcycleLog: (logId: string, data: UpdateMotorcycleLogFormData) =>
    api.put(`/motorcycles/logs/${logId}`, data),

  deleteMotorcycleLog: (logId: string) =>
    api.delete(`/motorcycles/logs/${logId}`),

  getMotorcycleLogFilters: () => api.get("/motorcycles/logs/filters"),
};

export const bookingAPI = {
  getAllBookings: (params?: any) => api.get("/bookings", { params }),

  modifyBooking: (bookingId: string, data: any) =>
    api.put(`/bookings/${bookingId}`, data),

  cancelBooking: (bookingId: string, cancellationReason: string) => api.delete(`/bookings/${bookingId}`, { data: { cancellationReason } }),

  addBookingByAdmin: (data: AddBookingFormData) => api.post("/bookings", data),

  updateBookingByAdmin: (bookingId: string, data: UpdateBookingFormData) =>
    api.put(`/bookings/${bookingId}/admin`, data),

  cancelBookingByAdmin: (
    bookingId: string,
    data: CancelBookingFormData | undefined
  ) => api.patch(`/bookings/${bookingId}/admin`, { data }),

  deleteBookingByAdmin: (bookingId: string) =>
    api.delete(`/bookings/${bookingId}/admin`),

  generateRazorpayOrder: (mode: string, bookingId?: string) =>
    api.post("/bookings/provider/razorpay", { mode, bookingId }),

  verifyRazorpayOrder: (data: {
    razorpay_payment_id: string;
    razorpay_signature: string;
    razorpay_order_id: string;
    amount: number;
    bookingId?: string;
  }) => api.post("/bookings/provider/razorpay/verify-payment", data),

  getDashboardStats: () => api.get("/bookings/stats"),
  getSalesOverview: (params?: any) =>
    api.get("/bookings/sales-overview", { params }),
};

export const reviewAPI = {
  getAllReviewsOfMotorcycleById: (motorcycleId: string) =>
    api.get(`/reviews/${motorcycleId}`),
  addNewReviewToBookingId: (bookingId: string, data: any) =>
    api.post(`/reviews/${bookingId}`, data),
  updateReviewById: (reviewId: string, data: any) =>
    api.put(`/reviews/${reviewId}`, data),
  deleteReviewById: (reviewId: string) => api.delete(`/reviews/${reviewId}`),
};

export const couponAPI = {
  getAllCoupons: () => api.get("/coupons"),
  createCoupon: (data: CouponFormData) => api.post("/coupons", data),
  getCouponById: (couponId: string) => api.get(`/coupons/${couponId}`),
  updateCoupon: (couponId: string, data: UpdateCouponFormData) =>
    api.put(`/coupons/${couponId}`, data),
  updateCouponActiveStatus: (couponId: string, data: { isActive: boolean }) =>
    api.patch(`/coupons/${couponId}`, data),
  deleteCoupon: (couponId: string) => api.delete(`/coupons/${couponId}`),
};

export const cartAPI = {
  getUserCart: () => {
    // Ensure token is attached for mobile devices
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const isTorqRidesDomain = typeof window !== 'undefined' && 
      (window.location.hostname === 'www.torqrides.com' || window.location.hostname === 'torqrides.com');
      
    // For production domain or mobile, always include token in header
    if (token || isTorqRidesDomain) {
      console.log("Adding auth header to cart request");
      return api.get("/carts", {
        headers: { 
          Authorization: `Bearer ${token || ''}`,
          'X-Requested-From': isTorqRidesDomain ? 'torqrides-production' : 'other'
        }
      });
    }
    
    return api.get("/carts");
  },
  
  addOrUpdateMotorcycleToCart: (motorcycleId: string, data: any) => {
    // Ensure token is attached for mobile devices
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const isTorqRidesDomain = typeof window !== 'undefined' && 
      (window.location.hostname === 'www.torqrides.com' || window.location.hostname === 'torqrides.com');
    
    // For debugging
    console.log("Adding to cart from domain:", window?.location?.hostname);
    console.log("Token available:", !!token);
    
    // For production domain or mobile, always include token in header
    if (token || isTorqRidesDomain) {
      console.log("Adding auth header to add-to-cart request");
      return api.post(`/carts/item/${motorcycleId}`, data, {
        headers: { 
          Authorization: `Bearer ${token || ''}`,
          'X-Requested-From': isTorqRidesDomain ? 'torqrides-production' : 'other'
        }
      });
    }
    
    return api.post(`/carts/item/${motorcycleId}`, data);
  },
  
  removeMotorcycleFromCart: (motorcycleId: string) => {
    // Ensure token is attached for mobile devices
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const isTorqRidesDomain = typeof window !== 'undefined' && 
      (window.location.hostname === 'www.torqrides.com' || window.location.hostname === 'torqrides.com');
      
    // For production domain or mobile, always include token in header
    if (token || isTorqRidesDomain) {
      return api.delete(`/carts/item/${motorcycleId}`, {
        headers: { 
          Authorization: `Bearer ${token || ''}`,
          'X-Requested-From': isTorqRidesDomain ? 'torqrides-production' : 'other'
        }
      });
    }
    
    return api.delete(`/carts/item/${motorcycleId}`);
  },
  
  clearCart: () => {
    // Ensure token is attached for mobile devices
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const isTorqRidesDomain = typeof window !== 'undefined' && 
      (window.location.hostname === 'www.torqrides.com' || window.location.hostname === 'torqrides.com');
      
    // For production domain or mobile, always include token in header
    if (token || isTorqRidesDomain) {
      return api.delete("/carts/clear", {
        headers: { 
          Authorization: `Bearer ${token || ''}`,
          'X-Requested-From': isTorqRidesDomain ? 'torqrides-production' : 'other'
        }
      });
    }
    
    return api.delete("/carts/clear");
  },

  applyCoupon: (data: { couponCode: string }) => {
    // Ensure token is attached for mobile devices
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const isTorqRidesDomain = typeof window !== 'undefined' && 
      (window.location.hostname === 'www.torqrides.com' || window.location.hostname === 'torqrides.com');
      
    // For production domain or mobile, always include token in header
    if (token || isTorqRidesDomain) {
      return api.post("/coupons/c/apply", data, {
        headers: { 
          Authorization: `Bearer ${token || ''}`,
          'X-Requested-From': isTorqRidesDomain ? 'torqrides-production' : 'other'
        }
      });
    }
    
    return api.post("/coupons/c/apply", data);
  },
  
  removeCouponFromCart: () => {
    // Ensure token is attached for mobile devices
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const isTorqRidesDomain = typeof window !== 'undefined' && 
      (window.location.hostname === 'www.torqrides.com' || window.location.hostname === 'torqrides.com');
      
    // For production domain or mobile, always include token in header
    if (token || isTorqRidesDomain) {
      return api.post("/coupons/c/remove", {}, {
        headers: { 
          Authorization: `Bearer ${token || ''}`,
          'X-Requested-From': isTorqRidesDomain ? 'torqrides-production' : 'other'
        }
      });
    }
    
    return api.post("/coupons/c/remove", {});
  },
};

let refreshingTokenInProgress = false;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 2;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("API Error:", error?.response?.status, error?.config?.url);
    
    // Handle refresh token endpoint failure
    if (error?.config?.url?.includes("refresh-token")) {
      console.log("Refresh token failed, redirecting to login");
      localStorage.setItem("auth-storage", JSON.stringify(initialAuthState));
      localStorage.setItem("cart-storage", JSON.stringify(initialCartState));
      
      // Clear any stored tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Only redirect if in browser context
      if (typeof window !== 'undefined') {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // Handle 401 errors (unauthorized/session expired)
    if (
      error?.response?.status === 401 &&
      !error?.config?.url?.includes("login") &&
      refreshAttempts < MAX_REFRESH_ATTEMPTS &&
      !refreshingTokenInProgress
    ) {
      console.log("Session expired, attempting token refresh");
      refreshingTokenInProgress = true;
      refreshAttempts++;

      try {
        // Try to refresh the token
        const response = await authAPI.refreshAccessToken();
        
        // Reset attempts on success
        refreshAttempts = 0;
        refreshingTokenInProgress = false;
        
        // If token refresh was successful, retry the original request
        if (!(response instanceof ApiError)) {
          console.log("Token refresh successful, retrying request");
          
          // Make sure the retried request includes the token in Authorization header
          const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
          if (token && error.config) {
            error.config.headers = error.config.headers || {};
            error.config.headers.Authorization = `Bearer ${token}`;
          }
          
          return axios(error.config);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }
      
      refreshingTokenInProgress = false;
    }
    
    // For mobile cart operations, provide a more specific error message
    if (
      error?.response?.status === 401 &&
      error?.config?.url?.includes("/carts")
    ) {
      console.error("Cart operation failed due to authentication issue");
      // Structured error for better handling
      return Promise.reject({
        ...error,
        isAuthError: true,
        cartOperation: true,
        message: "Please log in again to continue shopping"
      });
    }

    return Promise.reject(error);
  }
);

export default api;

