export const AUTH_ROUTES = {
    SIGNUP: "/signup",
    LOGIN: "/signin",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    VERIFY_EMAIL: "/verify-email",
    CHANGE_PASSWORD: "/change-password",
    CHANGE_EMAIL: "/change-email",
    PROFILE: "/profile",
    ORDERS: "/orders",
    RETURN: "/return",
    EDITING_PROFILE: "/editing-profile",
    WISHLIST: "/wishlist",
    RETURN_REQUEST: "/return-request",
  };
  
  export const USER_PUBLIC_ROUTES = {
    HOME: "/",
    ABOUT: "/about",
    CONTACT: "/contact",
    SELL_YOUR_GEAR: "/sell-your-gear",
    SELL: "/sell-your-gear/sell",
  };
  /**
   * An array of routes that are accessible to the public
   * Those routes are not protected by the authentication middleware
   */
  export const publicRoutes = ["/", "/auth/verification"];
  
  /**
   * An array of routes that are used for authentication
   * These routes will redirect logged in users to the default login redirect
   */
  export const PRIVATE_ROUTES = {
    DASHBOARD: "/dashboard",
  };
  export const privateRoutes = ["/dashboard"];
  export const authRoutes = [
    "/login",
    "/registration",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/change-password",
  ];
  export const apiAuthPrefix = "/api/auth";
  export const DEFAULT_LOGIN_REDIRECT = "/settings";
  