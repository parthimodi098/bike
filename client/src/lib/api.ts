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

// Helper functions for mobile/environment detection
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const isProdDomain = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'www.torqrides.com' || hostname === 'torqrides.com';
};

// Function to determine the best API URL to use
const getApiUrl = () => {
  // Use environment variable if available
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // If we're in a browser context
  if (typeof window !== 'undefined') {
    // Log detection info
    const mobile = isMobileDevice();
    const hostname = window.location.hostname;
    console.log("Device detection - Mobile:", mobile);
    console.log("Hostname:", hostname);
    
    // If we're on the production domain or on a mobile device
    if (isProdDomain() || mobile) {
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
    if (typeof window === 'undefined') return config;
    
    // Try to get the token from localStorage
    const token = localStorage.getItem('accessToken');
    const mobile = isMobileDevice();
    const prod = isProdDomain();
    
    // Special handling for mobile devices and production domains
    if (mobile || prod) {
      // Always set withCredentials for CORS requests with cookies
      config.withCredentials = true;
      
      // Add Authorization header for all requests if token exists
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`Token attached to request: ${config.url} - Token: ${token.substring(0, 20)}...`);
      } else {
        console.log(`No token for request: ${config.url}`);
        
        // For requests that might need tokens, try a token check
        if (config.url?.includes('/carts') || 
            config.url?.includes('/bookings') || 
            config.url?.includes('/users')) {
          // Log the issue for debugging
          console.log("Missing token for authenticated endpoint");
        }
      }
    } else if (token) {
      // For non-mobile/production, still use token if available
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
    try {
      console.log("Attempting login...");
      const response = await api.post("/users/login", data);
      
      // Store tokens in localStorage regardless of device type
      if (response.data?.success && typeof window !== 'undefined') {
        // Extract tokens from response 
        const accessToken = response.data?.data?.accessToken;
        const refreshToken = response.data?.data?.refreshToken;
        
        console.log("Login successful");
        console.log("Tokens in response:", !!accessToken, !!refreshToken);
        
        // Store tokens in localStorage if they're available
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          console.log("Access token stored in localStorage");
        } else {
          console.warn("No access token in response to store");
        }
        
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
          console.log("Refresh token stored in localStorage");
        }
        
        // Special handling for mobile devices or production domain
        if (isMobileDevice() || isProdDomain()) {
          // Force a small delay before the next request to ensure token is stored
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Force validate the token was stored and make a test request
          const storedToken = localStorage.getItem('accessToken');
          console.log("Token verification after login:", !!storedToken);
          
          // Test the token with a simple request
          try {
            // Make a test request to the mobile-check endpoint
            const checkResponse = await api.get('/mobile-check');
            console.log("Mobile auth check successful:", checkResponse.data);
          } catch (error) {
            console.error("Mobile auth check failed:", error);
          }
        }
      }
      
      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
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

  generateRazorpayOrder: (mode: string, bookingId?: string, addons?: any[], homeDelivery?: boolean) =>
    api.post("/bookings/provider/razorpay", { mode, bookingId, addons, homeDelivery }),

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
  getAnalytics: () => api.get("/bookings/analytics"),
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
    // Always use the main API client with its interceptors for all requests
    // This ensures the token is consistently applied through the interceptor
    return api.get("/carts");
  },
  
  addOrUpdateMotorcycleToCart: (motorcycleId: string, data: any) => {
    // For debugging on all platforms
    if (typeof window !== 'undefined') {
      console.log("Adding to cart from domain:", window?.location?.hostname);
      const token = localStorage.getItem('accessToken');
      console.log("Token available:", !!token);
    }
    
    // Always use the main API client with its interceptors for all requests
    // This ensures the token is consistently applied through the interceptor
    return api.post(`/carts/item/${motorcycleId}`, data);
  },
  
  removeMotorcycleFromCart: (motorcycleId: string) => {
    // Always use the main API client with its interceptors for consistent token handling
    return api.delete(`/carts/item/${motorcycleId}`);
  },
  
  clearCart: () => {
    // Always use the main API client with its interceptors for consistent token handling
    return api.delete("/carts/clear");
  },

  applyCoupon: (data: { couponCode: string }) => {
    // Always use the main API client with its interceptors for consistent token handling
    return api.post("/coupons/c/apply", data);
  },
  
  removeCouponFromCart: () => {
    // Always use the main API client with its interceptors for consistent token handling
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
      
      // Check if this is likely a mobile device
      const isMobile = typeof window !== 'undefined' && 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // If mobile, try to recover by forcing user to login page
      if (isMobile && typeof window !== 'undefined') {
        // Store current page URL in localStorage to redirect back after login
        const currentPath = window.location.pathname + window.location.search;
        localStorage.setItem('redirectAfterLogin', currentPath);
        
        console.log("Mobile auth failure detected - redirecting to login");
        
        // Force navigation to login page with redirect parameter
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&auth=expired`;
        
        // Return a special error that the UI can handle gracefully
        return Promise.reject({
          ...error,
          isAuthError: true,
          cartOperation: true,
          redirected: true,
          message: "Redirecting to login page..."
        });
      }
      
      // Standard error for non-mobile devices
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
