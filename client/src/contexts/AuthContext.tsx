import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { loginUser, signupUser } from "@/services/auth";

export type UserRole = "student" | "teacher" | "professional" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // 🔥 LOAD USER SAFELY FROM LOCAL STORAGE
  // ==========================================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Invalid user in localStorage");
        localStorage.clear();
      }
    } else {
      // 🔥 cleanup if mismatch
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }

    setLoading(false);
  }, []);

  // ==========================================
  // 🔥 LOGIN
  // ==========================================
  const login = async (email: string, password: string) => {
    try {
      const res = await loginUser({ email, password });

      const userData = res.user;

      // 🔥 normalize role (IMPORTANT)
      const normalizedUser: User = {
        ...userData,
        role:
          typeof userData.role === "string"
            ? userData.role.toLowerCase()
            : userData.role?.name?.toLowerCase(),
      };

      // save
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));

      setUser(normalizedUser);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Login failed",
      };
    }
  };

  // ==========================================
  // 🔥 SIGNUP
  // ==========================================
  const signup = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => {
    try {
      await signupUser({
        email,
        password,
        name,
        role,
      });

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Signup failed",
      };
    }
  };

  // ==========================================
  // 🔥 LOGOUT
  // ==========================================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// 🔥 HOOK
// ==========================================
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}