import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authAPI } from "@/lib/api";

type AuthUser = {
  id: string;
  full_name?: string;
  username?: string;
  email: string;
  role: string;
  phone_number?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  signedIn: boolean;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    full_name: string;
    username: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_USER_KEY = "mrrh_auth_user";
const AUTH_TOKEN_KEY = "mrrh_auth_token";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  });
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      setIsAuthReady(true);
      return;
    }

    authAPI
      .verify()
      .then(() => {
        setIsAuthReady(true);
      })
      .catch((error) => {
        console.warn(
          "Stored token is invalid, clearing session:",
          error.message,
        );
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setUser(null);
        setToken(null);
        setIsAuthReady(true);
      });
  }, [user, token]);

  const persistSession = (nextUser: AuthUser, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
    localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
  };

  const login = async (credentials: { email: string; password: string }) => {
    const response = await authAPI.login(credentials);
    persistSession(response.user, response.token);
  };

  const register = async (payload: {
    full_name: string;
    username: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const response = await authAPI.register(payload);
    persistSession(response.user, response.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      signedIn: Boolean(user && token),
      loading: !isAuthReady,
      login,
      register,
      logout,
    }),
    [user, token, isAuthReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
