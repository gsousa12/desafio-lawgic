// src/App.tsx
import { GlobalWrapper } from "@components/wrappers/global-wrapper/GlobalWrapper";
import { Sidebar } from "@components/sidebar/Sidebar";
import { RouterWrapper } from "@components/wrappers/router-wrapper/RouterWrapper";
import { Header } from "@components/header/Header";
import { Router } from "@components/router/Router";
import { Fragment } from "react/jsx-runtime";
import { useAuthStore } from "./stores/auth/auth.store";
import { AuthProvider } from "./components/providers/auth-provider/AuthProvider";

export const App = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <AuthProvider>
      <GlobalWrapper>
        {isAuthenticated ? (
          <Fragment>
            <Sidebar />
            <Header />
          </Fragment>
        ) : null}

        <RouterWrapper>
          <Router />
        </RouterWrapper>
      </GlobalWrapper>
    </AuthProvider>
  );
};
