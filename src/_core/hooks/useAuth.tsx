import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  requestMagicLink: (input: { phone?: string; email?: string; name?: string }) => Promise<void>;
  consumeMagicLink: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const requestMagicLinkMutation = trpc.auth.requestMagicLink.useMutation();
  const consumeMagicLinkMutation = trpc.auth.consumeMagicLink.useMutation();

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (token) {
          // In a real app, validate token with server
          const userData = localStorage.getItem("user_data");
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const requestMagicLink = async (input: { phone?: string; email?: string; name?: string }) => {
    setLoading(true);
    try {
      await requestMagicLinkMutation.mutateAsync({
        phone: input.phone,
        email: input.email,
        name: input.name,
      });
    } catch (error) {
      console.error("requestMagicLink failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const consumeMagicLink = async (token: string) => {
    setLoading(true);
    try {
      const userInfo = await consumeMagicLinkMutation.mutateAsync({ token });
      const sessionUser: User = {
        id: userInfo.openId,
        email: userInfo.email || "",
        name: userInfo.name || (userInfo.email ? userInfo.email.split("@")[0] : "Customer"),
        role: (userInfo.role as any) || "user",
      };

      localStorage.setItem("auth_token", "magic_link");
      localStorage.setItem("user_data", JSON.stringify(sessionUser));
      setUser(sessionUser);
    } catch (error) {
      console.error("consumeMagicLink failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        requestMagicLink,
        consumeMagicLink,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a default state if used outside provider (for SSR/build compatibility)
    return {
      user: null,
      loading: false,
      isAuthenticated: false,
      requestMagicLink: async () => {},
      consumeMagicLink: async () => {},
      logout: () => {},
    };
  }
  return context;
}
