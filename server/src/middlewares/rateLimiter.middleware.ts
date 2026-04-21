import rateLimit from "express-rate-limit";

// 🔐 Rate limiter for auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true, // return rate limit info in headers
  legacyHeaders: false, // disable X-RateLimit headers

  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});