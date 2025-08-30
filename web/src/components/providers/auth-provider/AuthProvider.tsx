import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth/auth.store";
import { JwtPayload } from "@/common/types/api/api.types";

type AuthContextType = {
  isBootstrapping: boolean;
  setLoged: (user?: Partial<JwtPayload>) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const storeLogout = useAuthStore((s) => s.logout);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let mounted = true;

    const doBootstrap = async () => {
      try {
        if (path === "/") {
          navigate(isAuthenticated ? "/notifications" : "/login", {
            replace: true,
          });
        } else if (path === "/login" && isAuthenticated) {
          navigate("/notifications", { replace: true });
        } else if (
          !isAuthenticated &&
          (path === "/notifications" || path === "/users")
        ) {
        }
      } finally {
        if (mounted) setIsBootstrapping(false);
      }
    };

    doBootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const setLoged = useCallback(
    async (user?: Partial<JwtPayload>) => {
      setAuthenticated(true);
      if (user) setUser(user as JwtPayload);
      navigate("/notifications", { replace: true });
    },
    [navigate, setAuthenticated, setUser]
  );

  const logout = useCallback(() => {
    storeLogout();
    navigate("/login", { replace: true });
  }, [navigate, storeLogout]);

  const value = useMemo(
    () => ({
      isBootstrapping,
      setLoged,
      logout,
    }),
    [isBootstrapping, setLoged, logout]
  );

  if (isBootstrapping) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return ctx;
};
