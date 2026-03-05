import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { User, authAPI } from "@/lib/api";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, userData?: User) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);
  const lastChecked = useRef<number>(0);

  // ✅ Initialize auth on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await authAPI.getMe();
        setUser(res.data.data.user);
        lastChecked.current = Date.now();
      } catch (err: any) {
        console.error("Auth initialization failed:", err);
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ✅ Socket lifecycle management
  useEffect(() => {
    if (user && !isLoading) {
      const token = localStorage.getItem("token");
      if (token) {
        import("@/lib/socket").then(({ connectSocket }) => {
          connectSocket(token);
        });
      }
    } else if (!user && !isLoading) {
      import("@/lib/socket").then(({ disconnectSocket }) => {
        disconnectSocket();
      });
    }
  }, [user?._id, isLoading]);

  // ✅ Robust login function
  const login = async (token: string, userData?: User) => {
    localStorage.setItem("token", token);
    lastChecked.current = Date.now();

    if (userData) {
      setUser(userData);
      return;
    }

    try {
      setIsLoading(true);
      const res = await authAPI.getMe();
      setUser(res.data.data.user);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        setUser(null);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    import("@/lib/socket").then(({ disconnectSocket }) => {
      disconnectSocket();
    });
    toast.success("Logged out successfully");
  };

  // ✅ Throttled checkAuth to prevent 429 errors
  const checkAuth = async (force = false) => {
    const now = Date.now();
    // Throttle: only check if forced or > 30 seconds since last check
    if (!force && now - lastChecked.current < 30000) {
      return;
    }

    try {
      const res = await authAPI.getMe();
      const newUser = res.data.data.user;

      // Only update state if data actually changed to prevent unnecessary re-renders
      if (JSON.stringify(newUser) !== JSON.stringify(user)) {
        setUser(newUser);
      }
      lastChecked.current = now;
    } catch (err: any) {
      console.error("Auth check failed:", err);
      // Don't log out on 429 or temporary network errors
      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        setUser(null);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
