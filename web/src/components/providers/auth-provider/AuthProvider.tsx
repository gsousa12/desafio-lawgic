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
// Deixe este import preparado para a futura integração:
import type { JwtPayload } from "@/common/types/api/api.types";
import { useValidateJWT } from "@/common/hooks/useValidateJWT";

type AuthContextType = {
  isBootstrapping: boolean;
  login: (user?: Partial<JwtPayload>) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const storeLogout = useAuthStore((s) => s.logout);

  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // Feature flag para ativar a checagem no /me quando você integrar de fato.
  const ENABLE_API_VALIDATION = true;

  // Bootstrap: roda apenas na montagem da aplicação (primeira visita / F5 / reabrir aba)
  useEffect(() => {
    let mounted = true;

    const doBootstrap = async () => {
      try {
        // 1) FUTURA validação via API (/me) – desativada por enquanto
        if (ENABLE_API_VALIDATION) {
          try {
            const res = await useValidateJWT();
            if (res.ok && res.data) {
              // Se ok, consideramos autenticado e setamos o user
              setAuthenticated(true);
              setUser(res.data);
            } else {
              setUser(null);
              setAuthenticated(false);
            }
          } catch {
            setUser(null);
            setAuthenticated(false);
          }
        }

        // 2) Regras de primeira navegação:
        // - Nunca deixar a URL em "/"
        // - Se autenticado e em "/login", redireciona para "/notifications"
        // - Se NÃO autenticado e em rota protegida, ProtectedRoute cuidará (sem necessidade de forçar aqui)
        const path = location.pathname;

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
          // Em primeiro load, se não autenticado em rota protegida, não tem problema
          // deixar o ProtectedRoute tratar. Opcionalmente, podemos forçar:
          // navigate("/login", { replace: true });
        }
      } finally {
        if (mounted) setIsBootstrapping(false);
      }
    };

    void doBootstrap();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // roda apenas na montagem

  const login = useCallback(
    async (user?: Partial<JwtPayload>) => {
      // Mock: apenas seta autenticado e redireciona
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
      login,
      logout,
    }),
    [isBootstrapping, login, logout]
  );

  // Opcional: bloquear render até decidir navegação inicial para evitar flash
  if (isBootstrapping) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
